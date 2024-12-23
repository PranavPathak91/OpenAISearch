# Vector Similarity Search Setup

## Prerequisites
- Supabase project
- PostgreSQL database with vector extension support

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
     embedding vector(1536) NOT NULL
   );
   ```

3. **Create Match Documents Function**
   Run the contents of `vector_search.sql`

## Function Parameters
- `query_embedding`: Vector embedding to search against (length 1536)
- `match_threshold`: Similarity threshold (default 0.8)
- `max_limit`: Maximum number of results (default 5)

## Example Usage
```sql
SELECT * FROM match_documents(
  query_embedding := '[0.1, 0.2, ...]', 
  match_threshold := 0.7, 
  max_limit := 3
);
```

## Troubleshooting
- Ensure vector extension is installed
- Verify embedding dimensions match (1536)
- Check that documents table contains embeddings
