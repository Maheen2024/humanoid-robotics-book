from pydantic import BaseSettings
import os
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    # OpenAI Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    # Cohere API Configuration (for embeddings)
    cohere_api_key: str = os.getenv("COHERE_API_KEY", "")

    # Qdrant Configuration
    qdrant_host: str = os.getenv("QDRANT_HOST", "localhost")
    qdrant_port: int = int(os.getenv("QDRANT_PORT", 6333))
    qdrant_api_key: Optional[str] = os.getenv("QDRANT_API_KEY")
    collection_name: str = os.getenv("COLLECTION_NAME", "book_content")

    # Application Configuration
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    chunk_size: int = int(os.getenv("CHUNK_SIZE", 1000))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", 100))
    rate_limit_delay: int = int(os.getenv("RATE_LIMIT_DELAY", 1))

    # RAG Configuration
    max_query_length: int = int(os.getenv("MAX_QUERY_LENGTH", 1000))
    max_chunks_per_query: int = int(os.getenv("MAX_CHUNKS_PER_QUERY", 5))
    min_similarity_score: float = float(os.getenv("MIN_SIMILARITY_SCORE", 0.5))
    agent_temperature: float = float(os.getenv("AGENT_TEMPERATURE", 0.1))
    timeout_seconds: int = int(os.getenv("TIMEOUT_SECONDS", 30))

    # Target Site Configuration (for content indexing)
    target_site_url: str = os.getenv("TARGET_SITE_URL", "")

    # API Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", 8000))

    class Config:
        env_file = ".env"
        case_sensitive = False


# Create a singleton instance
settings = Settings()