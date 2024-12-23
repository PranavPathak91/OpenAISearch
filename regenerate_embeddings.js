import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Load environment variables
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

async function regenerateEmbeddings() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    // Fetch documents
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, content');
    
    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return;
    }

    console.log(`Regenerating embeddings for ${documents.length} documents...`);

    // Regenerate embeddings
    for (const doc of documents) {
      try {
        const embeddingResult = await openai.embeddings.create({
          input: doc.content,
          model: "text-embedding-3-small",
          dimensions: 1536
        });
        const [{ embedding }] = embeddingResult.data;

        // Explicitly truncate to 1536 dimensions
        const truncatedEmbedding = embedding.slice(0, 1536);

        // Update the document with the truncated embedding
        const { error: updateError } = await supabase
          .from('documents')
          .update({ embedding: truncatedEmbedding })
          .eq('id', doc.id);
        
        if (updateError) {
          console.error(`Error updating document ${doc.id}:`, updateError);
        } else {
          console.log(`Updated embedding for document ${doc.id}`);
        }
      } catch (embeddingError) {
        console.error(`Error generating embedding for document ${doc.id}:`, embeddingError);
      }
    }

    console.log('Embedding regeneration complete.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

regenerateEmbeddings();
