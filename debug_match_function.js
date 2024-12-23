import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Load environment variables
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

async function debugMatchFunction() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    // Generate a test query embedding
    const embeddingResult = await openai.embeddings.create({
      input: "What is machine learning?",
      model: "text-embedding-3-small",
      dimensions: 1536
    });
    const [{ embedding }] = embeddingResult.data;

    console.log('Query Embedding Length:', embedding.length);
    console.log('First 10 embedding values:', embedding.slice(0, 10));

    // Try to call the match_documents function
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.1,  // Very low threshold
      max_limit: 10
    });

    if (error) {
      console.error('Error calling match_documents:', error);
      return;
    }

    console.log('\nMatch Results:');
    if (data.length === 0) {
      console.log('No matching documents found');
    } else {
      data.forEach((doc, index) => {
        console.log(`\nMatch ${index + 1}:`);
        console.log(`Content: ${doc.content.slice(0, 100)}...`);
        console.log(`Match Score: ${doc.match_score}`);
        console.log(`Embedding Length: ${doc.embedding.length}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugMatchFunction();
