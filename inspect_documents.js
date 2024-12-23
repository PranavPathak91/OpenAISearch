import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

async function inspectDocuments() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Fetch a sample of documents with their embeddings
    const { data, error } = await supabase
      .from('documents')
      .select('id, content, embedding')
      .limit(10);
    
    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }

    console.log('Sample Documents:');
    data.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log(`ID: ${doc.id}`);
      console.log(`Content: ${doc.content.slice(0, 100)}...`);
      console.log(`Embedding Length: ${doc.embedding ? doc.embedding.length : 'N/A'}`);
      console.log(`First 5 embedding values: ${doc.embedding ? doc.embedding.slice(0, 5) : 'N/A'}`);
    });

    // Check embedding dimensions
    const embeddingDimensions = data
      .filter(doc => doc.embedding)
      .map(doc => doc.embedding.length);
    
    const uniqueDimensions = [...new Set(embeddingDimensions)];
    console.log('\nUnique Embedding Dimensions:', uniqueDimensions);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

inspectDocuments();
