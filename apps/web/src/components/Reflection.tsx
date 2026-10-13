import { useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { equipmentIds, reflectionReady } from '@homelab/core'
import type { EquipmentId, Journey } from '@homelab/core'
import type { Action } from '@/game'
import { Icon } from '@/components/Icon'

const prompts: Record<EquipmentId, string> = {
  router: 'What does the router connect, and why does this lab need it?',
  switch: 'What does the switch make possible with this router?',
  ap: 'How does the access point help the phone reach the internet?',
}
export function Reflection({
  journey,
  hints,
  storageOK,
  dispatch,
}: {
  journey: Journey
  hints: number
  storageOK: boolean
  dispatch: Dispatch<Action>
}) {
  const [incomplete, setIncomplete] = useState(false)
  const container = useRef<HTMLElement>(null)
  let status = 'Write at least a short sentence for each device. Saved only in this browser.'
  if (journey.reflectionSaved)
    status = 'Challenge complete. Your explanations are saved for review, not automatically graded.'
  if (!storageOK)
    status = 'Explanations are available for this session only. Browser storage is unavailable.'
  if (incomplete) status = 'Add a short sentence (at least 10 characters) for each device.'
  function save() {
    if (!reflectionReady(journey.reflections)) {
      setIncomplete(true)
      const id = equipmentIds.find((device) => journey.reflections[device].trim().length < 10)
      container.current?.querySelector<HTMLTextAreaElement>(`#reflection-${id}`)?.focus()
      return
    }
    setIncomplete(false)
    dispatch({ type: 'save-reflection' })
  }
  return (
    <section className="reflection" ref={container} aria-labelledby="reflection-heading">
      <p className="eyebrow">ON YOUR OWN / EXPLAIN YOUR NETWORK</p>
      <h2 id="reflection-heading" tabIndex={-1}>
        A working network. Your explanation.
      </h2>
      <p className="reflection-intro">
        Both devices reached the learning server. Describe the role of each device in your own
        words.
      </p>
      <div className="reflection-fields">
        {equipmentIds.map((id) => (
          <label key={id} htmlFor={`reflection-${id}`}>
            {prompts[id]}
            <textarea
              id={`reflection-${id}`}
              data-reflection={id}
              rows={4}
              maxLength={1000}
              minLength={10}
              required
              value={journey.reflections[id]}
              onChange={(event) => {
                setIncomplete(false)
                dispatch({ type: 'reflection', id, text: event.target.value })
              }}
            />
          </label>
        ))}
      </div>
      <div className="reflection-actions">
        <button type="button" className="primary" data-action="save-reflection" onClick={save}>
          <Icon name="Check" />
          Save explanations
        </button>
        <span>{hints} of 3 hints opened</span>
      </div>
      <p className="reflection-status" role="status">
        {status}
      </p>
    </section>
  )
}
