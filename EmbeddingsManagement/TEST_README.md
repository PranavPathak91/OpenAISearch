# Embeddings Generation Test Suite

## Overview
This test suite provides comprehensive testing for the `generateEmbeddings` function in the OpenAI Embeddings Generator.

## Test Cases Covered
1. Successful Embedding Generation
   - Simple text input
   - Verifies correct embedding generation
   - Checks OpenAI API method calls

2. Input Validation
   - Empty input handling
   - Throws appropriate error

3. Environment Configuration
   - API key presence check
   - Handles missing API key

4. Input Complexity
   - Long text input
   - Unicode and special characters
   - Consistent embedding size

5. Error Handling
   - OpenAI API error scenarios
   - Proper error propagation

## Prerequisites
- Node.js 14+ 
- Jest testing framework

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

## Running Tests
- Run all tests:
  ```bash
  npm test
  ```

- Watch mode (auto-rerun on changes):
  ```bash
  npm run test:watch
  ```

## Test Configuration
- Uses ES Module support
- Mocks OpenAI API calls
- Runs in Node.js environment

## Best Practices
- Isolates tests from external dependencies
- Provides comprehensive coverage
- Uses descriptive test cases
- Handles various input scenarios

## Troubleshooting
- Ensure `.env` file is configured
- Check Node.js and npm versions
- Verify OpenAI API key is valid
