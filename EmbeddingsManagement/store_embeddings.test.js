import { jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the main .env file
const mainEnvPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(mainEnvPath)) {
  dotenv.config({ path: mainEnvPath });
}

// Import the function to test
import { storeEmbeddings } from './store_embeddings.js';
import { generateEmbeddings } from './generate_embeddings.js';

describe('Embedding Storage', () => {
  // Increase timeout for database operations
  jest.setTimeout(30000);

  // Check if we have all necessary credentials
  const hasSupabaseCredentials = 
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Skip tests if credentials are missing
  (hasSupabaseCredentials ? describe : describe.skip)('with valid Supabase credentials', () => {
    let supabase;

    // Setup Supabase client before tests
    beforeAll(() => {
      supabase = createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    });

    test('stores embeddings in the correct Supabase database', async () => {
      // Arrange
      const testContent = 'Test embedding storage in Supabase';
      
      // Generate embeddings
      const embedding = await generateEmbeddings(testContent);

      // Act: Store embeddings
      const { success, error } = await storeEmbeddings(testContent, embedding);

      // Log detailed error information if storage fails
      if (!success) {
        console.error('Detailed error:', error);
        console.log('Supabase URL:', process.env.SUPABASE_URL);
        console.log('Embedding:', embedding);
      }

      // Assert: Check storage success
      expect(success).toBe(true);
      expect(error).toBeNull();

      // Additional verification: Retrieve from database
      const { data: retrievedDocuments, error: queryError } = await supabase
        .from('documents')
        .select('content, embedding')
        .eq('content', testContent)
        .limit(1);

      // Log query error details and retrieved documents
      if (queryError) {
        console.error('Query error details:', queryError);
      }
      console.log('Retrieved documents:', retrievedDocuments);

      // Verify database retrieval
      expect(queryError).toBeNull();
      expect(retrievedDocuments).toBeDefined();
      expect(retrievedDocuments.length).toBeGreaterThan(0);

      // Check if stored embedding matches generated embedding
      const storedDocument = retrievedDocuments[0];
      expect(storedDocument.content).toBe(testContent);
      
      // Parse the embedding string into an array of numbers
      let parsedEmbedding;
      if (typeof storedDocument.embedding === 'string') {
        // Remove brackets and split by comma
        parsedEmbedding = storedDocument.embedding
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(val => parseFloat(val.trim()));
      } else {
        parsedEmbedding = storedDocument.embedding;
      }

      // Compare embeddings (allowing for some floating-point imprecision)
      console.log('Parsed embedding length:', parsedEmbedding.length);
      console.log('Original embedding length:', embedding.length);
      
      expect(parsedEmbedding.length).toBe(embedding.length);
      parsedEmbedding.forEach((value, index) => {
        expect(Math.abs(value - embedding[index])).toBeLessThan(1e-3);
      });
    });

    test('handles errors during embedding storage', async () => {
      // Arrange
      const invalidContent = ''; // Empty content should trigger validation
      const invalidEmbedding = []; // Invalid embedding

      // Act & Assert
      await expect(storeEmbeddings(invalidContent, invalidEmbedding))
        .rejects.toThrow();
    });
  });

  describe('environment configuration', () => {
    test('checks for Supabase credentials', () => {
      console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
      console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');

      if (!hasSupabaseCredentials) {
        console.warn('Warning: Incomplete Supabase credentials. Skipping database tests.');
      }
    });
  });
});

export default {
  testEnvironment: 'node',
  transform: {},
};
