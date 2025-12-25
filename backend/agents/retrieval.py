from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import cohere
import qdrant_client
from qdrant_client.http import models
from qdrant_client.models import PointStruct
import os
from dotenv import load_dotenv
from .rag_agent import RetrievedChunk, RetrievedContext
import time
import requests
from bs4 import BeautifulSoup

# Load environment variables
load_dotenv()

class QdrantRetrieval:
    """
    Qdrant retrieval implementation for vector search and document retrieval.
    """

    def __init__(self):
        """
        Initialize Qdrant client with configuration from environment variables.
        """
        self.qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        self.qdrant_port = int(os.getenv("QDRANT_PORT", 6333))
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")
        self.collection_name = os.getenv("COLLECTION_NAME", "book_content")

        # Initialize Cohere client for embeddings
        self.cohere_api_key = os.getenv("COHERE_API_KEY")
        self.co = cohere.Client(self.cohere_api_key)

        # Initialize Qdrant client
        if self.qdrant_api_key:
            self.client = qdrant_client.QdrantClient(
                host=self.qdrant_host,
                port=self.qdrant_port,
                api_key=self.qdrant_api_key
            )
        else:
            self.client = qdrant_client.QdrantClient(
                host=self.qdrant_host,
                port=self.qdrant_port
            )

        # Create collection if it doesn't exist
        self._create_collection_if_not_exists()

    def _create_collection_if_not_exists(self):
        """
        Create the collection in Qdrant if it doesn't exist.
        """
        try:
            collections = self.client.get_collections()
            collection_exists = any(col.name == self.collection_name for col in collections.collections)

            if not collection_exists:
                # Get embedding size from Cohere - using same model as main pipeline for consistency
                sample_embedding = self.co.embed(
                    texts=["sample text"],
                    model="embed-english-v3.0",
                    input_type="search_document"
                ).embeddings[0]
                embedding_size = len(sample_embedding)

                # Create collection with vector configuration
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=embedding_size,
                        distance=models.Distance.COSINE
                    )
                )
        except Exception as e:
            print(f"Error creating collection: {e}")

    def generate_embeddings(self, text: str) -> List[float]:
        """
        Generate embeddings for text using Cohere API.

        Args:
            text: Text to generate embeddings for

        Returns:
            List of embedding values
        """
        try:
            response = self.co.embed(
                texts=[text],
                model="embed-english-v3.0",
                input_type="search_document"
            )
            return response.embeddings[0]
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            return []

    def search_similar(self, query: str, top_k: int = 5) -> RetrievedContext:
        """
        Search for similar documents in Qdrant based on the query.

        Args:
            query: Query text to search for
            top_k: Number of top results to return

        Returns:
            RetrievedContext with relevant chunks
        """
        start_time = time.time()

        try:
            # Generate embeddings for the query
            query_embedding = self.generate_embeddings(query)

            if not query_embedding:
                return RetrievedContext(
                    chunks=[],
                    total_chunks_found=0,
                    search_time_ms=0.0
                )

            # Perform similarity search
            search_result = self.client.query_points(
                collection_name=self.collection_name,
                query=query_embedding,
                limit=top_k,
                with_payload=True
            )

            # Convert search results to RetrievedChunk objects
            chunks = []
            for hit in search_result.points:
                payload = hit.payload
                chunk = RetrievedChunk(
                    content=payload.get("content", ""),
                    source_url=payload.get("source_url", ""),
                    source_title=payload.get("source_title", ""),
                    chunk_position=payload.get("chunk_position", 0),
                    similarity_score=hit.score,
                    metadata=payload.get("metadata", {})
                )
                chunks.append(chunk)

            search_time_ms = (time.time() - start_time) * 1000

            return RetrievedContext(
                chunks=chunks,
                total_chunks_found=len(search_result.points),
                search_time_ms=search_time_ms
            )

        except Exception as e:
            print(f"Error during similarity search: {e}")
            search_time_ms = (time.time() - start_time) * 1000
            return RetrievedContext(
                chunks=[],
                total_chunks_found=0,
                search_time_ms=search_time_ms
            )

    def store_document_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Store document chunks in Qdrant vector database.

        Args:
            chunks: List of document chunks with content, source, etc.
        """
        points = []

        for i, chunk_data in enumerate(chunks):
            content = chunk_data["content"]
            source_url = chunk_data["source_url"]
            source_title = chunk_data["source_title"]
            chunk_position = chunk_data.get("chunk_position", i)
            metadata = chunk_data.get("metadata", {})

            # Generate embeddings for the content
            embeddings = self.generate_embeddings(content)

            if embeddings:
                point = PointStruct(
                    id=i,
                    vector=embeddings,
                    payload={
                        "content": content,
                        "source_url": source_url,
                        "source_title": source_title,
                        "chunk_position": chunk_position,
                        "metadata": metadata
                    }
                )
                points.append(point)

        if points:
            # Upload points to Qdrant
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

    def index_content_from_url(self, url: str, chunk_size: int = 1000, chunk_overlap: int = 100):
        """
        Index content from a URL by extracting text and storing in Qdrant.

        Args:
            url: URL to extract content from
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
        """
        try:
            # Fetch the content from the URL
            response = requests.get(url)
            response.raise_for_status()

            # Parse HTML content
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract text content
            text_content = soup.get_text(separator=' ', strip=True)

            # Create chunks from the text content
            chunks = []
            for i in range(0, len(text_content), chunk_size - chunk_overlap):
                chunk_text = text_content[i:i + chunk_size]

                chunk_data = {
                    "content": chunk_text,
                    "source_url": url,
                    "source_title": f"Content from {url}",
                    "chunk_position": i // (chunk_size - chunk_overlap),
                    "metadata": {"indexed_at": time.time()}
                }
                chunks.append(chunk_data)

            # Store the chunks in Qdrant
            self.store_document_chunks(chunks)

            print(f"Successfully indexed content from {url} with {len(chunks)} chunks")

        except Exception as e:
            print(f"Error indexing content from {url}: {e}")


def index_book_content():
    """
    Function to index book content from the target site URL.
    This can be called as a standalone function to populate the vector store.
    """
    target_site_url = os.getenv("TARGET_SITE_URL")
    if not target_site_url:
        print("TARGET_SITE_URL environment variable not set")
        return

    retriever = QdrantRetrieval()
    retriever.index_content_from_url(target_site_url)