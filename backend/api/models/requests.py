from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union
from enum import Enum
import uuid
from datetime import datetime

class QueryRequest(BaseModel):
    """
    Request model for RAG agent queries.
    """
    query: str
    max_chunks: int = 5
    temperature: float = 0.1
    include_sources: bool = True
    timeout: int = 30


class SourceCitation(BaseModel):
    """
    Model for source citations in agent responses.
    """
    source_url: str
    source_title: str
    content_preview: str
    relevance_score: float


class AgentResponse(BaseModel):
    """
    Response model from the RAG agent.
    """
    answer: str
    sources: List[SourceCitation]
    confidence_score: float
    tokens_used: int
    processing_time_ms: float
    hallucination_detected: bool = False


class APIResponse(BaseModel):
    """
    Standard API response envelope.
    """
    success: bool
    data: Optional[Union[AgentResponse, Dict[str, Any]]] = None
    error: Optional[Dict[str, str]] = None
    request_id: str
    timestamp: str


class HealthStatus(BaseModel):
    """
    Health check response model.
    """
    status: str
    services: Dict[str, str]
    version: str
    uptime_seconds: int


class RAGConfig(BaseModel):
    """
    Configuration parameters model.
    """
    max_query_length: int
    max_chunks_per_query: int
    min_similarity_score: float
    agent_temperature: float
    timeout_seconds: int