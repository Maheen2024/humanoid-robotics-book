---
title: Robot Modeling with URDF
sidebar_position: 3
description: Understanding URDF in humanoid robotics for links, joints, and kinematic chains
---

# Robot Modeling with URDF

## Introduction to URDF

URDF (Unified Robot Description Format) is an XML-based format used to describe robot models in ROS. It defines the physical and visual properties of a robot, including its links, joints, and kinematic chains. URDF is essential for robot simulation, visualization, and control in ROS-based systems.

## Purpose of URDF in Humanoid Robotics

### Kinematic Description
URDF provides a complete kinematic description of humanoid robots, defining how different body parts are connected and how they can move relative to each other.

### Simulation Integration
URDF models are used by physics engines like Gazebo to simulate robot behavior in virtual environments before real-world deployment.

### Visualization
URDF enables 3D visualization of robots in tools like RViz, making it easier to understand robot structure and debug applications.

### Control Framework Integration
URDF integrates with ROS control frameworks, enabling proper joint control and inverse kinematics calculations.

## Links

Links represent rigid bodies in a robot. Each link has:
- **Visual properties**: How the link appears in visualization (geometry, material, color)
- **Collision properties**: How the link interacts in simulation (collision geometry)
- **Inertial properties**: Mass, center of mass, and inertia tensor for physics simulation

### Link Structure
```xml
<link name="link_name">
  <visual>
    <geometry>
      <cylinder length="0.1" radius="0.05"/>
    </geometry>
    <material name="blue">
      <color rgba="0 0 0.8 1"/>
    </material>
  </visual>
  <collision>
    <geometry>
      <cylinder length="0.1" radius="0.05"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="1.0"/>
    <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
  </inertial>
</link>
```

## Joints

Joints define the connection between two links and specify the allowed motion. The main joint types are:
- **Revolute**: Rotational joint with limited range
- **Continuous**: Rotational joint without limits
- **Prismatic**: Linear sliding joint with limits
- **Fixed**: No motion allowed
- **Floating**: 6 DOF motion (for base of floating robots)
- **Planar**: Motion on a plane

### Joint Structure
```xml
<joint name="joint_name" type="revolute">
  <parent link="parent_link"/>
  <child link="child_link"/>
  <origin xyz="0 0 0.1" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="10.0" velocity="1.0"/>
</joint>
```

## Kinematic Chains

Kinematic chains define the relationship between different parts of a robot. In humanoid robots, common kinematic chains include:
- **Arm chains**: From shoulder to hand
- **Leg chains**: From hip to foot
- **Neck chain**: From torso to head

### Forward Kinematics
URDF enables forward kinematics calculations to determine the position and orientation of end-effectors based on joint angles.

### Inverse Kinematics
URDF provides the structure needed for inverse kinematics solvers to calculate required joint angles to achieve desired end-effector positions.

## How URDF Enables Simulation, Control, and Visualization

### Simulation
- Physics engines use URDF to simulate robot dynamics
- Collision detection is based on URDF collision geometries
- Joint limits and constraints are enforced during simulation

### Control
- Robot state publishers use URDF to publish joint states
- Controllers reference URDF for joint names and properties
- Trajectory execution considers URDF-defined limits

### Visualization
- RViz uses URDF to display robot models in 3D
- TF trees are built based on URDF joint relationships
- Robot models update in real-time based on joint states

## URDF Best Practices for Humanoid Robots

### Modular Design
Structure URDF files to allow for easy modification of individual components, especially important for humanoid robots with many degrees of freedom.

### Proper Scaling
Ensure all dimensions are accurate and consistent, which is critical for physics simulation and control.

### Joint Limits
Set appropriate joint limits based on physical constraints of the real robot.

### Mass Properties
Provide realistic mass and inertia properties for accurate simulation.

## Simulation Exercises

### Exercise 1: Simple Robot Model
Create a simple robot model with a base link, one joint, and one additional link. Load the model in RViz to verify it displays correctly.

### Exercise 2: Kinematic Chain
Create a simple 2-DOF arm with proper joint definitions and visualize its movement in RViz.

### Exercise 3: Humanoid Leg Segment
Create a simplified model of a humanoid leg segment (hip, knee, ankle) and verify the kinematic chain works correctly.

## Learning Objectives

After completing this chapter, you should be able to:
- Explain the purpose of URDF in humanoid robotics
- Identify and describe links, joints, and kinematic chains
- Understand how URDF enables simulation, control, and visualization
- Create basic URDF files for simple robot models
- Apply URDF best practices for humanoid robots