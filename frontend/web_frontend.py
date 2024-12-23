#!/usr/bin/env python3
"""
BYOB (Bring Your Own Browser) Web Frontend

A modern, responsive web interface for the BYOB web search tool.
"""

import os
import sys
import logging
from typing import Dict, Any

# Add parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BYOBWebFrontend:
    """
    Web-based frontend for the BYOB search tool.
    
    Provides a modern, responsive interface using Flask and 
    communicates with the backend API.
    """
    
    def __init__(self, backend_url='http://localhost:5001'):
        """
        Initialize the web frontend.
        
        :param backend_url: URL of the backend API
        """
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Store backend URL
        self.backend_url = backend_url
        
        # Register routes
        self._register_routes()
    
    def _register_routes(self):
        """
        Define and register web application routes.
        """
        # Main index route
        self.app.route('/')(self.index)
        
        # Search API route
        self.app.route('/search', methods=['POST'])(self.search)
    
    def index(self):
        """
        Render the main search page.
        """
        return render_template('index.html')
    
    def search(self):
        """
        Handle search requests from the frontend.
        
        Expects JSON payload:
        {
            'query': 'search term',
            'site_filter': 'optional site filter'
        }
        
        Returns search results from backend API.
        """
        try:
            # Get search data
            search_data = request.get_json()
            
            # Validate input
            if not search_data or 'query' not in search_data:
                return jsonify({'error': 'Missing search query'}), 400
            
            # Prepare request to backend
            response = requests.post(
                f'{self.backend_url}/api/search', 
                json=search_data,
                timeout=60
            )
            
            # Check response
            response.raise_for_status()
            
            # Return search results
            return jsonify(response.json())
        
        except requests.RequestException as e:
            logger.error(f"Backend API error: {e}")
            return jsonify({
                'error': 'Failed to connect to search backend',
                'details': str(e)
            }), 500
        
        except Exception as e:
            logger.error(f"Unexpected search error: {e}")
            return jsonify({
                'error': 'An unexpected error occurred',
                'details': str(e)
            }), 500
    
    def run(self, host='0.0.0.0', port=3001, debug=True):
        """
        Start the Flask development server.
        
        :param host: Host to bind the server
        :param port: Port to run the server
        :param debug: Enable debug mode
        """
        logger.info(f"Starting BYOB Web Frontend on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug)

def main():
    """
    Entry point for running the BYOB Web Frontend.
    """
    frontend = BYOBWebFrontend()
    frontend.run()

if __name__ == "__main__":
    main()
