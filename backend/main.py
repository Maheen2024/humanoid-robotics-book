import os
import sys
import requests
from bs4 import BeautifulSoup
import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
from urllib.parse import urljoin, urlparse
from dotenv import load_dotenv
import time
import logging
from typing import List, Dict, Any
import re

# Add current directory to path to import config
sys.path.insert(0, os.path.dirname(__file__))

# Import configuration
from config.settings import (
    COHERE_API_KEY,
    QDRANT_HOST,
    QDRANT_API_KEY,
    QDRANT_PORT,
    TARGET_SITE_URL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    RATE_LIMIT_DELAY,
    COLLECTION_NAME,
    LOG_LEVEL
)

# Configure logging
logging.basicConfig(level=getattr(logging, LOG_LEVEL))
logger = logging.getLogger(__name__)

# Initialize clients
co = cohere.Client(COHERE_API_KEY)

# Initialize Qdrant client - handle both hosted and local instances
if QDRANT_API_KEY:
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, api_key=QDRANT_API_KEY)
else:
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

def get_all_urls(base_url: str) -> List[str]:
    """
    Discover all documentation URLs from a Docusaurus site.

    Args:
        base_url: The base URL of the Docusaurus site

    Returns:
        List of discovered documentation URLs
    """
    logger.info(f"Starting to crawl: {base_url}")

    # First, try to get URLs from sitemap
    sitemap_url = urljoin(base_url, "sitemap.xml")
    urls = set()

    try:
        response = requests.get(sitemap_url)
        if response.status_code == 200:
            # Parse sitemap for URLs
            soup = BeautifulSoup(response.content, 'xml')
            for loc in soup.find_all('loc'):
                url = loc.text.strip()
                if base_url in url and url.endswith(('.html', '/')):
                    urls.add(url)
    except Exception as e:
        logger.warning(f"Could not fetch sitemap: {e}")

    # If sitemap didn't work or returned few results, crawl manually
    if len(urls) < 10:  # arbitrary threshold
        urls = set()
        to_visit = [base_url]
        visited = set()

        while to_visit and len(urls) < 1000:  # prevent infinite crawling
            current_url = to_visit.pop(0)

            if current_url in visited:
                continue
            visited.add(current_url)

            try:
                response = requests.get(current_url, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')

                    # Extract content URLs from navigation and links
                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        full_url = urljoin(base_url, href)

                        # Only add URLs that are part of the documentation
                        if base_url in full_url and full_url not in visited:
                            # Check if it's a documentation page (not external link)
                            if full_url.startswith(base_url) and ('/docs/' in full_url or full_url.endswith(('.html', '/'))):
                                urls.add(full_url)
                                if len(to_visit) < 500:  # prevent queue from getting too large
                                    to_visit.append(full_url)

                time.sleep(0.1)  # Be respectful to the server

            except Exception as e:
                logger.error(f"Error crawling {current_url}: {e}")
                continue

    logger.info(f"Discovered {len(urls)} URLs")
    return list(urls)

def extract_text_from_url(url: str) -> Dict[str, Any]:
    """
    Extract clean text content from a single Docusaurus page.

    Args:
        url: URL of the Docusaurus page

    Returns:
        Dictionary with 'content', 'title', and 'metadata'
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Remove navigation and other non-content elements
        for element in soup.find_all(['nav', 'header', 'footer', 'aside']):
            element.decompose()

        # Try to find the main content area (Docusaurus specific selectors)
        content_selectors = [
            '[role="main"]',
            '.main-wrapper',
            '.container',
            '.theme-doc-markdown',
            '.markdown',
            '.doc-content',
            '.article',
            'main',
            '.content'
        ]

        content_element = None
        for selector in content_selectors:
            content_element = soup.select_one(selector)
            if content_element:
                break

        if not content_element:
            # If no specific content area found, use the body
            content_element = soup.find('body')

        # Extract text content
        if content_element:
            text_content = content_element.get_text(separator=' ', strip=True)
            # Clean up excessive whitespace
            text_content = re.sub(r'\s+', ' ', text_content)
        else:
            text_content = ""

        # Extract title
        title_tag = soup.find('title')
        title = title_tag.get_text().strip() if title_tag else url.split('/')[-1]

        return {
            'content': text_content,
            'title': title,
            'url': url,
            'metadata': {}
        }
    except Exception as e:
        logger.error(f"Error extracting content from {url}: {e}")
        return {
            'content': '',
            'title': '',
            'url': url,
            'metadata': {'error': str(e)}
        }

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[Dict[str, Any]]:
    """
    Split long text into smaller chunks with overlap.

    Args:
        text: The text to chunk
        chunk_size: Maximum size of each chunk
        overlap: Overlap between chunks

    Returns:
        List of chunk dictionaries with content and position
    """
    if not text:
        return []

    chunks = []
    start = 0
    position = 0

    while start < len(text):
        # Find a good breaking point (try to break at sentence or paragraph end)
        end = start + chunk_size

        if end >= len(text):
            # Last chunk
            chunk_text = text[start:]
            chunks.append({
                'content': chunk_text,
                'position': position,
                'start_idx': start,
                'end_idx': len(text)
            })
            break

        # Try to break at a sentence boundary
        chunk_text = text[start:end]
        last_sentence = chunk_text.rfind('. ')

        if last_sentence > chunk_size // 2:  # If we found a sentence and it's not too early
            actual_end = start + last_sentence + 2
            chunk_text = text[start:actual_end]
        else:
            # Try to break at paragraph
            last_para = chunk_text.rfind('\n\n')
            if last_para > chunk_size // 2:
                actual_end = start + last_para + 2
                chunk_text = text[start:actual_end]
            else:
                # Just take the chunk_size
                actual_end = end
                chunk_text = text[start:actual_end]

        chunks.append({
            'content': chunk_text,
            'position': position,
            'start_idx': start,
            'end_idx': actual_end
        })

        # Move start position with overlap
        start = actual_end - overlap
        position += 1

    logger.info(f"Text chunked into {len(chunks)} chunks")
    return chunks

def embed(text_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generate Cohere embeddings for text chunks.

    Args:
        text_chunks: List of text chunks to embed

    Returns:
        List of chunks with added embedding vectors
    """
    if not text_chunks:
        return []

    # Extract just the content for embedding
    texts = [chunk['content'] for chunk in text_chunks]

    try:
        # Generate embeddings using Cohere
        response = co.embed(
            texts=texts,
            model="embed-english-v3.0",  # Using a reliable model
            input_type="search_document"
        )

        # Add embeddings back to chunks
        embedded_chunks = []
        for i, chunk in enumerate(text_chunks):
            embedded_chunk = chunk.copy()
            embedded_chunk['embedding'] = response.embeddings[i]
            embedded_chunks.append(embedded_chunk)

        logger.info(f"Successfully embedded {len(embedded_chunks)} chunks")
        return embedded_chunks

    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        # Return chunks without embeddings if embedding fails
        for chunk in text_chunks:
            chunk['embedding'] = []
        return text_chunks

def create_collection(collection_name: str = COLLECTION_NAME) :
    """
    Create the Qdrant collection for storing embeddings.

    Args:
        collection_name: Name of the collection to create

    Returns:
        Boolean indicating success or failure
    """
    try:
        # Check if collection already exists
        try:
            qdrant_client.get_collection(collection_name)
            logger.info(f"Collection '{collection_name}' already exists")
            return True
        except:
            # Collection doesn't exist, create it
            pass

        # Create collection with 1024 dimensions (for Cohere embeddings)
        qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE)
        )

        logger.info(f"Successfully created collection '{collection_name}'")
        return True

    except Exception as e:
        logger.error(f"Error creating collection '{collection_name}': {e}")
        return False

def save_chunk_to_qdrant(chunk_data: Dict[str, Any], collection_name: str = COLLECTION_NAME) -> bool:
    """
    Save a single embedded chunk to Qdrant.

    Args:
        chunk_data: Chunk data with content, embedding, and metadata
        collection_name: Name of the collection to save to

    Returns:
        Boolean indicating success or failure
    """
    try:
        # Prepare the payload
        payload = {
            "content": chunk_data.get('content', ''),
            "source_url": chunk_data.get('url', ''),
            "source_title": chunk_data.get('title', ''),
            "chunk_position": chunk_data.get('position', 0),
            "metadata": chunk_data.get('metadata', {})
        }

        # Generate a unique ID for this chunk
        import hashlib
        content_hash = hashlib.md5(f"{chunk_data.get('url', '')}_{chunk_data.get('position', 0)}".encode()).hexdigest()

        # Prepare the point
        point = models.PointStruct(
            id=content_hash,
            vector=chunk_data.get('embedding', []),
            payload=payload
        )

        # Upsert the point into the collection
        qdrant_client.upsert(
            collection_name=collection_name,
            points=[point]
        )

        logger.info(f"Successfully saved chunk to Qdrant: {content_hash[:8]}...")
        return True

    except Exception as e:
        logger.error(f"Error saving chunk to Qdrant: {e}")
        return False

def run_embedding_pipeline():
    """
    Function that orchestrates the entire embedding pipeline.
    """
    logger.info("Starting embedding pipeline...")

    # Target site URL
    target_site = TARGET_SITE_URL

    # Step 1: Create the Qdrant collection
    logger.info("Creating Qdrant collection...")
    if not create_collection(COLLECTION_NAME):
        logger.error("Failed to create Qdrant collection. Exiting.")
        return

    # Step 2: Get all URLs from the site
    logger.info("Discovering URLs...")
    urls = get_all_urls(target_site)
    logger.info(f"Discovered {len(urls)} URLs to process")

    # Process each URL
    processed_count = 0
    for url in urls:
        logger.info(f"Processing URL ({processed_count + 1}/{len(urls)}): {url}")

        # Step 3: Extract text from the URL
        content_data = extract_text_from_url(url)

        if not content_data['content'].strip():
            logger.warning(f"No content extracted from {url}, skipping...")
            continue

        # Step 4: Chunk the text
        text_chunks = chunk_text(content_data['content'])

        # Add URL and title to each chunk
        for chunk in text_chunks:
            chunk['url'] = content_data['url']
            chunk['title'] = content_data['title']
            chunk['metadata'] = content_data['metadata']

        # Step 5: Generate embeddings
        embedded_chunks = embed(text_chunks)

        # Step 6: Save each chunk to Qdrant
        for chunk in embedded_chunks:
            if chunk.get('embedding'):  # Only save chunks that have embeddings
                save_chunk_to_qdrant(chunk)

        processed_count += 1

        # Be respectful to the API
        time.sleep(RATE_LIMIT_DELAY)

    logger.info(f"Pipeline completed. Processed {processed_count} pages successfully.")


def run_api_service():
    """
    Function to run the RAG Agent API service.
    """
    import uvicorn
    from api.main import app

    # Get host and port from environment variables or use defaults
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", 8000))

    print(f"Starting RAG Agent API service on {host}:{port}")
    print("API documentation available at:")
    print(f"  - Swagger UI: http://{host}:{port}/docs")
    print(f"  - ReDoc: http://{host}:{port}/redoc")

    # Run the FastAPI application with uvicorn
    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        reload=True,  # Set to False in production
        log_level="info"
    )


def main():
    """
    Main function to run either the embedding pipeline or the API service
    based on command line arguments.
    """
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "pipeline":
            run_embedding_pipeline()
        elif sys.argv[1] == "api":
            run_api_service()
        else:
            print("Usage: python main.py [pipeline|api]")
            print("  pipeline: Run the embedding pipeline to index content")
            print("  api: Run the RAG Agent API service")
    else:
        # Default to running the API service
        run_api_service()


if __name__ == "__main__":
    main()