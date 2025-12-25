import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Quiz.module.css';

function Quiz(props) {
  const { question, options, answer, explanation } = props;
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (option) => {
    setSelectedOption(option);
    setSubmitted(true);
    setIsCorrect(option === answer);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <div className={clsx('card', styles.quizContainer)}>
      <div className="card__header">
        <h3>Knowledge Check</h3>
      </div>
      <div className="card__body">
        <p className={styles.question}>{question}</p>

        <div className={styles.options}>
          {options.map((option, index) => (
            <div key={index} className={styles.option}>
              <input
                type="radio"
                id={`option-${index}`}
                name="quiz-option"
                value={option}
                checked={selectedOption === option}
                disabled={submitted}
                onChange={() => !submitted && setSelectedOption(option)}
                className={styles.optionInput}
              />
              <label htmlFor={`option-${index}`} className={styles.optionLabel}>
                {option}
              </label>
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            className={clsx('button button--primary', styles.submitButton)}
            onClick={() => selectedOption && handleSubmit(selectedOption)}
            disabled={!selectedOption}
          >
            Check Answer
          </button>
        ) : (
          <div className={styles.result}>
            <div className={clsx('alert', isCorrect ? 'alert--success' : 'alert--danger')}>
              <p>
                <strong>
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                </strong>
              </p>
              <p>{explanation}</p>
            </div>
            <button
              className={clsx('button button--secondary', styles.resetButton)}
              onClick={handleReset}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;