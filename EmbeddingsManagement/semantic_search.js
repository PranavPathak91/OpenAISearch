import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import OpenAI from "openai";

// Load environment variables
config();

/**
 * Perform semantic search on documents using OpenAI embeddings
 * @param {string} query - The search query text
 * @param {number} [matchThreshold=0.1] - Similarity threshold for matching documents
 * @param {number} [limit=5] - Maximum number of documents to return
 * @returns {Promise<{documents: any[], error: Error|null}>} Search results
 */
export async function semanticSearch(query, matchThreshold = 0.1, limit = 5) {
  // Validate input
  if (!query || query.trim() === '') {
    throw new Error('Query cannot be empty');
  }

  // Retrieve Supabase and OpenAI credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceRoleKey || !openaiApiKey) {
    throw new Error("Missing environment variables. Check your .env file.");
  }

  // Create OpenAI client
  const openai = new OpenAI({ apiKey: openaiApiKey });

  try {
    // Generate embedding for the query
    const embeddingResult = await openai.embeddings.create({
      input: query,
      model: "text-embedding-3-small",
      dimensions: 1536  // Explicitly request 1536 dimensions
    });
    const [{ embedding }] = embeddingResult.data;

    console.log("Query:", query);
    console.log("Query Embedding Length:", embedding.length);
    console.log("Query Embedding First 10 values:", embedding.slice(0, 10));
    console.log("Query Embedding Last 10 values:", embedding.slice(-10));

    // Validate embedding dimensions
    if (embedding.length !== 1536) {
      throw new Error(`Expected 1536 embedding dimensions, got ${embedding.length}`);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // Fetch total number of documents for context
    const { count: totalDocuments, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error("Error counting documents:", countError);
    } else {
      console.log(`Total documents in database: ${totalDocuments}`);
    }

    // Perform semantic search using Supabase RPC
    const { data: documents, error: matchError } = await supabase
      .rpc("match_documents", {
        query_embedding: embedding,
        match_threshold: matchThreshold,
        max_limit: limit
      });

    if (matchError) {
      console.error("Semantic Search Error:", matchError);
      throw matchError;
    }

    console.log(`Found ${documents.length} matching documents`);
    documents.forEach((doc, index) => {
      console.log(`Match ${index + 1}:`, {
        id: doc.id,
        content: doc.content.slice(0, 100) + "...",
        matchScore: doc.match_score
      });
    });

    return { documents, error: null };
  } catch (error) {
    console.error("Unexpected error in semantic search:", error);
    throw error;
  }
}

// Example usage function
async function exampleUsage() {
  try {
    // Example search query
    const query = "What does the cat chase?";
    
    // Perform semantic search
    const { documents, error } = await semanticSearch(query);
    
    if (error) {
      console.error("Search failed:", error);
      return;
    }
    
    // Display matching documents
    console.log("Matching Documents:");
    documents.forEach(doc => {
      console.log(`- ${doc.content}`);
    });
    
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Uncomment the line below to run the example
// exampleUsage();
