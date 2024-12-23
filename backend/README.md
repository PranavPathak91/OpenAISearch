# BYOB Backend API

## Overview
This is a Flask-based backend service for the BYOB (Bring Your Own Browser) Web Search Tool. It provides a RESTful API interface that:
- Exposes web search functionality
- Manages communication between frontend and BYOB tool
- Handles request validation and error management

## Features
- `/api/search` endpoint for web searches
- `/api/health` health check endpoint
- CORS support
- Comprehensive error handling
- Logging of search requests and errors

## Prerequisites
- Python 3.8+
- Dependencies listed in `requirements.txt`

## Installation
1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure `.env` file is configured with necessary API keys in the parent directory

## Running the Backend
### Development Server
```bash
python byob_api.py
```

### Production Server (Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 byob_api:BYOBBackend().app
```

## API Endpoints
### Search Endpoint
- **URL**: `/api/search`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "query": "search term",
    "site_filter": "optional site filter"
  }
  ```
- **Response**:
  ```json
  {
    "refined_search_term": "...",
    "comprehensive_rag_response": "...",
    "processed_search_results": [...]
  }
  ```

### Health Check Endpoint
- **URL**: `/api/health`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "healthy",
    "message": "BYOB Backend is running",
    "tool_initialized": true
  }
  ```

## Notes
- Requires active internet connection
- API keys for OpenAI and Google Custom Search must be configured
- Results may vary based on current web content
