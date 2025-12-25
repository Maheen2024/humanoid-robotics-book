import pytest
import asyncio
from unittest.mock import Mock, patch
from agents.rag_agent import RAGAgent, RetrievedContext, RetrievedChunk
from api.models.requests import QueryRequest


class TestRAGAgent:
    """
    Test class for RAG Agent functionality.
    """

    def setup_method(self):
        """
        Set up test fixtures before each test method.
        """
        self.rag_agent = RAGAgent()

    def test_rag_agent_initialization(self):
        """
        Test that the RAG agent initializes with correct default values.
        """
        assert self.rag_agent.temperature == 0.1  # Default from env or code
        assert self.rag_agent.max_chunks == 5     # Default from env or code

    @patch('agents.rag_agent.openai.ChatCompletion.create')
    def test_generate_response(self, mock_openai_create):
        """
        Test the generate_response method with mocked OpenAI API call.
        """
        # Mock the OpenAI API response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "This is a test answer."
        mock_response.usage.total_tokens = 25
        mock_openai_create.return_value = mock_response

        # Create a retrieved context with mock data
        mock_chunk = RetrievedChunk(
            content="Test content for the chunk.",
            source_url="https://example.com",
            source_title="Test Document",
            chunk_position=1,
            similarity_score=0.85,
            metadata={}
        )
        retrieved_context = RetrievedContext(
            chunks=[mock_chunk],
            total_chunks_found=1,
            search_time_ms=10.5
        )

        # Call the generate_response method
        result = self.rag_agent.generate_response(
            query="What is test content?",
            retrieved_context=retrieved_context,
            include_sources=True
        )

        # Verify the result
        assert result.answer == "This is a test answer."
        assert result.tokens_used == 25
        assert len(result.sources) == 1
        assert result.sources[0].source_url == "https://example.com"
        assert result.sources[0].source_title == "Test Document"

    @patch('agents.rag_agent.openai.ChatCompletion.create')
    def test_generate_response_error_handling(self, mock_openai_create):
        """
        Test that generate_response handles API errors gracefully.
        """
        # Configure the mock to raise an exception
        mock_openai_create.side_effect = Exception("API Error")

        # Create a retrieved context with mock data
        mock_chunk = RetrievedChunk(
            content="Test content for the chunk.",
            source_url="https://example.com",
            source_title="Test Document",
            chunk_position=1,
            similarity_score=0.85,
            metadata={}
        )
        retrieved_context = RetrievedContext(
            chunks=[mock_chunk],
            total_chunks_found=1,
            search_time_ms=10.5
        )

        # Call the generate_response method
        result = self.rag_agent.generate_response(
            query="What is test content?",
            retrieved_context=retrieved_context,
            include_sources=True
        )

        # Verify the error response
        assert "An error occurred while processing your request" in result.answer
        assert len(result.sources) == 0
        assert result.tokens_used == 0


class TestQueryRequest:
    """
    Test class for QueryRequest model.
    """

    def test_query_request_defaults(self):
        """
        Test that QueryRequest has correct default values.
        """
        request = QueryRequest(query="Test query")

        # Check defaults
        assert request.max_chunks == 5
        assert request.temperature == 0.1
        assert request.include_sources is True
        assert request.timeout == 30

    def test_query_request_custom_values(self):
        """
        Test that QueryRequest accepts custom values.
        """
        request = QueryRequest(
            query="Test query",
            max_chunks=3,
            temperature=0.5,
            include_sources=False,
            timeout=60
        )

        assert request.max_chunks == 3
        assert request.temperature == 0.5
        assert request.include_sources is False
        assert request.timeout == 60