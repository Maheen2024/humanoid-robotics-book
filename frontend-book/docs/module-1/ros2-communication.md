---
title: ROS 2 Communication Primitives
sidebar_position: 2
description: Understanding Nodes, Topics, Services, and Actions in ROS 2
---

# ROS 2 Communication Primitives

## Introduction to Communication Primitives

ROS 2 provides several communication primitives that enable different types of interaction between nodes. Understanding these primitives is essential for building robust robotic applications. Each primitive serves a specific purpose and is optimized for particular use cases.

## Nodes

Nodes are the fundamental execution units in ROS 2. A node is a process that performs computation and communicates with other nodes through the ROS 2 communication system. Each node typically performs a specific task and can be thought of as a module in a larger robotic system.

### Creating Nodes

Nodes are created by inheriting from the `rclpy.Node` class in Python or the appropriate base class in other languages. A node should have a unique name within the ROS 2 domain and can contain publishers, subscribers, services, clients, and action servers/clients.

### Node Lifecycle

Nodes have a lifecycle that includes initialization, active operation, and cleanup. Proper resource management within nodes is crucial for robust robotic applications.

## Topics and Messages

Topics provide a publish-subscribe communication pattern that is ideal for streaming data between nodes. Publishers send messages to topics, and subscribers receive messages from topics. This pattern is unidirectional and asynchronous.

### Quality of Service (QoS)

Topics support Quality of Service profiles that allow fine-tuning of communication behavior, including reliability, durability, and history policies. This is particularly important for real-time robotic applications.

### Message Types

Messages are strongly-typed data structures that are passed between nodes. ROS 2 provides a rich set of standard message types and allows users to define custom message types.

## Services

Services provide a request-response communication pattern where a client sends a request to a service and receives a response. This pattern is synchronous and bidirectional, making it suitable for operations that require a specific response.

### Service Architecture

Services consist of two parts: the service definition (which specifies the request and response types) and the service implementation (which handles the requests and provides responses).

## Actions

Actions provide goal-oriented communication with feedback and status updates. They are ideal for long-running operations where you need to track progress, cancel operations, or receive intermediate results.

### Action Components

Actions have three components:
1. **Goal**: The request to perform an action
2. **Feedback**: Intermediate status updates during action execution
3. **Result**: The final outcome of the action

## Message Passing and Real-Time Considerations

### Real-Time Performance

When designing ROS 2 applications for real-time performance, consider:
- Message size and frequency
- QoS profile selection
- Network topology and latency
- Node scheduling and priorities

### Deterministic Communication

For safety-critical applications, ensure deterministic communication by:
- Using reliable QoS profiles
- Implementing appropriate timeouts
- Handling communication failures gracefully
- Monitoring communication performance

## Using rclpy to Connect Python AI Agents to Robot Controllers

### Introduction to rclpy

rclpy is the Python client library for ROS 2. It provides the Python API for creating nodes, publishers, subscribers, services, and actions.

### Basic Node Creation

```python
import rclpy
from rclpy.node import Node

class AIAgentNode(Node):
    def __init__(self):
        super().__init__('ai_agent_node')
        # Initialize publishers, subscribers, etc.
```

### Publishers and Subscribers

```python
from std_msgs.msg import String

# Create publisher
publisher = self.create_publisher(String, 'topic_name', 10)

# Create subscriber
subscriber = self.create_subscription(
    String,
    'topic_name',
    self.listener_callback,
    10
)
```

### Service Clients

```python
from example_interfaces.srv import AddTwoInts

client = self.create_client(AddTwoInts, 'add_two_ints')
```

### Connecting AI Agents to Robot Controllers

When connecting AI agents to robot controllers through ROS 2:

1. **Define appropriate interfaces**: Create custom message types that represent the data needed for AI-robot interaction.

2. **Implement proper error handling**: AI agents should handle communication failures and robot state changes gracefully.

3. **Consider timing constraints**: Ensure that AI decision-making and robot control operate within appropriate time windows.

4. **Implement safety mechanisms**: Include safety checks and fallback behaviors to ensure safe operation.

## Hands-On Exercises

### Exercise 1: Node Communication

Create two nodes that communicate through a topic. One node should publish sensor data (e.g., temperature readings), and the other should subscribe to this data and print it to the console.

### Exercise 2: Service Implementation

Implement a simple service that takes two numbers as input and returns their sum. Create both a service server and a client to test the communication.

### Exercise 3: AI-Agent Simulation

Create a simple Python script that simulates an AI agent using rclpy to:
1. Subscribe to sensor data from a robot
2. Process the data to make a simple decision
3. Publish commands to control the robot

## Learning Objectives

After completing this chapter, you should be able to:
- Explain the differences between Nodes, Topics, Services, and Actions
- Understand message passing and real-time considerations in ROS 2
- Use rclpy to connect Python AI agents to robot controllers
- Choose appropriate communication primitives for different use cases