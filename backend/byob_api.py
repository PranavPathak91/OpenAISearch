#!/usr/bin/env python3
"""
BYOB (Bring Your Own Browser) Web Search Tool - Backend API

This Flask-based backend provides a RESTful API interface for the BYOB web search tool,
enabling communication between the frontend and the core BYOB search functionality.

Key Features:
- Expose search functionality via HTTP endpoints
- Handle request validation
- Provide error handling and logging
- Support cross-origin requests
"""

import os
import sys
import logging
from typing import Dict, Any

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from byob_search import BYOBTool
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class BYOBBackend:
    """
    Backend service that manages BYOB web search functionality.
    
    Provides a Flask-based API to:
    - Validate search requests
    - Execute web searches
    - Handle and transform search results
    - Manage error scenarios
    """
    
    def __init__(self):
        """
        Initialize the backend service with BYOB tool and Flask app.
        """
        # Initialize BYOB tool
        self.byob_tool = BYOBTool()
        
        # Create Flask app
        self.app = Flask(__name__)
        
        # Enable CORS with very permissive settings
        CORS(self.app, resources={r"/*": {
            "origins": "*",
            "allow_headers": "*",
            "supports_credentials": True
        }})
        
        # Register API routes
        self._register_routes()
    
    def _register_routes(self):
        """
        Define and register API endpoints for the BYOB backend.
        """
        # Search endpoint with CORS
        self.app.route('/api/search', methods=['POST', 'OPTIONS'])(self.search)
        
        # Health check endpoint with CORS
        self.app.route('/api/health', methods=['GET', 'OPTIONS'])(self.health_check)
        
        # Error handlers
        self.app.errorhandler(400)(self.bad_request)
        self.app.errorhandler(500)(self.server_error)
    
    def search(self):
        """
        Handle web search requests with CORS support.
        """
        # Handle preflight requests
        if request.method == 'OPTIONS':
            return self._handle_cors_preflight()
        
        try:
            # Parse request data
            data = request.get_json()
            
            # Validate input
            if not data or 'query' not in data:
                return self.bad_request("Missing search query")
            
            # Extract parameters
            search_query = data['query']
            site_filter = data.get('site_filter')
            
            # Validate query
            if not search_query or len(search_query) < 2:
                return self.bad_request("Invalid search query")
            
            # Log search request
            logger.info(f"Processing search query: {search_query}")
            
            # Perform search
            search_response = self.byob_tool.run(
                search_query, 
                website_filter=site_filter
            )
            
            # Return successful response
            return jsonify(search_response)
        
        except Exception as e:
            # Log and handle unexpected errors
            logger.error(f"Search error: {e}")
            return self.server_error(str(e))
    
    def _handle_cors_preflight(self):
        """
        Handle CORS preflight requests.
        """
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response
    
    def health_check(self):
        """
        Provide a simple health check endpoint.
        """
        if request.method == 'OPTIONS':
            return self._handle_cors_preflight()
        
        return jsonify({
            "status": "healthy",
            "message": "BYOB Backend is running",
            "tool_initialized": self.byob_tool is not None
        })
    
    def bad_request(self, error=None):
        """
        Handle bad request errors.
        
        :param error: Optional error message
        :return: JSON response with error details
        """
        logger.warning(f"Bad request: {error}")
        return make_response(jsonify({
            "error": "Bad Request",
            "message": str(error) if error else "Invalid request"
        }), 400)
    
    def server_error(self, error=None):
        """
        Handle server errors.
        
        :param error: Optional error message
        :return: JSON response with error details
        """
        logger.error(f"Server error: {error}")
        return make_response(jsonify({
            "error": "Internal Server Error",
            "message": str(error) if error else "An unexpected error occurred"
        }), 500)
    
    def run(self, host='0.0.0.0', port=5001, debug=True):
        """
        Start the Flask development server.
        
        :param host: Host to bind the server
        :param port: Port to run the server
        :param debug: Enable debug mode
        """
        logger.info(f"Starting BYOB Backend on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug)

def main():
    """
    Entry point for running the BYOB Backend service.
    """
    backend = BYOBBackend()
    backend.run(debug=True)

if __name__ == "__main__":
    main()
