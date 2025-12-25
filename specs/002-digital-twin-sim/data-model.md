# Data Model: Digital Twin Simulation Educational Module

**Feature**: 002-digital-twin-sim
**Date**: 2025-12-18

## Educational Content Entities

### Module
- **Name**: String (required) - The module name (e.g., "Module 2: The Digital Twin")
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
  name: "Module 2: The Digital Twin",
  description: "Teach digital twin concepts by simulating humanoid robots and environments using Gazebo and Unity",
  targetAudience: "AI students and developers learning physics-based robot simulation",
  learningObjectives: [
    "Understand what a digital twin is and why it matters",
    "Learn about simulation vs real-world deployment",
    "Understand the role of digital twins in humanoid robotics"
  ],
  prerequisites: ["Basic understanding of robotics concepts", "Familiarity with simulation concepts"],
  duration: "8-10 hours"
}

Chapter: {
  title: "Digital Twins for Physical AI",
  moduleId: "module-2",
  position: 1,
  description: "What a digital twin is and why it matters, simulation vs real-world deployment, role in humanoid robotics",
  learningOutcomes: [
    "Explain what a digital twin is and why it matters",
    "Distinguish between simulation and real-world deployment considerations"
  ],
  topics: [
    "What is a digital twin",
    "Why digital twins matter",
    "Simulation vs real-world deployment",
    "Role in humanoid robotics"
  ]
}
```

## Digital Twin Specific Entities

### SimulationEnvironment
- **Name**: String (required) - Name of the simulation environment (Gazebo, Unity)
- **Type**: String (required) - Type of simulation (physics, rendering, interaction)
- **Features**: Array of strings - Key features of the environment
- **UseCase**: String (required) - Primary use case for this environment
- **IntegrationPoints**: Array of strings - How this environment integrates with others

### PhysicsConcept
- **Name**: String (required) - Name of the physics concept (gravity, collision, dynamics)
- **Description**: String (required) - Explanation of the physics concept
- **Application**: String (required) - How the concept applies in robotics simulation
- **SimulationMethod**: String (required) - How the concept is simulated in Gazebo
- **Parameters**: Array of parameter objects - Key parameters for the concept

### RenderingConcept
- **Name**: String (required) - Name of the rendering concept (photorealistic, lighting, materials)
- **Description**: String (required) - Explanation of the rendering concept
- **Application**: String (required) - How the concept applies in robotics simulation
- **Implementation**: String (required) - How the concept is implemented in Unity
- **PerformanceConsiderations**: Array of strings - Performance factors to consider