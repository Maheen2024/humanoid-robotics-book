# API Contract: ROS 2 Educational Module

**Feature**: 001-ros2-physical-ai
**Date**: 2025-12-18

## Overview

This document defines the API contract for potential backend services that may support the ROS 2 educational module. The primary content is static documentation, but this API contract covers potential interactive features.

## Base URL

`https://api.example.com/v1`

## Authentication

All endpoints require authentication using Bearer tokens, except for public content access.

## Endpoints

### Content Management

#### GET /modules/{moduleId}
Retrieve module information and available chapters

**Request**:
- Path parameter: `moduleId` (string) - The unique identifier for the module
- Headers: `Authorization: Bearer {token}` (optional for public content)

**Response** (200 OK):
```json
{
  "id": "module-1",
  "title": "The Robotic Nervous System (ROS 2)",
  "description": "Introduction to ROS 2 as the nervous system of humanoid robots",
  "targetAudience": "AI students and developers transitioning into Physical AI and Humanoid Robotics",
  "learningObjectives": [
    "Understand what ROS 2 is and why it is critical for humanoid robots",
    "Learn about ROS 2 architecture and DDS-based communication",
    "Understand the role of ROS 2 in real-world vs simulated robots"
  ],
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Introduction to ROS 2 for Physical AI",
      "position": 1,
      "description": "What ROS 2 is and why it is critical for humanoid robots"
    },
    {
      "id": "chapter-2",
      "title": "ROS 2 Communication Primitives",
      "position": 2,
      "description": "Nodes, Topics, Services, and Actions"
    },
    {
      "id": "chapter-3",
      "title": "Robot Modeling with URDF",
      "position": 3,
      "description": "Purpose of URDF in humanoid robotics"
    }
  ],
  "duration": "8-10 hours",
  "status": "published"
}
```

#### GET /modules/{moduleId}/chapters/{chapterId}
Retrieve specific chapter content

**Request**:
- Path parameters: `moduleId`, `chapterId`
- Headers: `Authorization: Bearer {token}` (optional for public content)

**Response** (200 OK):
```json
{
  "id": "chapter-1",
  "moduleId": "module-1",
  "title": "Introduction to ROS 2 for Physical AI",
  "position": 1,
  "content": "# Introduction to ROS 2 for Physical AI\n\n## What is ROS 2?\n\nROS 2 (Robot Operating System 2) is a flexible framework for writing robot applications...",
  "learningOutcomes": [
    "Explain why ROS 2 is critical for humanoid robots",
    "Describe the basic architecture and DDS-based communication"
  ],
  "exercises": [
    {
      "id": "exercise-1",
      "title": "Knowledge Check: ROS 2 Basics",
      "type": "knowledge-check",
      "content": "What does DDS stand for in the context of ROS 2?",
      "options": ["Data Distribution Service", "Distributed Development System", "Dynamic Data Sharing", "Direct Device Support"],
      "correctAnswer": "Data Distribution Service"
    }
  ],
  "status": "published"
}
```

### User Progress Tracking

#### GET /users/{userId}/progress
Retrieve user's progress through the module

**Request**:
- Path parameter: `userId`
- Headers: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "userId": "user-123",
  "moduleId": "module-1",
  "progress": {
    "overallPercentage": 45,
    "completedChapters": ["chapter-1"],
    "currentChapter": "chapter-2",
    "completedExercises": ["exercise-1"],
    "lastAccessed": "2025-12-18T10:30:00Z"
  }
}
```

#### POST /users/{userId}/progress
Update user's progress

**Request**:
- Path parameter: `userId`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "moduleId": "module-1",
  "chapterId": "chapter-1",
  "completed": true,
  "exerciseIds": ["exercise-1"],
  "progressPercentage": 33
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "progress": {
    "overallPercentage": 33,
    "completedChapters": ["chapter-1"],
    "completedExercises": ["exercise-1"]
  }
}
```

### Search

#### GET /search
Search across all modules and chapters

**Request**:
- Query parameters: `q` (search query), `limit` (default 10)
- Headers: `Authorization: Bearer {token}` (optional)

**Response** (200 OK):
```json
{
  "query": "DDS communication",
  "results": [
    {
      "id": "chapter-1",
      "moduleId": "module-1",
      "title": "Introduction to ROS 2 for Physical AI",
      "preview": "ROS 2 uses DDS (Data Distribution Service) for communication...",
      "url": "/module-1/intro-to-ros2",
      "relevance": 0.95
    }
  ],
  "totalResults": 1
}
```

## Error Responses

All error responses follow this structure:

**400 Bad Request**:
```json
{
  "error": "bad_request",
  "message": "Invalid input parameters",
  "details": "moduleId is required and must be a valid string"
}
```

**401 Unauthorized**:
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

**404 Not Found**:
```json
{
  "error": "not_found",
  "message": "Requested resource not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

All endpoints are subject to rate limiting:
- 100 requests per minute per IP for unauthenticated requests
- 1000 requests per minute per user for authenticated requests

Rate limit headers:
- `X-RateLimit-Limit`: The maximum number of requests allowed
- `X-RateLimit-Remaining`: The number of requests remaining
- `X-RateLimit-Reset`: The time at which the rate limit resets (Unix timestamp)