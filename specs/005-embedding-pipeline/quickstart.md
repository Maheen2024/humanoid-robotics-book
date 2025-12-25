# Quickstart Guide: Embedding Pipeline Setup for RAG System

## Overview
This quickstart guide provides instructions for setting up and running the embedding pipeline that crawls Docusaurus URLs, extracts text, generates Cohere embeddings, and stores them in Qdrant.

## Prerequisites
- Python 3.9 or higher
- Cohere API key
- Qdrant instance (local or cloud)
- Access to target Docusaurus site: https://physical-ai-humanoid-robotics-book-dusky.vercel.app/

## Installation

### 1. Clone or create the project structure
```
src/
└── main.py
```

### 2. Install required dependencies
```bash
pip install requests beautifulsoup4 cohere qdrant-client python-dotenv
```

### 3. Create environment file (.env)
```env
COHERE_API_KEY=your_cohere_api_key_here
QDRANT_HOST=your_qdrant_host_or_url
QDRANT_API_KEY=your_qdrant_api_key_if_needed
TARGET_SITE_URL=https://physical-ai-humanoid-robotics-book-dusky.vercel.app/
```

## Pipeline Components

The embedding pipeline consists of the following functions in main.py:

### 1. get-all-urls
- Discovers all documentation URLs from the target Docusaurus site
- Respects robots.txt and implements appropriate crawling delays
- Returns a list of valid documentation URLs

### 2. extract-text-from-url
- Fetches content from a single URL
- Extracts only the main content area, excluding navigation and UI elements
- Returns cleaned text content with metadata

### 3. chunk-text
- Splits long documents into smaller, manageable chunks
- Maintains semantic boundaries and context
- Returns list of text chunks with position metadata

### 4. embed
- Converts text chunks into vector embeddings using Cohere API
- Handles rate limiting and API quotas
- Returns embedding vectors with associated metadata

### 5. create-collection
- Creates the "rag-embedding" collection in Qdrant
- Configures vector dimensions (1024) and similarity metric (cosine)
- Sets up the payload schema for metadata storage

### 6. save-chunk-to-qdrant
- Stores individual text chunks with embeddings in Qdrant
- Includes metadata like source URL, title, and position
- Handles duplicate detection and error recovery

### 7. main function
- Orchestrates the entire pipeline execution
- Coordinates all the above functions in the correct sequence
- Provides progress tracking and error handling

## Running the Pipeline

### Basic Execution
```bash
cd src
python main.py
```

### Configuration Options
- Adjust crawling depth and breadth through configuration
- Modify chunk size and overlap settings
- Configure Cohere model and Qdrant collection parameters

## Expected Output
- All documentation pages from the target site will be crawled
- Content will be extracted, chunked, and embedded
- Embeddings will be stored in the "rag-embedding" Qdrant collection
- Progress and error logs will be displayed during execution

## Verification
After running the pipeline:
1. Check Qdrant dashboard to verify "rag-embedding" collection exists
2. Confirm embeddings are stored with proper metadata
3. Test similarity search functionality for RAG applications

## Troubleshooting
- Ensure API keys are correctly configured in .env file
- Verify Qdrant instance is accessible and properly configured
- Check network connectivity to target Docusaurus site
- Monitor rate limits and adjust crawling speed if needed

This quickstart provides the essential information needed to deploy and run the embedding pipeline successfully.