-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the documents table with vector column
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536)
);

-- Create or replace the match_documents function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.1,  -- Lower the default threshold
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
