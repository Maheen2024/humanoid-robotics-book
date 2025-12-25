# Data Model: ROS 2 for Physical AI Educational Module

**Feature**: 001-ros2-physical-ai
**Date**: 2025-12-18

## Educational Content Entities

### Module
- **Name**: String (required) - The module name (e.g., "Module 1: The Robotic Nervous System")
- **Description**: String (required) - Brief description of the module's purpose
- **TargetAudience**: String (required) - Description of the intended audience
- **LearningObjectives**: Array of strings - High-level objectives students should achieve
- **Prerequisites**: Array of strings - Knowledge required before starting the module
- **Duration**: String - Estimated time to complete the module

### Chapter
- **Title**: String (required) - The chapter title
- **ModuleId**: String (required) - Reference to the parent module
- **Position**: Integer (required) - Order in the module sequence (1, 2, 3, etc.)
- **Description**: String (required) - Brief description of the chapter content
- **LearningOutcomes**: Array of strings - Specific outcomes students should achieve
- **Topics**: Array of strings - Main topics covered in the chapter
- **Exercises**: Array of exercise objects - Practice exercises for the chapter

### Exercise
- **Title**: String (required) - Title of the exercise
- **Type**: String (required) - Type of exercise (e.g., "knowledge-check", "hands-on", "reflection")
- **Content**: String (required) - The exercise content or question
- **ChapterId**: String (required) - Reference to the parent chapter
- **Difficulty**: String (optional) - Difficulty level (e.g., "beginner", "intermediate", "advanced")
- **ExpectedOutcome**: String (optional) - What the exercise should help students learn

### ContentSection
- **Title**: String (required) - Title of the content section
- **ChapterId**: String (required) - Reference to the parent chapter
- **Position**: Integer (required) - Order within the chapter
- **Content**: String (required) - The actual content text
- **Type**: String (required) - Content type (e.g., "text", "code-example", "diagram-description", "exercise")
- **LearningObjective**: String (optional) - Specific learning objective for this section

## Validation Rules

### Module Validation
- Name must be 5-100 characters
- Description must be 10-500 characters
- TargetAudience must be specified
- LearningObjectives must contain at least 1 item
- Duration must follow format "X hours" or "X-X hours"

### Chapter Validation
- Title must be 5-100 characters
- Position must be a positive integer
- Description must be 10-300 characters
- LearningOutcomes must contain at least 1 item
- Topics must contain at least 1 item
- Must belong to a valid Module

### Exercise Validation
- Title must be 5-100 characters
- Type must be one of: "knowledge-check", "hands-on", "reflection"
- Content must be 10-1000 characters
- Difficulty must be one of: "beginner", "intermediate", "advanced" if specified

### ContentSection Validation
- Title must be 5-100 characters
- Position must be a positive integer
- Content must be 10-5000 characters
- Type must be one of: "text", "code-example", "diagram-description", "exercise"

## Relationships

- Module (1) → Chapter (Many): A module contains multiple chapters
- Chapter (1) → Exercise (Many): A chapter contains multiple exercises
- Chapter (1) → ContentSection (Many): A chapter contains multiple content sections
- ContentSection (Many) → Exercise (0 or 1): A content section may reference an exercise

## State Transitions

### Chapter States
- `draft`: Content is being created
- `review`: Content is under review
- `approved`: Content has been approved for publication
- `published`: Content is live and accessible to students
- `archived`: Content is no longer actively used

## Example Data Structure

```markdown
Module: {
  name: "Module 1: The Robotic Nervous System",
  description: "Introduction to ROS 2 as the nervous system of humanoid robots",
  targetAudience: "AI students and developers transitioning into Physical AI and Humanoid Robotics",
  learningObjectives: [
    "Understand what ROS 2 is and why it is critical for humanoid robots",
    "Learn about ROS 2 architecture and DDS-based communication",
    "Understand the role of ROS 2 in real-world vs simulated robots"
  ],
  prerequisites: ["Basic programming knowledge", "Familiarity with robotics concepts"],
  duration: "8-10 hours"
}

Chapter: {
  title: "Introduction to ROS 2 for Physical AI",
  moduleId: "module-1",
  position: 1,
  description: "What ROS 2 is and why it is critical for humanoid robots",
  learningOutcomes: [
    "Explain why ROS 2 is critical for humanoid robots",
    "Describe the basic architecture and DDS-based communication"
  ],
  topics: [
    "What ROS 2 is",
    "Why ROS 2 is critical for humanoid robots",
    "ROS 2 architecture",
    "DDS-based communication",
    "Role in real-world vs simulated robots"
  ]
}
```