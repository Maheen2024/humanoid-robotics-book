from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import time
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
from agents.rag_agent import RAGAgent, AgentResponse
from agents.retrieval import QdrantRetrieval
from api.models.requests import QueryRequest, APIResponse, HealthStatus, RAGConfig
from api.routes import rag

# Create the FastAPI app
app = FastAPI(
    title="RAG Agent API",
    description="API for RAG-enabled AI agent that answers questions from book content",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(rag.router, prefix="/api/v1/rag", tags=["rag"])

# Initialize services
rag_agent = RAGAgent()
retriever = QdrantRetrieval()

# In-memory request tracking (in production, use a proper database)
request_count = 0

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Middleware to add process time header to responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint to verify service status."""
    # Check if dependencies are available
    qdrant_status = "healthy"
    openai_status = "healthy"
    api_status = "healthy"

    # Simple connectivity checks
    try:
        # Check Qdrant connectivity
        collections = retriever.client.get_collections()
    except:
        qdrant_status = "unhealthy"

    # For OpenAI, we won't make a real API call to avoid charges
    # In a real implementation, you might want to do a lightweight check

    return HealthStatus(
        status="healthy" if all(s == "healthy" for s in [qdrant_status, openai_status, api_status]) else "degraded",
        services={
            "qdrant": qdrant_status,
            "openai": openai_status,
            "api": api_status
        },
        version="1.0.0",
        uptime_seconds=int(time.time() - getattr(app, '_start_time', time.time()))
    )

@app.get("/config", response_model=APIResponse)
async def get_config():
    """Return current configuration parameters."""
    config = RAGConfig(
        max_query_length=int(os.getenv("MAX_QUERY_LENGTH", 1000)),
        max_chunks_per_query=int(os.getenv("MAX_CHUNKS_PER_QUERY", 5)),
        min_similarity_score=float(os.getenv("MIN_SIMILARITY_SCORE", 0.5)),
        agent_temperature=float(os.getenv("AGENT_TEMPERATURE", 0.1)),
        timeout_seconds=int(os.getenv("TIMEOUT_SECONDS", 30))
    )

    return APIResponse(
        success=True,
        data=config.dict(),
        request_id=str(uuid.uuid4()),
        timestamp=datetime.utcnow().isoformat()
    )

# Set start time for uptime calculation
app._start_time = time.time()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)