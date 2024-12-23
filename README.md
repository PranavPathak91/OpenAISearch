# Bring Your Own Browser (BYOB) Web Search Tool

## Overview
This BYOB tool enables web browsing and summarization using Python, OpenAI, and Google Custom Search API. It helps retrieve up-to-date information beyond an LLM's knowledge cutoff.

## Features
- Web search using Google Custom Search API
- Web page content retrieval and cleaning
- AI-powered content summarization
- Retrieval-Augmented Generation (RAG) response

## Prerequisites
- Python 3.8+
- OpenAI API Key
- Google Custom Search API Key
- Google Custom Search Engine ID

## Installation
1. Clone the repository
2. Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id
```

## Usage
```python
from byob_search import BYOBTool

search_query = "List the latest OpenAI product launches"
byob_tool = BYOBTool()
result = byob_tool.run(search_query, site_filter="https://openai.com")

print(result['rag_response'])
```

## Disclaimer
Ensure compliance with all applicable laws and service terms when using web search and scraping technologies.
