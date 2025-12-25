from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import time
import uuid
from datetime import datetime

from api.models.requests import QueryRequest, APIResponse, AgentResponse


# Import the services - in a real implementation these would be injected
from agents.rag_agent import RAGAgent
from agents.retrieval import QdrantRetrieval

router = APIRouter()

# Initialize services
rag_agent = RAGAgent()
retriever = QdrantRetrieval()

@router.post("/query", response_model=APIResponse)
async def query_rag_agent(request: QueryRequest):
    """
    Query the RAG agent with a question and get a response based on book content.
    """
    request_id = str(uuid.uuid4())

    try:
        # Validate query length
        if len(request.query) > 1000:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "QUERY_TOO_LONG",
                    "message": "Query exceeds maximum length of 1000 characters",
                    "details": {
                        "max_length": 1000,
                        "actual_length": len(request.query)
                    }
                }
            )

        # Validate parameter ranges
        if not 1 <= request.max_chunks <= 10:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "INVALID_PARAMETER_VALUE",
                    "message": "max_chunks must be between 1 and 10",
                    "details": {
                        "parameter": "max_chunks",
                        "expected_range": "1-10",
                        "actual_value": request.max_chunks
                    }
                }
            )

        if not 0.0 <= request.temperature <= 1.0:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "INVALID_PARAMETER_VALUE",
                    "message": "temperature must be between 0.0 and 1.0",
                    "details": {
                        "parameter": "temperature",
                        "expected_range": "0.0-1.0",
                        "actual_value": request.temperature
                    }
                }
            )

        # Perform similarity search using Qdrant
        start_time = time.time()
        retrieved_context = retriever.search_similar(
            query=request.query,
            top_k=request.max_chunks
        )

        # Generate response using the RAG agent
        agent_response = rag_agent.generate_response(
            query=request.query,
            retrieved_context=retrieved_context,
            include_sources=request.include_sources
        )

        # Update processing time
        agent_response.processing_time_ms = (time.time() - start_time) * 1000

        return APIResponse(
            success=True,
            data=agent_response,
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat()
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other errors
        return APIResponse(
            success=False,
            error={
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred while processing the request",
                "details": str(e)
            },
            request_id=request_id,
            timestamp=datetime.utcnow().isoformat()
        )