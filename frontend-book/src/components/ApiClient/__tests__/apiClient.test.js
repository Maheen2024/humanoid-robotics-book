/**
 * Unit tests for the API client
 */

import axios from 'axios';
import { queryRag, healthCheck, getConfig } from '../apiClient';

// Mock axios
jest.mock('axios');

describe('API Client', () => {
  const mockAxios = axios;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment variables
    process.env.REACT_APP_API_BASE_URL = 'http://localhost:8000';
    process.env.REACT_APP_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.REACT_APP_API_BASE_URL;
    delete process.env.REACT_APP_API_KEY;
  });

  describe('queryRag', () => {
    test('should make a successful query request', async () => {
      // Mock successful response
      const mockResponse = {
        data: {
          success: true,
          data: {
            answer: 'This is a test answer',
            sources: [],
            confidence_score: 0.9,
            tokens_used: 50,
            processing_time_ms: 100,
            hallucination_detected: false
          },
          request_id: 'test-request-id',
          timestamp: '2025-12-24T10:30:00.123Z'
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      const result = await queryRag({
        query: 'Test question?',
        max_chunks: 5,
        temperature: 0.1,
        include_sources: true,
        timeout: 30
      });

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/rag/query',
        {
          query: 'Test question?',
          max_chunks: 5,
          temperature: 0.1,
          include_sources: true,
          timeout: 30
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    test('should validate query parameters', async () => {
      await expect(queryRag({ query: '' })).rejects.toThrow('Query is required and must be a non-empty string');
      await expect(queryRag({ query: 'A'.repeat(1001) })).rejects.toThrow('Query exceeds maximum length of 1000 characters');
    });

    test('should handle API error responses', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Invalid query parameters'
            }
          }
        }
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(queryRag({ query: 'Test' })).rejects.toThrow('Bad Request: Invalid query parameters');
    });

    test('should handle network errors', async () => {
      const errorResponse = {
        request: {}
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(queryRag({ query: 'Test' })).rejects.toThrow('Network Error: Unable to reach the server');
    });

    test('should handle server errors', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            error: {
              message: 'Internal server error'
            }
          }
        }
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(queryRag({ query: 'Test' })).rejects.toThrow('Server Error (500): Internal server error');
    });

    test('should handle 401 unauthorized errors', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: {}
        }
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(queryRag({ query: 'Test' })).rejects.toThrow('Unauthorized: Invalid API key');
    });

    test('should handle 429 rate limit errors', async () => {
      const errorResponse = {
        response: {
          status: 429,
          data: {}
        }
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(queryRag({ query: 'Test' })).rejects.toThrow('Rate Limited: Too many requests, please try again later');
    });

    test('should normalize parameter ranges', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { answer: 'Test', sources: [], confidence_score: 0.9, tokens_used: 50, processing_time_ms: 100, hallucination_detected: false },
          request_id: 'test-request-id',
          timestamp: '2025-12-24T10:30:00.123Z'
        }
      };

      mockAxios.post.mockResolvedValue(mockResponse);

      await queryRag({
        query: 'Test',
        max_chunks: 15, // Should be normalized to 10
        temperature: 1.5, // Should be normalized to 1.0
        timeout: 70 // Should be normalized to 60
      });

      expect(mockAxios.post).toHaveBeenCalledWith(
        '/api/v1/rag/query',
        expect.objectContaining({
          max_chunks: 10,
          temperature: 1.0,
          timeout: 60
        })
      );
    });
  });

  describe('healthCheck', () => {
    test('should make a successful health check request', async () => {
      const mockResponse = {
        data: {
          status: 'healthy',
          services: { qdrant: 'healthy', openai: 'healthy', api: 'healthy' },
          version: '1.0.0',
          uptime_seconds: 1200
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await healthCheck();

      expect(mockAxios.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle health check errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(healthCheck()).rejects.toThrow('Health check failed: Network error');
    });
  });

  describe('getConfig', () => {
    test('should make a successful config request', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            max_query_length: 1000,
            max_chunks_per_query: 5,
            min_similarity_score: 0.5,
            agent_temperature: 0.1,
            timeout_seconds: 30
          },
          request_id: 'test-request-id',
          timestamp: '2025-12-24T10:30:00.123Z'
        }
      };

      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await getConfig();

      expect(mockAxios.get).toHaveBeenCalledWith('/config');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle config request errors', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(getConfig()).rejects.toThrow('Config retrieval failed: Network error');
    });
  });

  test('should apply default timeout and headers', () => {
    // Test that the axios instance is configured with defaults
    expect(axios.defaults.timeout).toBeGreaterThan(0);
    expect(axios.defaults.headers['Content-Type']).toBe('application/json');
  });

  test('should include API key in headers when provided', async () => {
    const mockResponse = {
      data: { success: true, data: { answer: 'Test', sources: [], confidence_score: 0.9, tokens_used: 50, processing_time_ms: 100, hallucination_detected: false }, request_id: 'test-request-id', timestamp: '2025-12-24T10:30:00.123Z' }
    };

    mockAxios.post.mockResolvedValue(mockResponse);

    await queryRag({ query: 'Test' });

    // Check that headers include authorization when API key is provided
    expect(mockAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key'
        })
      })
    );
  });
});