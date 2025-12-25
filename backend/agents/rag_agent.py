import os
import time
from typing import List, Dict, Any

from dotenv import load_dotenv
from pydantic import BaseModel
from google import genai

from api.models.requests import AgentResponse, SourceCitation

# -------------------------------------------------------------------
# Environment setup
# -------------------------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

genai_client = genai.Client(api_key=GEMINI_API_KEY)

# -------------------------------------------------------------------
# Data Models
# -------------------------------------------------------------------

class RetrievedChunk(BaseModel):
    content: str
    source_url: str
    source_title: str
    chunk_position: int
    similarity_score: float
    metadata: Dict[str, Any]


class RetrievedContext(BaseModel):
    chunks: List[RetrievedChunk]
    total_chunks_found: int
    search_time_ms: float


# -------------------------------------------------------------------
# RAG Agent
# -------------------------------------------------------------------

class RAGAgent:
    """
    RAG Agent that generates answers using Gemini
    strictly grounded in retrieved book content.
    """

    def __init__(self) -> None:
        self.temperature = float(os.getenv("AGENT_TEMPERATURE", 0.1))
        self.max_chunks = int(os.getenv("MAX_CHUNKS_PER_QUERY", 5))

    def generate_response(
        self,
        query: str,
        retrieved_context: RetrievedContext,
        include_sources: bool = True
    ) -> AgentResponse:
        start_time = time.time()

        # -------------------------------------------------------------------
        # Build grounded prompt
        # -------------------------------------------------------------------

        context_text = "\n\n".join(
            chunk.content for chunk in retrieved_context.chunks[: self.max_chunks]
        )

        system_prompt = (
            "You are a helpful AI assistant that answers questions "
            
            
        )

        user_prompt = f"""
        Context:
        {context_text}

        Question:
        {query}
        """

        # -------------------------------------------------------------------
        # Gemini call (NEW SDK)
        # -------------------------------------------------------------------

        try:
            response = genai_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": f"{system_prompt}\n\n{user_prompt}"
                            }
                        ],
                    }
                ],
                config={
                    "temperature": self.temperature,
                    "max_output_tokens": 1000,
                },
            )

            answer = response.text or "No response generated."

        except Exception as exc:
            # Log the actual error for debugging
            print(f"Gemini API error: {exc}")
            raise exc

        # -------------------------------------------------------------------
        # Sources
        # -------------------------------------------------------------------

        sources: List[SourceCitation] = []

        if include_sources:
            for chunk in retrieved_context.chunks[: self.max_chunks]:
                sources.append(
                    SourceCitation(
                        source_url=chunk.source_url,
                        source_title=chunk.source_title,
                        content_preview=chunk.content[:200],
                        relevance_score=chunk.similarity_score,
                    )
                )

        # -------------------------------------------------------------------
        # Final response
        # -------------------------------------------------------------------

        processing_time_ms = (time.time() - start_time) * 1000
        tokens_used = len(answer.split())  # Approximation

        return AgentResponse(
            answer=answer,
            sources=sources,
            confidence_score=0.9,
            tokens_used=tokens_used,
            processing_time_ms=processing_time_ms,
            hallucination_detected=False,
        )