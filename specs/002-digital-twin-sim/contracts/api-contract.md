# API Contract: Digital Twin Simulation Educational Module

**Feature**: 002-digital-twin-sim
**Date**: 2025-12-18

## Overview

This document defines the API contract for potential backend services that may support the Digital Twin Simulation educational module. The primary content is static documentation, but this API contract covers potential interactive features.

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
  "id": "module-2",
  "title": "The Digital Twin (Gazebo & Unity)",
  "description": "Teach digital twin concepts by simulating humanoid robots and environments using Gazebo and Unity",
  "targetAudience": "AI students and developers learning physics-based robot simulation",
  "learningObjectives": [
    "Understand what a digital twin is and why it matters",
    "Learn about simulation vs real-world deployment",
    "Understand the role of digital twins in humanoid robotics"
  ],
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Digital Twins for Physical AI",
      "position": 1,
      "description": "What a digital twin is and why it matters, simulation vs real-world deployment, role in humanoid robotics"
    },
    {
      "id": "chapter-2",
      "title": "Physics Simulation with Gazebo",
      "position": 2,
      "description": "Simulating gravity, collisions, and dynamics, environment and robot interaction, sensor simulation fundamentals"
    },
    {
      "id": "chapter-3",
      "title": "High-Fidelity Interaction with Unity",
      "position": 3,
      "description": "Photorealistic rendering concepts, human–robot interaction simulation, when and why Unity is used alongside Gazebo"
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
  "moduleId": "module-2",
  "title": "Digital Twins for Physical AI",
  "position": 1,
  "content": "# Digital Twins for Physical AI\n\n## What is a Digital Twin?\n\nA digital twin is a virtual representation of a physical system that uses real-time data to enable analysis, monitoring, and optimization...",
  "learningOutcomes": [
    "Explain what a digital twin is and why it matters",
    "Distinguish between simulation and real-world deployment considerations"
  ],
  "exercises": [
    {
      "id": "exercise-1",
      "title": "Knowledge Check: Digital Twin Concepts",
      "type": "knowledge-check",
      "content": "What is the primary purpose of a digital twin in robotics?",
      "options": ["Virtual representation for analysis", "Hardware component", "Communication protocol", "Data storage system"],
      "correctAnswer": "Virtual representation for analysis"
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
  "moduleId": "module-2",
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
  "moduleId": "module-2",
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

### Simulation Comparison Tool

#### GET /simulation/comparison
Compare Gazebo and Unity for specific use cases

**Request**:
- Query parameters: `useCase` (e.g., "physics", "rendering", "interaction")
- Headers: `Authorization: Bearer {token}` (optional)

**Response** (200 OK):
```json
{
  "useCase": "physics",
  "gazebo": {
    "strengths": ["Accurate physics simulation", "Collision detection", "Dynamics modeling"],
    "bestFor": "Realistic physics and dynamics simulation"
  },
  "unity": {
    "strengths": ["Visual quality", "Rendering capabilities", "User interaction"],
    "bestFor": "Photorealistic rendering and human-robot interaction"
  },
  "recommendation": "Use Gazebo for physics simulation, Unity for rendering"
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