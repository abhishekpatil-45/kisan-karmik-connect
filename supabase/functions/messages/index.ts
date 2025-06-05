
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY FIX: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // SECURITY FIX: Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { action, data } = body;

    // SECURITY FIX: Input validation
    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid action parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let result;

    switch (action) {
      case 'getConversations':
        // SECURITY FIX: Only get conversations for authenticated user
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select(`
            *,
            messages(
              id,
              content,
              created_at,
              sender_id
            )
          `)
          .or(`farmer_id.eq.${user.id},laborer_id.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (convError) {
          throw convError;
        }

        result = { conversations };
        break;

      case 'sendMessage':
        // SECURITY FIX: Validate message data
        if (!data || !data.conversation_id || !data.content) {
          return new Response(
            JSON.stringify({ error: 'Missing required message data' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // SECURITY FIX: Verify user is part of conversation before sending message
        const { data: conversation, error: convCheckError } = await supabase
          .from('conversations')
          .select('farmer_id, laborer_id')
          .eq('id', data.conversation_id)
          .single();

        if (convCheckError || !conversation) {
          return new Response(
            JSON.stringify({ error: 'Conversation not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // SECURITY FIX: Ensure user is authorized to send message to this conversation
        if (conversation.farmer_id !== user.id && conversation.laborer_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized to send message to this conversation' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Insert message with authenticated user as sender
        const { data: message, error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: data.conversation_id,
            sender_id: user.id,
            content: data.content.trim(), // Basic sanitization
            message_type: data.message_type || 'text'
          })
          .select()
          .single();

        if (messageError) {
          throw messageError;
        }

        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', data.conversation_id);

        result = { message };
        break;

      case 'markAsRead':
        // SECURITY FIX: Validate data and user authorization
        if (!data || !data.message_id) {
          return new Response(
            JSON.stringify({ error: 'Missing message_id' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // SECURITY FIX: Only mark as read if user is part of the conversation
        const { data: messageToMark, error: messageCheckError } = await supabase
          .from('messages')
          .select(`
            *,
            conversations!inner(farmer_id, laborer_id)
          `)
          .eq('id', data.message_id)
          .single();

        if (messageCheckError || !messageToMark) {
          return new Response(
            JSON.stringify({ error: 'Message not found' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const conv = messageToMark.conversations;
        if (conv.farmer_id !== user.id && conv.laborer_id !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized to mark this message as read' }),
            { 
              status: 403, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const { error: readError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('id', data.message_id);

        if (readError) {
          throw readError;
        }

        result = { success: true };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    // SECURITY FIX: Don't expose detailed error information
    const errorMessage = error instanceof Error ? 'Internal server error' : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
