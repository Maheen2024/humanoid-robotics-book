# API Contracts: RAG Agent and API Service

**Feature**: RAG Agent and API Service
**Created**: 2025-12-24
**Branch**: `006-rag-agent-api`
**Related Spec**: [specs/006-rag-agent-api/spec.md](specs/006-rag-agent-api/spec.md)

## Overview

This document defines the API contracts for the RAG Agent and API Service, including request/response schemas, HTTP status codes, error handling, and service-level agreements. These contracts ensure consistent behavior and reliable integration between the service and its consumers.

## API Versioning

- **Base URL**: `/api/v1/`
- **Version Strategy**: URL-based versioning (v1, v2, etc.)
- **Backward Compatibility**: Maintained within the same major version
- **Deprecation Policy**: 6 months notice before removing endpoints

## Authentication

All API endpoints require authentication using API keys:

```
Authorization: Bearer <api_key>
```

Or alternatively:
```
X-API-Key: <api_key>
```

## API Endpoints

### 1. Query Endpoint

**Endpoint**: `POST /api/v1/rag/query`

**Purpose**: Submit a question to the RAG agent and receive an AI-generated response based on book content.

**Request**:
```
POST /api/v1/rag/query
Content-Type: application/json
Authorization: Bearer <api_key>
```

**Request Body**:
```json
{
  "query": "string (required, 1-1000 characters)",
  "max_chunks": "integer (optional, default: 5, range: 1-10)",
  "temperature": "float (optional, default: 0.1, range: 0.0-1.0)",
  "include_sources": "boolean (optional, default: true)",
  "timeout": "integer (optional, default: 30, range: 5-60)"
}
```

**Response Codes**:
- `200 OK`: Successful query processing
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Invalid or missing API key
- `408 Request Timeout`: Query processing exceeded timeout
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Service error

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "answer": "string",
    "sources": [
      {
        "source_url": "string",
        "source_title": "string",
        "content_preview": "string (max 200 chars)",
        "relevance_score": "float (0.0-1.0)"
      }
    ],
    "confidence_score": "float (0.0-1.0)",
    "tokens_used": "integer",
    "processing_time_ms": "float",
    "hallucination_detected": "boolean"
  },
  "request_id": "string",
  "timestamp": "string (ISO 8601)"
}
```

**Error Response (4xx/5xx)**:
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  },
  "request_id": "string",
  "timestamp": "string (ISO 8601)"
}
```

### 2. Health Check Endpoint

**Endpoint**: `GET /health`

**Purpose**: Check the health status of the service and its dependencies.

**Request**:
```
GET /health
```

**Response Codes**:
- `200 OK`: Service is healthy
- `503 Service Unavailable`: Service or dependencies are unhealthy

**Success Response (200)**:
```json
{
  "status": "string (healthy|degraded|unhealthy)",
  "services": {
    "qdrant": "string (healthy|unhealthy)",
    "openai": "string (healthy|unhealthy)",
    "api": "string (healthy|unhealthy)"
  },
  "version": "string",
  "uptime_seconds": "integer"
}
```

### 3. Configuration Endpoint

**Endpoint**: `GET /config`

**Purpose**: Retrieve current configuration parameters.

**Request**:
```
GET /config
Authorization: Bearer <api_key>
```

**Response Codes**:
- `200 OK`: Configuration retrieved successfully
- `401 Unauthorized`: Invalid or missing API key

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "max_query_length": "integer",
    "max_chunks_per_query": "integer",
    "min_similarity_score": "float (0.0-1.0)",
    "agent_temperature": "float (0.0-1.0)",
    "timeout_seconds": "integer"
  },
  "request_id": "string",
  "timestamp": "string (ISO 8601)"
}
```

## Error Contracts

### 1. Error Response Format

All error responses follow the same structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable error message",
    "details": {
      // Optional error-specific details
    }
  },
  "request_id": "unique_request_identifier",
  "timestamp": "2025-12-24T10:30:00.123Z"
}
```

### 2. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | API key is missing or invalid |
| `INVALID_REQUEST` | 400 | Request parameters are invalid |
| `QUERY_TOO_LONG` | 400 | Query exceeds maximum allowed length |
| `INVALID_PARAMETER_VALUE` | 400 | Parameter value is outside allowed range |
| `RATE_LIMIT_EXCEEDED` | 429 | Request rate limit has been exceeded |
| `QUERY_TIMEOUT` | 408 | Query processing exceeded timeout |
| `CONTENT_NOT_FOUND` | 404 | No relevant content found for query |
| `SERVICE_UNAVAILABLE` | 503 | Service or dependency is unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected internal error occurred |

### 3. Specific Error Details

**QUERY_TOO_LONG**:
```json
{
  "code": "QUERY_TOO_LONG",
  "message": "Query exceeds maximum length of 1000 characters",
  "details": {
    "max_length": 1000,
    "actual_length": 1200
  }
}
```

**INVALID_PARAMETER_VALUE**:
```json
{
  "code": "INVALID_PARAMETER_VALUE",
  "message": "Parameter 'max_chunks' must be between 1 and 10",
  "details": {
    "parameter": "max_chunks",
    "expected_range": "1-10",
    "actual_value": 15
  }
}
```

## Performance Contracts

### 1. Response Time SLAs

| Endpoint | P95 Response Time | P99 Response Time |
|----------|-------------------|-------------------|
| `/api/v1/rag/query` | 3000ms | 5000ms |
| `/health` | 100ms | 200ms |
| `/config` | 100ms | 200ms |

### 2. Availability SLAs

- **Overall Service Availability**: 99.9% monthly uptime
- **Query Endpoint Availability**: 99.5% monthly uptime
- **Health Check Availability**: 99.9% monthly uptime

### 3. Throughput Limits

- **Concurrent Requests**: 100 requests per second per API key
- **Daily Request Limit**: 10,000 requests per API key
- **Query Rate Limit**: 10 queries per minute per API key

## Data Contracts

### 1. Request Validation

All requests are validated according to these rules:

- **String Fields**: Trimmed of leading/trailing whitespace
- **Required Fields**: Must be present and non-empty
- **Numeric Fields**: Must be within specified ranges
- **URL Fields**: Must be properly formatted URLs
- **Boolean Fields**: Accept true/false values

### 2. Response Guarantees

- **Consistent Structure**: All responses follow the APIResponse envelope
- **Field Presence**: Required fields are always present
- **Data Types**: All fields maintain consistent data types
- **Format Compliance**: Dates in ISO 8601, IDs in specified format

## Security Contracts

### 1. Authentication Requirements

- All endpoints except `/health` require valid API key
- API keys must be sent in Authorization header or X-API-Key header
- Invalid API keys return 401 status code

### 2. Rate Limiting

- Requests are limited by API key
- Exceeded requests return 429 status code
- Rate limit information included in response headers

### 3. Input Sanitization

- All user inputs are sanitized to prevent injection attacks
- Special characters are properly escaped
- Content validation prevents malicious input

## Integration Contracts

### 1. Dependency Contracts

**Qdrant Vector Database**:
- Connection must be established at startup
- Vector search must complete within 2000ms (P95)
- Similarity search using cosine distance metric
- Collection name must match configured value

**OpenAI API**:
- API key must have sufficient permissions
- Response generation must complete within timeout
- Token usage must be tracked and limited
- Rate limits must be respected

**Cohere API** (for embeddings):
- Embedding generation must complete within 5000ms
- Embedding dimensions must match Qdrant configuration
- Rate limits must be respected

### 2. Backward Compatibility

- Response schemas maintain backward compatibility within major versions
- New optional fields may be added without breaking existing clients
- Required fields will not be removed or changed within major version
- Deprecation notice provided 6 months before removal

## Monitoring and Observability

### 1. Required Metrics

- Request count and success rate
- Response time percentiles (P50, P95, P99)
- Error rate by error code
- API key usage statistics
- Dependency health status

### 2. Logging Requirements

- All requests logged with request_id
- Error conditions logged with full context
- Performance metrics logged for analysis
- Security events logged for audit purposes

## Testing Contracts

### 1. Contract Testing

- API responses must match documented schemas
- Error responses must follow standard error format
- Response times must meet SLA requirements
- Authentication must work as specified

### 2. Integration Testing

- All endpoints must be functionally tested
- Error scenarios must be validated
- Performance requirements must be verified
- Security controls must be tested