import { answers, experiments, runExperiment } from '@homelab/core'
import type { AnswerId, ExperimentId, Prediction } from '@homelab/core'
import type { Dispatch } from 'react'
import type { Action } from '@/game'
import { evaluate } from '@/network'
import { Icon } from '@/components/Icon'

export function PredictionPanel({
  prediction,
  dispatch,
}: {
  prediction: Prediction
  dispatch: Dispatch<Action>
}) {
  const result =
    prediction.phase === 'result'
      ? runExperiment(prediction.before, prediction.experiment, prediction.answer, evaluate)
      : null
  return (
    <section className="prediction" aria-labelledby="prediction-heading">
      <p className="eyebrow">PREDICT / TEST / EXPLAIN</p>
      <h2 id="prediction-heading" tabIndex={-1}>
        What changes when a cable comes out?
      </h2>
      <div className="prediction-controls">
        <div className="experiment-control">
          <label htmlFor="experiment">Experiment</label>
          <select
            id="experiment"
            disabled={result !== null}
            value={prediction.experiment}
            onChange={(event) =>
              dispatch({ type: 'experiment', id: event.target.value as ExperimentId })
            }
          >
            {(Object.keys(experiments) as ExperimentId[]).map((id) => (
              <option key={id} value={id}>
                {experiments[id].label}
              </option>
            ))}
          </select>
        </div>
        <fieldset disabled={result !== null}>
          <legend>Which devices will still reach the internet?</legend>
          <div className="prediction-options">
            {(Object.keys(answers) as AnswerId[]).map((id) => (
              <label key={id}>
                <input
                  type="radio"
                  name="prediction-answer"
                  value={id}
                  checked={prediction.answer === id}
                  onChange={() => dispatch({ type: 'answer', id })}
                />
                {answers[id]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {result && prediction.answer ? (
        <>
          <div className="prediction-result" role="status">
            <h3>
              {result.correct ? 'Your prediction matched.' : 'A different result. Here is why.'}
            </h3>
            <p>
              You predicted: <strong>{answers[prediction.answer]}</strong>. Still online:{' '}
              <strong>{answers[result.actual]}</strong>.
            </p>
            <p>{experiments[prediction.experiment].explanation}</p>
            <p className="prediction-observation">
              Desktop: {result.desktop.online ? 'online' : 'offline'} / Phone:{' '}
              {result.phone.online ? 'online' : 'offline'}
              {result.phone.physical && ' (still joined to Wi-Fi)'}.
            </p>
          </div>
          <button
            type="button"
            className="primary"
            data-action="restore-experiment"
            onClick={() => dispatch({ type: 'restore-experiment' })}
          >
            <Icon name="Undo2" />
            Reconnect &amp; try another
          </button>
        </>
      ) : (
        <button
          type="button"
          className="primary"
          data-action="run-experiment"
          disabled={prediction.answer === null}
          onClick={() => dispatch({ type: 'run-experiment' })}
        >
          <Icon name="Play" />
          Test prediction
        </button>
      )}
    </section>
  )
}
