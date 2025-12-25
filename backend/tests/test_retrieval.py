import pytest
from unittest.mock import Mock, patch, MagicMock
from agents.retrieval import QdrantRetrieval
from agents.rag_agent import RetrievedContext


class TestQdrantRetrieval:
    """
    Test class for Qdrant retrieval functionality.
    """

    def setup_method(self):
        """
        Set up test fixtures before each test method.
        """
        # We'll mock the Qdrant client to avoid needing a real Qdrant instance
        with patch('agents.retrieval.qdrant_client.QdrantClient'):
            with patch('agents.retrieval.cohere.Client'):
                self.retriever = QdrantRetrieval()

    @patch('agents.retrieval.qdrant_client.QdrantClient')
    @patch('agents.retrieval.cohere.Client')
    def test_initialization(self, mock_cohere, mock_qdrant):
        """
        Test that the QdrantRetrieval initializes correctly.
        """
        # Mock the necessary methods
        mock_qdrant_instance = Mock()
        mock_qdrant_instance.get_collections.return_value = Mock()
        mock_qdrant_instance.get_collections().collections = []
        mock_cohere_instance = Mock()
        mock_cohere_instance.embed.return_value = Mock()
        mock_cohere_instance.embed().embeddings = [[0.1, 0.2, 0.3]]

        mock_qdrant.return_value = mock_qdrant_instance
        mock_cohere.return_value = mock_cohere_instance

        retriever = QdrantRetrieval()

        assert retriever.qdrant_host == "localhost"
        assert retriever.qdrant_port == 6333
        assert retriever.collection_name == "book_content"

    @patch('agents.retrieval.cohere.Client')
    @patch('agents.retrieval.qdrant_client.QdrantClient')
    def test_generate_embeddings(self, mock_qdrant_class, mock_cohere_class):
        """
        Test the generate_embeddings method.
        """
        # Set up mocks
        mock_cohere_instance = Mock()
        mock_cohere_instance.embed.return_value = Mock()
        mock_cohere_instance.embed().embeddings = [[0.1, 0.2, 0.3, 0.4]]
        mock_cohere_class.return_value = mock_cohere_instance

        mock_qdrant_instance = Mock()
        mock_qdrant_instance.get_collections.return_value = Mock()
        mock_qdrant_instance.get_collections().collections = []
        mock_qdrant_class.return_value = mock_qdrant_instance

        # Create retriever instance
        retriever = QdrantRetrieval()

        # Test embedding generation
        text = "Test text for embedding"
        embedding = retriever.generate_embeddings(text)

        # Verify the result
        assert embedding == [0.1, 0.2, 0.3, 0.4]
        mock_cohere_instance.embed.assert_called_once_with(
            texts=[text],
            model="embed-multilingual-v2.0"
        )

    @patch('agents.retrieval.cohere.Client')
    @patch('agents.retrieval.qdrant_client.QdrantClient')
    def test_generate_embeddings_error(self, mock_qdrant_class, mock_cohere_class):
        """
        Test the generate_embeddings method handles errors gracefully.
        """
        # Set up mocks
        mock_cohere_instance = Mock()
        mock_cohere_instance.embed.side_effect = Exception("API Error")
        mock_cohere_class.return_value = mock_cohere_instance

        mock_qdrant_instance = Mock()
        mock_qdrant_instance.get_collections.return_value = Mock()
        mock_qdrant_instance.get_collections().collections = []
        mock_qdrant_class.return_value = mock_qdrant_instance

        # Create retriever instance
        retriever = QdrantRetrieval()

        # Test embedding generation with error
        text = "Test text for embedding"
        embedding = retriever.generate_embeddings(text)

        # Verify the result
        assert embedding == []

    @patch('agents.retrieval.cohere.Client')
    @patch('agents.retrieval.qdrant_client.QdrantClient')
    def test_search_similar(self, mock_qdrant_class, mock_cohere_class):
        """
        Test the search_similar method.
        """
        # Set up mocks
        mock_cohere_instance = Mock()
        mock_cohere_instance.embed.return_value = Mock()
        mock_cohere_instance.embed().embeddings = [[0.1, 0.2, 0.3, 0.4]]
        mock_cohere_class.return_value = mock_cohere_instance

        mock_qdrant_instance = Mock()
        mock_qdrant_instance.get_collections.return_value = Mock()
        mock_qdrant_instance.get_collections().collections = []

        # Mock the search result
        mock_search_result = [Mock()]
        mock_search_result[0].payload = {
            "content": "Test content",
            "source_url": "https://example.com",
            "source_title": "Test Document",
            "chunk_position": 1,
            "metadata": {}
        }
        mock_search_result[0].score = 0.85

        mock_qdrant_instance.search.return_value = mock_search_result
        mock_qdrant_class.return_value = mock_qdrant_instance

        # Create retriever instance
        retriever = QdrantRetrieval()

        # Test similarity search
        query = "Test query"
        result = retriever.search_similar(query, top_k=1)

        # Verify the result
        assert isinstance(result, RetrievedContext)
        assert len(result.chunks) == 1
        assert result.chunks[0].content == "Test content"
        assert result.chunks[0].source_url == "https://example.com"
        assert result.chunks[0].source_title == "Test Document"
        assert result.chunks[0].similarity_score == 0.85

    @patch('agents.retrieval.cohere.Client')
    @patch('agents.retrieval.qdrant_client.QdrantClient')
    def test_search_similar_no_embeddings(self, mock_qdrant_class, mock_cohere_class):
        """
        Test the search_similar method when embeddings generation fails.
        """
        # Set up mocks
        mock_cohere_instance = Mock()
        mock_cohere_instance.embed.return_value = Mock()
        mock_cohere_instance.embed().embeddings = [[]]  # Empty embedding
        mock_cohere_class.return_value = mock_cohere_instance

        mock_qdrant_instance = Mock()
        mock_qdrant_instance.get_collections.return_value = Mock()
        mock_qdrant_instance.get_collections().collections = []
        mock_qdrant_class.return_value = mock_qdrant_instance

        # Create retriever instance
        retriever = QdrantRetrieval()

        # Test similarity search with no embeddings
        query = "Test query"
        result = retriever.search_similar(query, top_k=1)

        # Verify the result
        assert isinstance(result, RetrievedContext)
        assert len(result.chunks) == 0
        assert result.total_chunks_found == 0