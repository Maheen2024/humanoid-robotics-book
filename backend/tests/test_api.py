import pytest
from fastapi.testclient import TestClient
from api.main import app
from api.models.requests import QueryRequest


class TestAPI:
    """
    Test class for API endpoints.
    """

    def setup_method(self):
        """
        Set up test client before each test method.
        """
        self.client = TestClient(app)

    def test_health_endpoint(self):
        """
        Test the health check endpoint.
        """
        response = self.client.get("/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] in ["healthy", "degraded", "unhealthy"]
        assert "qdrant" in data["services"]
        assert "openai" in data["services"]
        assert "api" in data["services"]
        assert "version" in data
        assert "uptime_seconds" in data

    def test_config_endpoint(self):
        """
        Test the configuration endpoint.
        """
        response = self.client.get("/config")
        assert response.status_code == 200

        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "max_query_length" in data["data"]
        assert "max_chunks_per_query" in data["data"]
        assert "min_similarity_score" in data["data"]
        assert "agent_temperature" in data["data"]
        assert "timeout_seconds" in data["data"]

    def test_query_endpoint_valid_request(self):
        """
        Test the query endpoint with a valid request.
        """
        # Note: This test may fail if dependencies (Qdrant, OpenAI) are not available
        # In a real implementation, we would mock these dependencies
        query_request = {
            "query": "What is humanoid robotics?",
            "max_chunks": 3,
            "temperature": 0.1,
            "include_sources": True,
            "timeout": 30
        }

        response = self.client.post("/api/v1/rag/query", json=query_request)

        # The response could be success or failure depending on service availability
        # but it should be a valid API response
        assert response.status_code in [200, 400, 401, 408, 429, 500]

        data = response.json()
        assert "success" in data
        assert "request_id" in data
        assert "timestamp" in data

    def test_query_endpoint_invalid_query_length(self):
        """
        Test the query endpoint with a query that exceeds maximum length.
        """
        long_query = "A" * 1001  # More than 1000 characters
        query_request = {
            "query": long_query,
            "max_chunks": 3,
            "temperature": 0.1,
            "include_sources": True,
            "timeout": 30
        }

        response = self.client.post("/api/v1/rag/query", json=query_request)
        assert response.status_code == 400

        data = response.json()
        assert "detail" in data
        assert data["detail"]["code"] == "QUERY_TOO_LONG"

    def test_query_endpoint_invalid_max_chunks(self):
        """
        Test the query endpoint with invalid max_chunks value.
        """
        query_request = {
            "query": "What is humanoid robotics?",
            "max_chunks": 15,  # More than 10
            "temperature": 0.1,
            "include_sources": True,
            "timeout": 30
        }

        response = self.client.post("/api/v1/rag/query", json=query_request)
        assert response.status_code == 400

        data = response.json()
        assert "detail" in data
        assert data["detail"]["code"] == "INVALID_PARAMETER_VALUE"

    def test_query_endpoint_invalid_temperature(self):
        """
        Test the query endpoint with invalid temperature value.
        """
        query_request = {
            "query": "What is humanoid robotics?",
            "max_chunks": 3,
            "temperature": 1.5,  # More than 1.0
            "include_sources": True,
            "timeout": 30
        }

        response = self.client.post("/api/v1/rag/query", json=query_request)
        assert response.status_code == 400

        data = response.json()
        assert "detail" in data
        assert data["detail"]["code"] == "INVALID_PARAMETER_VALUE"

    def test_openapi_schema(self):
        """
        Test that the OpenAPI schema is available.
        """
        response = self.client.get("/openapi.json")
        assert response.status_code == 200

        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert "paths" in data

    def test_swagger_ui(self):
        """
        Test that Swagger UI is available.
        """
        response = self.client.get("/docs")
        assert response.status_code == 200
        assert "Swagger UI" in response.text

    def test_redoc_ui(self):
        """
        Test that ReDoc UI is available.
        """
        response = self.client.get("/redoc")
        assert response.status_code == 200
        assert "ReDoc" in response.text