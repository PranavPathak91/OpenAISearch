import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

async function verifyEmbeddings() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Fetch documents with their embeddings
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, content, embedding');
    
    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }

    console.log(`Total documents: ${documents.length}`);

    // Analyze embeddings
    const embeddingLengths = new Set();
    documents.forEach((doc, index) => {
      if (doc.embedding) {
        embeddingLengths.add(doc.embedding.length);
      }
    });

    console.log('Unique Embedding Lengths:', [...embeddingLengths]);

    // Detailed analysis of first few documents
    console.log('\nDetailed Embedding Analysis:');
    documents.slice(0, 5).forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log(`ID: ${doc.id}`);
      console.log(`Content: ${doc.content.slice(0, 100)}...`);
      console.log(`Embedding Length: ${doc.embedding ? doc.embedding.length : 'N/A'}`);
      console.log(`First 5 embedding values: ${doc.embedding ? doc.embedding.slice(0, 5) : 'N/A'}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyEmbeddings();
