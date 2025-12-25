// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System',
      items: [
        'module-1/intro-to-ros2',
        'module-1/ros2-communication',
        'module-1/urdf-modeling',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin',
      items: [
        'module-2/digital-twins-overview',
        'module-2/gazebo-physics-sim',
        'module-2/unity-high-fidelity',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: The AI-Robot Brain (NVIDIA Isaac)',
      items: [
        'module-3/nvidia-isaac-overview',
        'module-3/perception-vslam-isaac-ros',
        'module-3/navigation-path-planning-nav2',
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: [
        'module-4/vla-foundations',
        'module-4/voice-to-action-speech-models',
        'module-4/cognitive-planning-llms-ros2',
        'module-4/capstone-autonomous-humanoid',
      ],
    },
  ],
};

module.exports = sidebars;