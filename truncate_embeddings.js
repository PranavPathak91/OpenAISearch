import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

async function truncateEmbeddings() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Fetch documents with their embeddings
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, content, embedding');
    
    if (fetchError) {
      console.error('Error fetching documents:', fetchError);
      return;
    }

    console.log(`Truncating embeddings for ${documents.length} documents...`);

    // Truncate embeddings to 1536 dimensions
    for (const doc of documents) {
      if (doc.embedding && doc.embedding.length > 1536) {
        const truncatedEmbedding = doc.embedding.slice(0, 1536);

        const { error: updateError } = await supabase
          .from('documents')
          .update({ embedding: truncatedEmbedding })
          .eq('id', doc.id);
        
        if (updateError) {
          console.error(`Error updating document ${doc.id}:`, updateError);
        } else {
          console.log(`Truncated embedding for document ${doc.id}`);
        }
      }
    }

    console.log('Embedding truncation complete.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

truncateEmbeddings();
