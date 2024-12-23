#!/usr/bin/env python3
"""
BYOB (Bring Your Own Browser) Web Search Tool

This script is like a digital research assistant that helps you explore the internet 
and gather information using artificial intelligence. It does this by:
1. Taking your search query
2. Finding relevant web pages
3. Reading and summarizing those pages
4. Creating a comprehensive report

Key Components:
- Web Search: Uses Google Custom Search API to find relevant web pages
- Content Retrieval: Extracts text from web pages
- AI Summarization: Uses OpenAI to create concise, meaningful summaries
- Retrieval-Augmented Generation (RAG): Combines search results into a coherent narrative
"""

# Import necessary libraries for web searching, data processing, and AI interactions
import os      # For interacting with the operating system (e.g., reading environment variables)
import json    # For handling structured data
import requests  # For making web requests
from bs4 import BeautifulSoup  # For parsing and cleaning HTML content
from dotenv import load_dotenv  # For loading environment variables from a .env file
from openai import OpenAI  # For interacting with OpenAI's language models
import httpx   # For making HTTP requests (used by OpenAI client)

# Load environment variables from .env file
# This allows us to keep sensitive information like API keys secure
load_dotenv()

class BYOBTool:
    """
    A comprehensive AI-powered web research tool that combines web search, 
    content retrieval, and intelligent summarization.

    Think of this class like a super-smart research assistant that can:
    - Understand your search query
    - Find relevant web pages
    - Read and extract key information
    - Summarize findings
    - Create a narrative report
    """

    def __init__(self, config=None):
        """
        Initialize the BYOB Tool with configuration settings.

        :param config: Dictionary of configuration parameters with defaults
        """
        # Default configuration
        self.config = {
            # Search configuration
            'max_search_results': 10,  # Number of search results to retrieve
            'search_depth': 10,  # Depth of search processing
            
            # Content retrieval configuration
            'max_content_chars': 50000,  # Maximum characters to retrieve from a webpage
            
            # Summarization configuration
            'max_summary_chars': 1000,  # Maximum characters for AI summary
            
            # AI model configuration
            'summary_model': 'gpt-4o-mini',  # Default AI model for summarization
            
            # Optional filters
            'website_filter': None,  # Optional website filter for search
            
            # Recency configuration
            'recency': 'w1'  # Default recency filter set to last week
                             # Format: '[age][period]' 
                             # Examples: 'w1' (last week), 'd7' (last 7 days), 'm3' (last 3 months)
        }
        
        # Update default configuration with provided config
        if config:
            self.config.update(config)
        
        # Set up OpenAI client for AI-powered text processing
        openai_key = os.getenv('OPENAI_API_KEY')
        if not openai_key:
            raise ValueError("OpenAI API Key is required. Please set OPENAI_API_KEY in .env file.")
        
        # Create OpenAI client with a custom HTTP client to handle connections
        self.openai_client = OpenAI(api_key=openai_key, http_client=httpx.Client())
        
        # Set up Google Search API credentials
        self.api_key = os.getenv('GOOGLE_API_KEY')
        self.cse_id = os.getenv('GOOGLE_CSE_ID')
        
        # Validate that we have the necessary search credentials
        if not self.api_key or not self.cse_id:
            raise ValueError("Missing Google API key or Custom Search Engine ID. Please check your .env file.")

    def search(self, search_query, max_search_results=None, website_filter=None, recency=None):
        """
        Perform a web search using Google Custom Search API.

        This method is like asking a librarian to find books on a specific topic:
        - Takes your search query
        - Finds relevant web pages
        - Returns a list of search results with links and snippets

        :param search_query: Search query (what you want to find)
        :param max_search_results: Number of search results to return
        :param website_filter: Optional parameter to search within a specific website
        :param recency: Restrict results by recency. 
                        Specification: '[age][period]'
                        - age: Number representing time span
                        - period: 
                            'd': days
                            'w': weeks
                            'm': months
                            'y': years
                        Examples:
                        - 'w1': Last week
                        - 'd7': Last 7 days
                        - 'm3': Last 3 months
        :return: List of search results
        """
        # Construct the API request to Google Custom Search
        google_search_url = "https://www.googleapis.com/customsearch/v1"
        search_params = {
            'key': self.api_key,
            'cx': self.cse_id,
            'q': search_query,
            'num': max_search_results or self.config['max_search_results']
        }
        
        # Add site filter if specified (like searching only within a specific website)
        if website_filter:
            search_params['siteSearch'] = website_filter
        
        # Add date restriction if specified
        if recency:
            search_params['dateRestrict'] = recency
        
        try:
            # Send the search request to Google
            search_response = requests.get(google_search_url, params=search_params)
            search_response.raise_for_status()  # Raise an error for bad responses
            
            # Extract and return search results
            search_results = search_response.json().get('items', [])
            return search_results
        
        except requests.RequestException as search_error:
            # Handle any errors that occur during the search
            print(f"Web Search Error: {search_error}")
            return []

    def retrieve_content(self, webpage_url, max_content_chars=None):
        """
        Retrieve and clean web page content.

        This method is like having an assistant read a webpage and extract 
        the most important text:
        - Fetches the webpage
        - Removes HTML tags
        - Cleans up the text
        - Limits the amount of text to process

        :param webpage_url: Web page URL to scrape
        :param max_content_chars: Maximum number of characters to retrieve
        :return: Cleaned text content
        """
        try:
            # Fetch the webpage content
            webpage_response = requests.get(webpage_url, timeout=10)
            webpage_response.raise_for_status()
            
            # Use BeautifulSoup to parse and extract text
            webpage_soup = BeautifulSoup(webpage_response.text, 'html.parser')
            
            # Extract text and remove extra whitespace
            webpage_text = ' '.join(webpage_soup.get_text().split())
            
            # Truncate text to specified maximum length
            return webpage_text[:max_content_chars or self.config['max_content_chars']]
        
        except (requests.RequestException, Exception) as content_retrieval_error:
            # Handle any errors in retrieving or processing the webpage
            print(f"Webpage Content Retrieval Error for {webpage_url}: {content_retrieval_error}")
            return None

    def summarize_content(self, webpage_content, search_query, max_summary_chars=None):
        """
        Summarize web page content using OpenAI's language model.

        This is like having an AI assistant read a long article and 
        create a concise summary that highlights the most important points.

        :param webpage_content: Text content to summarize
        :param search_query: Original search query (for context)
        :param max_summary_chars: Maximum summary length
        :return: Summarized content
        """
        # Create a prompt that guides the AI in summarizing the content
        summary_prompt = (
            f"You are an AI assistant tasked with summarizing content relevant to '{search_query}'. "
            f"Please provide a concise summary in {max_summary_chars or self.config['max_summary_chars']} characters or less."
        )
        
        try:
            # Use OpenAI to generate a summary
            summary_response = self.openai_client.chat.completions.create(
                model=self.config['summary_model'],  # Use a compact, efficient AI model
                messages=[
                    {"role": "system", "content": summary_prompt},
                    {"role": "user", "content": webpage_content}
                ]
            )
            return summary_response.choices[0].message.content
        
        except Exception as summary_generation_error:
            # Handle any errors in summarization
            print(f"Content Summarization Error: {summary_generation_error}")
            return None

    def get_search_results(self, search_items, search_query, max_summary_chars=None):
        """
        Process search results by retrieving and summarizing content.

        This method is like having an assistant:
        1. Visit each search result
        2. Read the webpage
        3. Create a short summary
        4. Compile these summaries into a list

        :param search_items: List of search result items
        :param search_query: Original search query
        :param max_summary_chars: Maximum summary length
        :return: List of processed search results
        """
        processed_search_results = []
        for result_index, search_result in enumerate(search_items, start=1):
            webpage_url = search_result.get('link')
            result_snippet = search_result.get('snippet', '')
            
            # Retrieve full content of the webpage
            webpage_content = self.retrieve_content(webpage_url)
            if webpage_content is None:
                continue
            
            # Summarize the content
            webpage_summary = self.summarize_content(webpage_content, search_query, max_summary_chars)
            
            # Create a dictionary with result details
            processed_result = {
                'result_rank': result_index,
                'webpage_url': webpage_url,
                'result_title': result_snippet,
                'webpage_summary': webpage_summary
            }
            processed_search_results.append(processed_result)
        
        return processed_search_results

    def generate_rag_response(self, original_search_query, processed_search_results):
        """
        Generate a Retrieval-Augmented Generation (RAG) response.

        This is the most advanced part of the tool. It's like having a 
        researcher who:
        1. Reads all the summaries
        2. Identifies key themes and connections
        3. Creates a comprehensive, narrative report
        4. Includes citations to original sources

        :param original_search_query: Original user query
        :param processed_search_results: Processed search results
        :return: Detailed response with citations
        """
        # Create a prompt to guide the AI in generating a comprehensive response
        rag_response_prompt = (
            f"Based on the search results for the query: '{original_search_query}', "
            "provide a detailed, chronological response. Cite all sources together with the relevant line items, and derive meaningful insights and implications."
        )
        
        try:
            # Use OpenAI to generate a comprehensive response
            rag_response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # Use a more advanced model for complex reasoning
                messages=[
                    {"role": "system", "content": rag_response_prompt},
                    {"role": "user", "content": json.dumps(processed_search_results)}
                ],
                temperature=0  # Low temperature for more focused, factual response
            )
            return rag_response.choices[0].message.content
        
        except Exception as rag_response_generation_error:
            # Handle any errors in response generation
            print(f"RAG Response Generation Error: {rag_response_generation_error}")
            return None

    def refine_search_query(self, search_query):
        """
        Refine the search query using AI.

        This is like having an AI assistant help refine the search term:
        - Takes your search query
        - Uses AI to create a more focused and effective search query

        :param search_query: User's search query
        :return: Refined search query
        """
        # Use OpenAI to refine the search query
        refined_search_query = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Provide a google search term based on search query in 3-4 words"},
                {"role": "user", "content": search_query}
            ]
        ).choices[0].message.content
        return refined_search_query

    def generate_comprehensive_response(self, search_query, processed_search_results):
        """
        Generate a comprehensive response.

        This is like having a researcher who:
        1. Reads all the summaries
        2. Identifies key themes and connections
        3. Creates a comprehensive, narrative report
        4. Includes citations to original sources

        :param search_query: Original user query
        :param processed_search_results: Processed search results
        :return: Detailed response with citations
        """
        # Create a prompt to guide the AI in generating a comprehensive response
        comprehensive_response_prompt = (
            f"Based on the search results for the query: '{search_query}', "
            "provide a detailed, chronological response. Cite all sources at the end of your answer."
        )
        
        try:
            # Use OpenAI to generate a comprehensive response
            comprehensive_response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # Use a more advanced model for complex reasoning
                messages=[
                    {"role": "system", "content": comprehensive_response_prompt},
                    {"role": "user", "content": json.dumps(processed_search_results)}
                ],
                temperature=0  # Low temperature for more focused, factual response
            )
            return comprehensive_response.choices[0].message.content
        
        except Exception as comprehensive_response_generation_error:
            # Handle any errors in response generation
            print(f"Comprehensive Response Generation Error: {comprehensive_response_generation_error}")
            return None

    def run(self, search_query, website_filter=None, config=None, recency=None):
        """
        Main method to execute the BYOB search tool.

        :param search_query: User's search query
        :param website_filter: Optional website to filter search results
        :param config: Optional configuration dictionary to override defaults
        :param recency: Restrict results by recency. 
                        Specification: '[age][period]'
                        - age: Number representing time span
                        - period: 
                            'd': days
                            'w': weeks
                            'm': months
                            'y': years
                        Examples:
                        - 'w1': Last week
                        - 'd7': Last 7 days
                        - 'm3': Last 3 months
        :return: Comprehensive search results
        """
        # Create a new instance with optional configuration
        byob_instance = BYOBTool(config=config)

        # Refine the search query using AI
        refined_search_query = byob_instance.refine_search_query(search_query)

        # Perform web search using the refined search term
        search_result_items = byob_instance.search(
            search_query=refined_search_query, 
            website_filter=website_filter or byob_instance.config['website_filter'],
            recency=recency or byob_instance.config['recency']
        )
        print(f"Search parameters: query={refined_search_query}, recency={recency or byob_instance.config['recency']}")

        # Process search results
        processed_search_results = byob_instance.get_search_results(
            search_items=search_result_items, 
            search_query=refined_search_query
        )

        # Generate comprehensive RAG response
        comprehensive_rag_response = byob_instance.generate_comprehensive_response(
            search_query=refined_search_query,
            processed_search_results=processed_search_results
        )

        # Return structured search results
        return {
            "refined_search_term": refined_search_query,
            "comprehensive_rag_response": comprehensive_rag_response,
            "processed_search_results": processed_search_results
        }

def main():
    """
    Main function to demonstrate the BYOB tool's functionality.

    This is like a quick demo that shows how the tool works with a sample query.
    """
    byob_research_tool = BYOBTool()
    
    # Run a sample search and print the results
    search_response = byob_research_tool.run("last week in GenAI", recency='m3')
    print("Refined Search Term:", search_response['refined_search_term'])
    print("\nComprehensive RAG Response:\n", search_response['comprehensive_rag_response'])

# This ensures the main() function is only run if the script is executed directly
if __name__ == "__main__":
    main()
