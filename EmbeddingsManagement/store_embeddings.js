import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Store text and its embedding in Supabase database
 * @param {string} content - The text content to store
 * @param {number[]} embedding - The embedding vector generated for the content
 * @returns {Promise<{success: boolean, data: any, error: Error|null}>} - Result of the database insertion
 */
export async function storeEmbeddings(content, embedding) {
  // Retrieve Supabase credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validate inputs
  if (!content || content.trim() === '') {
    throw new Error('Content cannot be empty');
  }

  if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Invalid embedding');
  }

  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase URL or Service Role Key is missing. Check your .env file.");
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // Insert content and embedding into the 'documents' table
    const { data, error } = await supabase.from("documents").insert({
      content,
      embedding: embedding, // Store the original embedding without modification
    }).select(); // Add .select() to return inserted data

    // Check for insertion errors
    if (error) {
      console.error("Supabase Insertion Error:", error);
      throw error;
    }

    console.log("Successfully stored embedding for content:", content.slice(0, 50) + "...");
    console.log("Embedding dimensions:", embedding.length);

    return { success: true, data, error: null };
  } catch (err) {
    console.error("Error storing embeddings:", err);
    return { success: false, data: null, error: err };
  }
}

// Example usage function
async function exampleUsage() {
  try {
    // Import the generateEmbeddings function from the previous file
    const { generateEmbeddings } = await import('./generate_embeddings.js');

    // Example text to generate and store embeddings for
    const input = "The cat chases the mouse";
    
    // Generate embeddings
    const embedding = await generateEmbeddings(input);
    
    // Store embeddings
    const result = await storeEmbeddings(input, embedding);
    
    if (result.success) {
      console.log("Embedding generation and storage completed successfully");
    } else {
      console.error("Failed to store embedding:", result.error);
    }
  } catch (error) {
    console.error("Error in example usage:", error);
  }
}

// Uncomment the line below to run the example
// exampleUsage();
