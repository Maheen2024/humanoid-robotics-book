# Quickstart Guide: RAG Agent and API Service

**Feature**: RAG Agent and API Service
**Created**: 2025-12-24
**Branch**: `006-rag-agent-api`
**Related Spec**: [specs/006-rag-agent-api/spec.md](specs/006-rag-agent-api/spec.md)

## Overview

This guide provides step-by-step instructions for setting up, configuring, and using the RAG Agent and API Service. The service enables AI-powered question answering based on book content using OpenAI Agents SDK, FastAPI, and Qdrant vector database.

## Prerequisites

Before starting, ensure you have:

- **Python 3.9+** installed on your system
- **pip** package manager
- **Git** for version control
- **OpenAI API Key** with appropriate permissions
- **Qdrant Vector Database** access (hosted or local)
- **Cohere API Key** for embeddings (if using Cohere)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Cohere API Configuration (for embeddings)
COHERE_API_KEY=your_cohere_api_key_here

# Qdrant Configuration
QDRANT_HOST=your_qdrant_host
QDRANT_API_KEY=your_qdrant_api_key  # Optional if using local instance
QDRANT_PORT=6333

# Collection Configuration
COLLECTION_NAME=your_collection_name

# Target Site Configuration (for content indexing)
TARGET_SITE_URL=https://your-documentation-site.com

# Application Configuration
LOG_LEVEL=INFO
CHUNK_SIZE=1000
CHUNK_OVERLAP=100
RATE_LIMIT_DELAY=1
```

### 2. Verify Configuration

Ensure your Qdrant instance is running and accessible, and that your API keys have the necessary permissions.

## Setup Process

### 1. Index Your Content

Before using the RAG agent, you need to index your book content into Qdrant:

```bash
cd backend
python main.py
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
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

### 3. Verify Service Health

Check if the service is running:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "qdrant": "healthy",
    "openai": "healthy",
    "api": "healthy"
  },
  "version": "1.0.0",
  "uptime_seconds": 120
}
```

## Usage Examples

### 1. Basic Question Answering

Send a question to the RAG agent:

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

Expected response:
```json
{
  "success": true,
  "data": {
    "answer": "The key principles of humanoid robotics include...",
    "sources": [
      {
        "source_url": "https://example.com/docs/principles",
        "source_title": "Core Principles",
        "content_preview": "Humanoid robotics involves creating robots with human-like characteristics...",
        "relevance_score": 0.85
      }
    ],
    "confidence_score": 0.92,
    "tokens_used": 156,
    "processing_time_ms": 1245.6,
    "hallucination_detected": false
  },
  "request_id": "req_1234567890",
  "timestamp": "2025-12-24T10:30:00.123Z"
}
```

### 2. Advanced Query with Parameters

```bash
curl -X POST http://localhost:8000/api/v1/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain the mathematical foundations of robotic kinematics",
    "max_chunks": 3,
    "temperature": 0.2,
    "include_sources": true,
    "timeout": 45
  }'
```

### 3. Using the Python Client

```python
import requests
import json

def ask_rag_agent(query: str, max_chunks: int = 5):
    url = "http://localhost:8000/api/v1/rag/query"
    payload = {
        "query": query,
        "max_chunks": max_chunks,
        "temperature": 0.1,
        "include_sources": True
    }

    response = requests.post(url, json=payload)
    return response.json()

# Example usage
result = ask_rag_agent("What is forward kinematics in robotics?")
print(f"Answer: {result['data']['answer']}")
print(f"Sources: {result['data']['sources']}")
```

## API Endpoints

### 1. Query Endpoint
- **URL**: `POST /api/v1/rag/query`
- **Description**: Submit a question to the RAG agent
- **Request Body**: QueryRequest model
- **Response**: APIResponse with AgentResponse data

### 2. Health Check
- **URL**: `GET /health`
- **Description**: Check service health status
- **Response**: HealthStatus model

### 3. Configuration
- **URL**: `GET /config`
- **Description**: Get current configuration
- **Response**: RAGConfig model

## Development Workflow

### 1. Local Development

For development, run the service with auto-reload:

```bash
cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

### 2. Testing

Run the test suite:

```bash
cd backend
python -m pytest tests/ -v
```

### 3. API Documentation

Interactive API documentation is available at:
- `http://localhost:8000/docs` (Swagger UI)
- `http://localhost:8000/redoc` (ReDoc)

## Troubleshooting

### 1. Common Issues

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

### 2. Logging

Check the service logs for detailed error information:

```bash
tail -f backend/logs/app.log
```

### 3. Debug Mode

Start the service in debug mode for more detailed logging:

```bash
export LOG_LEVEL=DEBUG
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

## Performance Tips

### 1. Optimize Query Performance
- Use appropriate `max_chunks` values (3-5 is usually optimal)
- Set reasonable `timeout` values based on your needs
- Implement client-side caching for frequently asked questions

### 2. Cost Management
- Monitor OpenAI API usage regularly
- Use lower `temperature` values for more consistent responses
- Consider implementing query result caching

## Next Steps

1. **Customize Configuration**: Adjust the settings in `.env` for your specific use case
2. **Index Your Content**: Run the indexing process with your own book content
3. **Integrate with Your Application**: Use the API endpoints in your application
4. **Monitor Performance**: Set up logging and monitoring for production use
5. **Scale the Service**: Consider deployment options for production workloads

## Support

For support, please check:
- API documentation at `/docs`
- GitHub issues for the repository
- Configuration files in the `backend/config/` directory