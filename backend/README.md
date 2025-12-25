# RAG Agent and API Service

This service provides a RAG-enabled AI agent that answers questions based on book content using the OpenAI Agents SDK, FastAPI, and Qdrant vector database.

## Overview

The RAG (Retrieval-Augmented Generation) Agent service allows users to ask questions about book content and receive accurate answers grounded in the indexed materials. The system prevents hallucination by only using information from the vector store.

## Features

- **RAG Agent**: AI agent that uses OpenAI API to generate responses based on retrieved context
- **Vector Search**: Qdrant-based semantic search for relevant document chunks
- **FastAPI Service**: RESTful API with comprehensive documentation
- **Content Indexing**: Automatic indexing of book content from documentation sites
- **Source Attribution**: Responses include citations to original sources
- **No Hallucination**: Strictly answers only from indexed content

## Prerequisites

- Python 3.9+
- OpenAI API Key
- Cohere API Key (for embeddings)
- Qdrant Vector Database (hosted or local)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

## Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Cohere API Configuration (for embeddings)
COHERE_API_KEY=your_cohere_api_key_here

# Qdrant Configuration
QDRANT_HOST=localhost
QDRANT_API_KEY=your_qdrant_api_key_here  # Optional if using local instance
QDRANT_PORT=6333

# Collection Configuration
COLLECTION_NAME=book_content

# Target Site Configuration (for content indexing)
TARGET_SITE_URL=https://your-documentation-site.com

# Application Configuration
LOG_LEVEL=INFO
CHUNK_SIZE=1000
CHUNK_OVERLAP=100
RATE_LIMIT_DELAY=1

# RAG Configuration
MAX_QUERY_LENGTH=1000
MAX_CHUNKS_PER_QUERY=5
MIN_SIMILARITY_SCORE=0.5
AGENT_TEMPERATURE=0.1
TIMEOUT_SECONDS=30

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## Usage

### 1. Index Your Content

Before using the RAG agent, you need to index your book content into Qdrant:

```bash
cd backend
python main.py pipeline
```

This will:
- Crawl the TARGET_SITE_URL for documentation pages
- Extract text content from each page
- Chunk the content into manageable pieces
- Generate embeddings using Cohere
- Store the embeddings in Qdrant

### 2. Start the API Service

```bash
cd backend
python main.py api
```

Or using uvicorn directly:
```bash
cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

### 3. API Endpoints

#### Query Endpoint
- **URL**: `POST /api/v1/rag/query`
- **Description**: Submit a question to the RAG agent
- **Request Body**: QueryRequest model
- **Response**: APIResponse with AgentResponse data

Example request:
```bash
curl -X POST http://localhost:8000/api/v1/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the key principles of humanoid robotics?",
    "max_chunks": 5,
    "temperature": 0.1,
    "include_sources": true
  }'
```

#### Health Check
- **URL**: `GET /health`
- **Description**: Check service health status

#### Configuration
- **URL**: `GET /config`
- **Description**: Get current configuration

## API Documentation

Interactive API documentation is available at:
- `http://localhost:8000/docs` (Swagger UI)
- `http://localhost:8000/redoc` (ReDoc)

## Testing

Run the test suite:

```bash
cd backend
python -m pytest tests/ -v
```

## Architecture

```
Query → Embedding → Vector Search → Context Retrieval → Response Generation → Answer + Citations
```

**Service Components**:
- **API Layer**: FastAPI endpoints handling requests/responses
- **Agent Service**: Orchestrates RAG pipeline execution
- **Retrieval Service**: Interfaces with Qdrant for document search
- **Embedding Service**: Handles text embedding operations

## Development

For local development, run the service with auto-reload:

```bash
cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

## Performance Tips

- Use appropriate `max_chunks` values (3-5 is usually optimal)
- Set reasonable `timeout` values based on your needs
- Implement client-side caching for frequently asked questions

## Troubleshooting

**Q: API returns 429 (Rate Limit) errors**
- A: Check your OpenAI and Cohere API usage limits
- Implement request caching or reduce query frequency

**Q: No relevant results returned**
- A: Verify content was properly indexed in Qdrant
- Check that TARGET_SITE_URL contains the expected content
- Verify embedding process completed successfully

**Q: Service startup fails**
- A: Check environment variables are properly set
- Verify Qdrant instance is accessible
- Ensure all dependencies are installed