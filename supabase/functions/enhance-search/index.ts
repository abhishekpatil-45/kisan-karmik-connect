
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters, searchTarget } = await req.json();
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Search request received:', { filters, searchTarget });
    
    // Start building the query to fetch profiles
    let query = supabase.from('profiles')
      .select('*');
    
    // Filter by role based on searchTarget
    if (searchTarget === 'laborers') {
      query = query.eq('role', 'laborer');
    } else if (searchTarget === 'farmers') {
      query = query.eq('role', 'farmer');
    }
    
    // Filter by keyword if provided (search in name and location)
    if (filters.keyword && filters.keyword.trim() !== '') {
      query = query.or(`full_name.ilike.%${filters.keyword}%,location.ilike.%${filters.keyword}%`);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // If we have OpenAI API key, we can use it to enhance our search results
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    let enhancedResults = data;
    
    if (openAIKey && data.length > 0) {
      try {
        console.log('Using OpenAI to enhance search results');
        // Use OpenAI to rank and enhance the results
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: filters.keyword || "agricultural worker",
            model: "text-embedding-3-small"
          })
        });
        
        if (response.ok) {
          const embedResult = await response.json();
          const searchEmbedding = embedResult.data[0].embedding;
          
          // We'd typically store embeddings for profiles in the database
          // For now, we'll just rerank results based on basic matching score
          enhancedResults = data.sort((a, b) => {
            const scoreA = calculateRelevanceScore(a, filters);
            const scoreB = calculateRelevanceScore(b, filters);
            return scoreB - scoreA;
          });
        }
      } catch (aiError) {
        console.error('Error enhancing results with OpenAI:', aiError);
        // Fall back to regular results if AI enhancement fails
      }
    }
    
    // Return the results
    return new Response(JSON.stringify({ 
      data: enhancedResults || data, 
      count: enhancedResults?.length || data?.length || 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in search function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper function to calculate relevance score based on filters
function calculateRelevanceScore(profile, filters) {
  let score = 0;
  
  // Match by keyword in name or location
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    if (profile.full_name?.toLowerCase().includes(keyword)) {
      score += 5;
    }
    if (profile.location?.toLowerCase().includes(keyword)) {
      score += 3;
    }
  }
  
  // More advanced scoring could be implemented based on skills, experience, etc.
  // This would require additional profile fields to be stored in the database
  
  return score;
}
