# Data Model: Frontend-Backend Integration

**Feature**: Frontend-Backend Integration
**Created**: 2025-12-24
**Branch**: `007-fe-be-integration-target-audience-developers-focus-integrate-fastapi-rag-backend-with-docusaurus-frontend-for-chatbot-queries`
**Related Spec**: [specs/007-fe-be-integration-target-audience-developers-focus-integrate-fastapi-rag-backend-with-docusaurus-frontend-for-chatbot-queries/spec.md](specs/007-fe-be-integration-target-audience-developers-focus-integrate-fastapi-rag-backend-with-docusaurus-frontend-for-chatbot-queries/spec.md)

## Overview

This document defines the data models for the Frontend-Backend Integration feature, including request/response schemas, entity relationships, and data flow patterns. The models ensure consistent data handling between the Docusaurus frontend chatbot and the FastAPI RAG backend.

## Core Entities

### 1. Chat Message

**Purpose**: Represents a single message in the chat conversation between user and AI assistant.

**Schema**:
```javascript
{
  id: string
    description: "Unique identifier for the message"
    constraints: "Required, UUID format"
    example: "msg_1234567890"

  content: string
    description: "The text content of the message"
    constraints: "Required, 1-2000 characters"
    example: "What are the key principles of humanoid robotics?"

  sender: "user" | "assistant"
    description: "Indicates whether message is from user or assistant"
    constraints: "Required, enum values"
    example: "user"

  timestamp: string
    description: "ISO 8601 timestamp of when message was created"
    constraints: "Required"
    example: "2025-12-24T10:30:00.123Z"

  sources: Array<SourceCitation>
    description: "Source citations for assistant responses"
    constraints: "Optional, present only for assistant messages"
    example: "[{...source_citation...}]"

  status: "pending" | "sent" | "delivered" | "error"
    description: "Delivery status of the message"
    constraints: "Required for frontend state management"
    example: "delivered"
}
```

**Validation Rules**:
- content must be non-empty and not exceed 2000 characters
- sender must be either "user" or "assistant"
- timestamp must be in ISO 8601 format
- sources only applicable for "assistant" messages

### 2. Chat Session

**Purpose**: Represents a user's conversation context, potentially spanning multiple page views.

**Schema**:
```javascript
{
  id: string
    description: "Unique identifier for the chat session"
    constraints: "Required, UUID format"
    example: "session_1234567890"

  messages: Array<ChatMessage>
    description: "List of messages in the conversation"
    constraints: "Required, 1-100 messages"
    example: "[{...chat_message...}]"

  createdAt: string
    description: "ISO 8601 timestamp of session creation"
    constraints: "Required"
    example: "2025-12-24T10:30:00.123Z"

  lastActive: string
    description: "ISO 8601 timestamp of last message"
    constraints: "Required"
    example: "2025-12-24T10:35:00.456Z"

  pageContext: string
    description: "URL or identifier of the documentation page"
    constraints: "Optional"
    example: "/docs/introduction"

  isActive: boolean
    description: "Whether the session is currently active"
    constraints: "Required"
    example: true
}
```

**Validation Rules**:
- messages must contain between 1 and 100 messages
- createdAt and lastActive must be in ISO 8601 format
- isActive must be a boolean value

### 3. API Request

**Purpose**: The structured query sent from frontend to the RAG backend API.

**Schema**:
```javascript
{
  query: string
    description: "The user's question or query text"
    constraints: "Required, 1-1000 characters"
    example: "What are the key principles of humanoid robotics?"

  max_chunks: number
    description: "Maximum number of document chunks to retrieve"
    constraints: "Optional, default 5, range 1-10"
    example: 3

  temperature: number
    description: "Temperature parameter for response generation"
    constraints: "Optional, default 0.1, range 0.0-1.0"
    example: 0.2

  include_sources: boolean
    description: "Whether to include source citations in response"
    constraints: "Optional, default True"
    example: True

  timeout: number
    description: "Request timeout in seconds"
    constraints: "Optional, default 30, range 5-60"
    example: 45

  pageContext: string
    description: "Context of the current documentation page"
    constraints: "Optional"
    example: "/docs/introduction"
}
```

**Validation Rules**:
- query must be non-empty and not exceed 1000 characters
- max_chunks must be between 1 and 10
- temperature must be between 0.0 and 1.0
- timeout must be between 5 and 60 seconds

### 4. API Response

**Purpose**: The structured response from the RAG backend containing answer and metadata.

**Schema**:
```javascript
{
  success: boolean
    description: "Whether the request was successful"
    constraints: "Required"
    example: True

  data: {
    answer: string
      description: "The agent's answer to the user's query"
      constraints: "Required if success is True"
      example: "Humanoid robotics involves creating robots with human-like characteristics..."

    sources: Array<SourceCitation>
      description: "List of sources used to generate the answer"
      constraints: "Required if include_sources was True in request"
      example: "[{...citation1...}, {...citation2...}]"

    confidence_score: number
      description: "Confidence score for the generated answer (0.0-1.0)"
      constraints: "Required, range 0.0-1.0"
      example: 0.92

    tokens_used: number
      description: "Number of tokens used in the response"
      constraints: "Required, positive"
      example: 156

    processing_time_ms: number
      description: "Total time for processing the query in milliseconds"
      constraints: "Required, positive"
      example: 1245.6

    hallucination_detected: boolean
      description: "Whether hallucination was detected in the response"
      constraints: "Required, default False"
      example: False
  }

  error: {
    code: string
      description: "Error code for the failure"
      constraints: "Required if success is False"
      example: "QUERY_TOO_LONG"

    message: string
      description: "Human-readable error message"
      constraints: "Required if success is False"
      example: "Query exceeds maximum length of 1000 characters"

    details: object
      description: "Additional error-specific details"
      constraints: "Optional"
      example: {"max_length": 1000, "actual_length": 1200}
  }

  request_id: string
    description: "Unique identifier for this request"
    constraints: "Required"
    example: "req_1234567890"

  timestamp: string
    description: "ISO 8601 timestamp of the response"
    constraints: "Required"
    example: "2025-12-24T10:30:00.123Z"
}
```

**Validation Rules**:
- If success is True, data must be present and error must be null
- If success is False, error must be present and data must be null
- request_id must be a unique identifier
- timestamp must be in ISO 8601 format
- confidence_score must be between 0.0 and 1.0

### 5. Source Citation

**Purpose**: Reference to documentation pages that contributed to the response.

**Schema**:
```javascript
{
  source_url: string
    description: "URL of the source document"
    constraints: "Required"
    example: "https://example.com/docs/principles"

  source_title: string
    description: "Title of the source document"
    constraints: "Required"
    example: "Core Principles"

  content_preview: string
    description: "Preview of the content that was used"
    constraints: "Required, max 200 characters"
    example: "Humanoid robotics involves creating robots with human-like characteristics..."

  relevance_score: number
    description: "Relevance score of this source to the query"
    constraints: "Required, range 0.0-1.0"
    example: 0.85
}
```

**Validation Rules**:
- All fields are required
- content_preview must not exceed 200 characters
- relevance_score must be between 0.0 and 1.0

### 6. Frontend State Model

**Purpose**: Internal state representation for the chatbot component.

**Schema**:
```javascript
{
  currentMessage: string
    description: "Current user input in the chat input field"
    constraints: "Required, may be empty"
    example: "What is forward kinematics?"

  isProcessing: boolean
    description: "Whether a message is currently being processed"
    constraints: "Required"
    example: false

  error: string | null
    description: "Current error message if any"
    constraints: "Optional"
    example: "Network error occurred"

  chatHistory: Array<ChatMessage>
    description: "History of messages in the current session"
    constraints: "Required"
    example: "[{...chat_message...}]"

  sessionId: string | null
    description: "Current active session ID"
    constraints: "Optional"
    example: "session_1234567890"

  pageContext: string
    description: "Current documentation page context"
    constraints: "Required"
    example: "/docs/kinematics"
}
```

**Validation Rules**:
- isProcessing must be a boolean
- error must be either a string or null
- chatHistory must be an array of ChatMessage objects

## Supporting Entities

### 7. API Configuration

**Purpose**: Configuration parameters for API communication.

**Schema**:
```javascript
{
  baseUrl: string
    description: "Base URL for the API"
    constraints: "Required"
    example: "http://localhost:8000"

  timeout: number
    description: "Request timeout in milliseconds"
    constraints: "Required, positive"
    example: 30000

  retryAttempts: number
    description: "Number of retry attempts for failed requests"
    constraints: "Required, non-negative"
    example: 3

  headers: object
    description: "Default headers for API requests"
    constraints: "Optional"
    example: {"Authorization": "Bearer <token>", "Content-Type": "application/json"}
}
```

### 8. UI Configuration

**Purpose**: Configuration parameters for the chatbot UI.

**Schema**:
```javascript
{
  maxHistoryLength: number
    description: "Maximum number of messages to display"
    constraints: "Required, positive"
    example: 50

  showSources: boolean
    description: "Whether to display source citations"
    constraints: "Required"
    example: true

  autoScroll: boolean
    description: "Whether to auto-scroll to new messages"
    constraints: "Required"
    example: true

  inputPlaceholder: string
    description: "Placeholder text for the input field"
    constraints: "Required"
    example: "Ask a question about this documentation..."
}
```

## Data Flow Patterns

### 1. Query Processing Flow
```
User Input → Frontend Validation → API Request → Backend Processing → API Response → Frontend State Update → UI Render
```

### 2. Error Handling Flow
```
Error Occurs → Error Classification → State Update → UI Error Display
```

## Entity Relationships

```
Chat Session
    ↓ (contains)
Chat Messages
    ↓ (sent via)
API Request/Response
    ↓ (includes)
Source Citations
```

## Validation Requirements

### 1. Input Validation
- All user inputs must be sanitized for security
- Numeric values must be within specified ranges
- URLs must be properly formatted
- Query content must be validated for appropriate content

### 2. Output Validation
- API responses must be validated against schema
- Source citations must correspond to actual retrieved content
- No hallucinated information should be present in responses
- Frontend state must be consistent with API responses

## Performance Considerations

### 1. Data Size Limits
- Individual message content: < 2000 characters
- Chat history: < 100 messages per session
- Total response size: < 1MB
- Source citations per response: < 10

### 2. Processing Constraints
- Frontend state updates should be optimized for performance
- Large chat histories should be virtualized
- API requests should have timeout protection
- Validation should be efficient and not impact performance significantly