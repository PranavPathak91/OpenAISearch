# BYOB Web Research Tool - Frontend

## Overview
This is a lightweight frontend for the BYOB (Bring Your Own Browser) Web Search Tool. It provides:
- Tkinter-based GUI for web search
- Embeddings Test Page for semantic search experiments

## Features
- User-friendly GUI for web research
- Embeddings Test Page for:
  - Generating OpenAI embeddings
  - Storing embeddings in Supabase
  - Performing semantic search
- Real-time search with AI-powered query refinement
- Comprehensive research results display

## Prerequisites
- Python 3.8+
- Tkinter (usually comes pre-installed with Python)
- Node.js for Embeddings Test Page
- Dependencies listed in `requirements.txt`

## Installation
1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install JavaScript dependencies for Embeddings Test Page:
   ```bash
   npm install
   ```

4. Configure environment variables:
   - Create `.env` file with:
     ```
     OPENAI_API_KEY=your_openai_api_key
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

## Running the Applications

### Tkinter Web Research Frontend
```bash
python byob_frontend.py
```

### Embeddings Test Page
Open `embeddings_test.html` in a modern browser that supports ES6 modules.

Recommended: Use a local development server like `python -m http.server` or VS Code's Live Server extension.

## Embeddings Test Page Usage
1. Generate Embeddings:
   - Enter text in the first section
   - Click "Generate and Store Embeddings"

2. Semantic Search:
   - Enter search keywords
   - Click "Search"
   - View matching documents with approximate match scores

## Notes
- Requires active internet connection
- API keys for OpenAI and Supabase must be configured
- Results may vary based on your document corpus

## Troubleshooting
- Ensure all dependencies are installed
- Check console for detailed error messages
- Verify API keys and environment variables
