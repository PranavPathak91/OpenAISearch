# Vector Search Setup Guide

## Prerequisites
- PostgreSQL with Supabase
- `pgvector` extension

## Database Setup Steps

1. **Enable Vector Extension**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Create Documents Table**
   ```sql
   CREATE TABLE documents (
     id BIGSERIAL PRIMARY KEY,
     content TEXT NOT NULL,
     embedding vector(1536)
   );
   ```

3. **Create Match Documents Function**
   ```sql
   CREATE OR REPLACE FUNCTION match_documents(
     query_embedding vector(1536),
     match_threshold float DEFAULT 0.5,
     max_limit int DEFAULT 5
   )
   RETURNS TABLE (
     id bigint,
     content text,
     embedding vector(1536),
     match_score float
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       documents.id,
       documents.content,
       documents.embedding,
       1 - (documents.embedding <=> query_embedding) AS match_score
     FROM documents
     WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
     ORDER BY match_score DESC
     LIMIT max_limit;
   END;
   $$;
   ```

## Troubleshooting
- Ensure you have the `pgvector` extension installed
- Verify your Supabase connection details in `.env`
- Check that the vector dimensions match (1536)

## Performance Tips
- Index your embedding column for faster searches
- Adjust `match_threshold` based on your data
