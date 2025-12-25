# API Contracts: Embedding Pipeline Setup for RAG System

## Overview
This document defines the API contracts and interfaces for the embedding pipeline system that crawls Docusaurus URLs, extracts text, generates Cohere embeddings, and stores them in Qdrant.

## Function Interfaces in main.py

### get-all-urls(url: str) -> List[str]
- **Purpose**: Discover all documentation URLs from a Docusaurus site
- **Input**: Base URL of the Docusaurus site to crawl
- **Output**: List of all discovered documentation URLs
- **Error Conditions**: Network errors, invalid URL format
- **Example**:
  ```python
  urls = get-all-urls("https://physical-ai-humanoid-robotics-book-dusky.vercel.app/")
  # Returns: ["https://.../docs/intro", "https://.../docs/module-1/...", ...]
  ```

### extract-text-from-url(url: str) -> Dict
- **Purpose**: Extract clean text content from a single Docusaurus page
- **Input**: URL of a Docusaurus documentation page
- **Output**: Dictionary with 'content', 'title', and 'metadata' keys
- **Error Conditions**: Page not found, content extraction failure
- **Example**:
  ```python
  result = extract-text-from-url("https://.../docs/intro")
  # Returns: {"content": "Clean text content...", "title": "Intro Page", "metadata": {...}}
  ```

### chunk-text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict]
- **Purpose**: Split long text into smaller chunks with overlap
- **Input**: Text content, chunk size, and overlap parameters
- **Output**: List of chunk dictionaries with content and position
- **Error Conditions**: Invalid chunk size parameters
- **Example**:
  ```python
  chunks = chunk-text("Long document content...", chunk_size=1000, overlap=200)
  # Returns: [{"content": "Chunk 1 text...", "position": 0}, {"content": "Chunk 2 text...", "position": 1}, ...]
  ```

### embed(text_chunks: List[Dict]) -> List[Dict]
- **Purpose**: Generate Cohere embeddings for text chunks
- **Input**: List of text chunks to embed
- **Output**: List of chunks with added embedding vectors
- **Error Conditions**: Cohere API errors, rate limits, invalid input
- **Example**:
  ```python
  embedded_chunks = embed([{"content": "Text...", "position": 0}, ...])
  # Returns: [{"content": "Text...", "position": 0, "embedding": [0.1, 0.2, ...]}, ...]
  ```

### create-collection(collection_name: str = "rag-embedding") -> bool
- **Purpose**: Create the Qdrant collection for storing embeddings
- **Input**: Collection name (default: "rag-embedding")
- **Output**: Boolean indicating success or failure
- **Error Conditions**: Qdrant connection errors, collection creation failure
- **Example**:
  ```python
  success = create-collection("rag-embedding")
  # Returns: True if collection created successfully
  ```

### save-chunk-to-qdrant(chunk_data: Dict, collection_name: str = "rag-embedding") -> bool
- **Purpose**: Save a single embedded chunk to Qdrant
- **Input**: Chunk data with content, embedding, and metadata
- **Output**: Boolean indicating success or failure
- **Error Conditions**: Qdrant storage errors, invalid data format
- **Example**:
  ```python
  success = save-chunk-to-qdrant({
      "content": "Text content...",
      "embedding": [0.1, 0.2, ...],
      "source_url": "https://...",
      "source_title": "Page Title",
      "position": 0
  })
  # Returns: True if chunk saved successfully
  ```

## External API Contracts

### Cohere Embedding API
- **Endpoint**: `https://api.cohere.ai/v1/embed`
- **Method**: POST
- **Authentication**: Bearer token via Authorization header
- **Request Body**: JSON with text array and model specification
- **Response**: JSON with embedding vectors array
- **Rate Limits**: 5 requests per second for free tier

### Qdrant API
- **Endpoint**: Configured Qdrant host
- **Method**: Various (PUT for collections, POST for points)
- **Authentication**: API key in request header if required
- **Request Body**: JSON with vector data and payload
- **Response**: Success/failure confirmation

## Data Contracts

### Input Data Format
- URLs must be valid HTTPS URLs
- Text content must be UTF-8 encoded strings
- Chunk size must be positive integer (recommended: 512-1024)
- Overlap must be non-negative integer less than chunk size

### Output Data Format
- Embeddings are 1024-dimensional float vectors
- Qdrant payloads include content, source_url, source_title, and metadata
- Collection uses cosine similarity metric
- Vector IDs follow format: `{url_hash}_{chunk_position}`

## Error Handling Contracts

### Network Errors
- Timeouts should be handled with retry logic
- Failed requests should be logged with appropriate error messages
- System should continue processing other items when one fails

### API Limit Errors
- Cohere rate limits should be handled with exponential backoff
- Quota exhaustion should trigger graceful degradation
- Qdrant connection errors should be retried with backoff

### Data Validation Errors
- Invalid input should be rejected with clear error messages
- Data format mismatches should be caught and handled
- Corrupted data should be skipped with logging

These contracts ensure consistent behavior and interface compatibility across all components of the embedding pipeline system.