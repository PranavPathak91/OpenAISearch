import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

async function listTables() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // SQL query to list all tables in the public schema
    const { data, error } = await supabase.sql(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (error) {
      console.error('Error listing tables:', error);
      return;
    }

    console.log('Available tables:');
    data.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
listTables();
