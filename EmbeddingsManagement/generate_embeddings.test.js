import { jest } from '@jest/globals';
import OpenAI from 'openai';
import { generateEmbeddings } from './generate_embeddings.js';
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

describe('generateEmbeddings', () => {
  // Timeout increased for API calls
  jest.setTimeout(30000);

  // Skip tests if no API key is provided
  const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');

  (hasApiKey ? describe : describe.skip)('with valid API key', () => {
    test('successfully generates embeddings for a simple text input', async () => {
      // Arrange
      const input = 'The cat chases the mouse';

      // Act
      const result = await generateEmbeddings(input);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles long input text', async () => {
      // Arrange
      const longInput = 'a'.repeat(10000); // Very long input

      // Act
      const result = await generateEmbeddings(longInput);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('handles special characters and unicode', async () => {
      // Arrange
      const unicodeInput = 'こんにちは世界! Hello, world! 🌍';

      // Act
      const result = await generateEmbeddings(unicodeInput);

      // Assert
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('input validation', () => {
    test('throws error when input is empty', async () => {
      // Arrange
      const emptyInput = '';

      // Act & Assert
      await expect(generateEmbeddings(emptyInput)).rejects.toThrow('Input text cannot be empty');
    });
  });

  describe('environment configuration', () => {
    test('checks for OpenAI API key', () => {
      const apiKey = process.env.OPENAI_API_KEY;
      
      console.log('OpenAI API Key status:', apiKey ? 'Key present' : 'No key');
      
      if (!hasApiKey) {
        console.warn('Warning: No valid OpenAI API key found. Skipping API-dependent tests.');
      }
    });
  });
});

export default {
  testEnvironment: 'node',
  transform: {},
};
