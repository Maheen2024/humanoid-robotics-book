import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '473'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'e82'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', '352'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'd2f'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '134'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '514'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', 'c98'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'aa6'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '929'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '3f3'),
            routes: [
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', 'aed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-1/intro-to-ros2',
                component: ComponentCreator('/docs/module-1/intro-to-ros2', '4e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-1/ros2-communication',
                component: ComponentCreator('/docs/module-1/ros2-communication', 'edd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-1/urdf-modeling',
                component: ComponentCreator('/docs/module-1/urdf-modeling', '798'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-2/digital-twins-overview',
                component: ComponentCreator('/docs/module-2/digital-twins-overview', 'cdd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-2/gazebo-physics-sim',
                component: ComponentCreator('/docs/module-2/gazebo-physics-sim', '816'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-2/unity-high-fidelity',
                component: ComponentCreator('/docs/module-2/unity-high-fidelity', 'b0a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-3/navigation-path-planning-nav2',
                component: ComponentCreator('/docs/module-3/navigation-path-planning-nav2', 'a16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-3/nvidia-isaac-overview',
                component: ComponentCreator('/docs/module-3/nvidia-isaac-overview', '405'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-3/perception-vslam-isaac-ros',
                component: ComponentCreator('/docs/module-3/perception-vslam-isaac-ros', 'aad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-4/capstone-autonomous-humanoid',
                component: ComponentCreator('/docs/module-4/capstone-autonomous-humanoid', 'b33'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-4/cognitive-planning-llms-ros2',
                component: ComponentCreator('/docs/module-4/cognitive-planning-llms-ros2', 'f21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-4/vla-foundations',
                component: ComponentCreator('/docs/module-4/vla-foundations', 'a1c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/module-4/voice-to-action-speech-models',
                component: ComponentCreator('/docs/module-4/voice-to-action-speech-models', 'e38'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e4d'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
