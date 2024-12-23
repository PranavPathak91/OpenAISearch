import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

async function listTables() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Try to query a known table to verify connection
    const { data, error } = await supabase
      .from('documents')
      .select('id', { count: 'exact' });
    
    if (error) {
      console.error('Error querying documents table:', error);
      return;
    }

    console.log('Successfully connected to Supabase');
    console.log('Documents table exists');
    console.log('Total documents:', data.length);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listTables();
