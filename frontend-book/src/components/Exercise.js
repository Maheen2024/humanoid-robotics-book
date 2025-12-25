import React from 'react';
import clsx from 'clsx';
import styles from './Exercise.module.css';

const Exercise = ({title, children, type = 'knowledge-check'}) => {
  const exerciseClass = clsx(
    'exercise-box',
    styles.exercise,
    {
      [styles.knowledgeCheck]: type === 'knowledge-check',
      [styles.handsOn]: type === 'hands-on',
      [styles.reflection]: type === 'reflection',
    }
  );

  return (
    <div className={exerciseClass}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Exercise;