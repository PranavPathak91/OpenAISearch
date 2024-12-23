# OpenAI Embeddings Generator, Storage, and Semantic Search

## Prerequisites
- Ensure you have a Deno or Node.js runtime installed
- Obtain an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
- Obtain a Supabase project URL and Service Role Key
- Create a Postgres function `match_documents` in your Supabase project

## Setup
1. Set your environment variables in a `.env` file:
   ```bash
   OPENAI_API_KEY='your-openai-api-key'
   SUPABASE_URL='your-supabase-project-url'
   SUPABASE_SERVICE_ROLE_KEY='your-supabase-service-role-key'
   ```

2. Create Postgres Function in Supabase SQL Editor:
   ```sql
   create function match_documents (
     query_embedding vector (1536),
     match_threshold float
   )
   returns setof documents
   language plpgsql
   as $$
   begin
     return query
     select *
     from documents
     where documents.embedding <#> query_embedding < -match_threshold
     order by documents.embedding <#> query_embedding;
   end;
   $$;
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Generating Embeddings
```javascript
import { generateEmbeddings } from './generate_embeddings.js';

async function main() {
  try {
    const input = "Your text to generate embeddings for";
    const embedding = await generateEmbeddings(input);
    console.log(embedding);
  } catch (error) {
    console.error("Embedding generation failed:", error);
  }
}

main();
```

### Storing Embeddings in Supabase
```javascript
import { generateEmbeddings } from './generate_embeddings.js';
import { storeEmbeddings } from './store_embeddings.js';

async function main() {
  try {
    const input = "Your text to store";
    const embedding = await generateEmbeddings(input);
    await storeEmbeddings(input, embedding);
  } catch (error) {
    console.error("Embedding storage failed:", error);
  }
}

main();
```

### Performing Semantic Search
```javascript
import { semanticSearch } from './semantic_search.js';

async function main() {
  try {
    const query = "What are you looking for?";
    const { documents } = await semanticSearch(query);
    
    documents.forEach(doc => {
      console.log("Matching Document:", doc.content);
    });
  } catch (error) {
    console.error("Semantic search failed:", error);
  }
}

main();
```

## Scripts
- `npm run example`: Generate example embeddings
- `npm run store`: Store example embeddings in Supabase
- `npm run search`: Perform example semantic search

## Notes
- Requires Supabase `documents` table with `content` and `embedding` columns
- Uses `text-embedding-3-small` model
- Embeddings are returned as a numeric array
- Requires `OPENAI_API_KEY` and Supabase credentials
- Adjust `match_threshold` in semantic search based on your data

## Error Handling
- Throws an error if API keys are not set
- Logs and handles Supabase insertion and search errors
- Provides detailed error messages for debugging
