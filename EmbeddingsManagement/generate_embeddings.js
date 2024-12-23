import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Generate embeddings for a given text input using OpenAI's text-embedding-3-small model
 * @param {string} input - The text to generate embeddings for
 * @returns {Promise<number[]>} The generated embedding vector
 */
export async function generateEmbeddings(input) {
  // Validate input
  if (!input || input.trim() === '') {
    throw new Error('Input text cannot be empty');
  }

  // Retrieve the OpenAI API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  // Initialize OpenAI client with the API key
  const openai = new OpenAI({
    apiKey: apiKey
  });

  try {
    // Generate embeddings
    const result = await openai.embeddings.create({
      input,
      model: "text-embedding-3-small",
      dimensions: 1536  // Explicitly request 1536 dimensions
    });

    // Extract and return the embedding
    const [{ embedding }] = result.data;

    // Log additional details about the embedding
    console.log('Embedding Generation Details:');
    console.log('Input Length:', input.length);
    console.log('Embedding Length:', embedding.length);
    console.log('First 10 embedding values:', embedding.slice(0, 10));
    console.log('Last 10 embedding values:', embedding.slice(-10));

    return embedding;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

// Example usage function (optional)
async function exampleUsage() {
  try {
    const input = "The cat chases the mouse";
    const embedding = await generateEmbeddings(input);
    console.log("Generated Embedding:", embedding);
  } catch (error) {
    console.error("Failed to generate embeddings:", error);
  }
}

// Uncomment the line below to run the example
// exampleUsage();
