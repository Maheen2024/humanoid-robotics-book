import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    title: 'Learn ROS 2 Fundamentals',
    description: (
      <>
        Understand what ROS 2 is and why it is critical for humanoid robots.
        Learn about ROS 2 architecture and DDS-based communication.
      </>
    ),
  },
  {
    title: 'Master Communication Primitives',
    description: (
      <>
        Learn about Nodes, Topics, Services, and Actions.
        Understand message passing and real-time considerations.
      </>
    ),
  },
  {
    title: 'Robot Modeling with URDF',
    description: (
      <>
        Understand URDF in humanoid robotics, links, joints, and kinematic chains.
        Learn how URDF enables simulation, control, and visualization.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}