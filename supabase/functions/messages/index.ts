
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { method, action, data } = await req.json();

    switch (method) {
      case "GET_CONVERSATIONS": {
        const { userId } = data;
        
        // Get conversations where the user is either the sender or receiver
        const { data: conversations, error } = await supabaseClient
          .from("conversations")
          .select(`
            id, 
            updated_at,
            profiles!sender_id(id, full_name, role),
            profiles!receiver_id(id, full_name, role)
          `)
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        return new Response(JSON.stringify({ conversations }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "GET_MESSAGES": {
        const { conversationId } = data;
        
        // Get messages from a specific conversation
        const { data: messages, error } = await supabaseClient
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        return new Response(JSON.stringify({ messages }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "SEND_MESSAGE": {
        const { sender_id, receiver_id, content } = data;
        
        // Check if conversation exists
        let conversationId;
        const { data: existingConvo, error: convoError } = await supabaseClient
          .from("conversations")
          .select("id")
          .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
          .maybeSingle();

        if (convoError) throw convoError;

        // If conversation doesn't exist, create one
        if (!existingConvo) {
          const { data: newConvo, error: createError } = await supabaseClient
            .from("conversations")
            .insert({
              sender_id,
              receiver_id,
            })
            .select('id')
            .single();

          if (createError) throw createError;
          conversationId = newConvo.id;
        } else {
          conversationId = existingConvo.id;
        }

        // Insert message
        const { data: message, error: messageError } = await supabaseClient
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id,
            content,
          })
          .select()
          .single();

        if (messageError) throw messageError;

        // Update conversation's updated_at timestamp
        await supabaseClient
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        return new Response(JSON.stringify({ message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405,
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
