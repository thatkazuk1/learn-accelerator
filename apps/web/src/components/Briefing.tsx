import { useRef, useState } from 'react'
import type { Mission } from '@homelab/core'
import { Icon } from '@/components/Icon'

function storageKey(missionId: string): string {
  if (missionId === 'guided') return 'homelab.briefing.v1'
  return `homelab.briefing.${missionId}.v1`
}

function dismissed(missionId: string): boolean {
  try {
    return localStorage.getItem(storageKey(missionId)) === 'done'
  } catch {
    return false
  }
}

function dismiss(missionId: string) {
  try {
    localStorage.setItem(storageKey(missionId), 'done')
  } catch {
    /* storage blocked */
  }
}

export function Briefing({ mission, onStart }: { mission: Mission; onStart: () => void }) {
  const seen = useRef(new Set<string>())
  const [open, setOpen] = useState(() => {
    if (dismissed(mission.id)) {
      seen.current.add(mission.id)
      return false
    }
    return true
  })
  const [lastId, setLastId] = useState(mission.id)
  if (mission.id !== lastId) {
    setLastId(mission.id)
    if (seen.current.has(mission.id) || dismissed(mission.id)) {
      seen.current.add(mission.id)
      if (open) setOpen(false)
    } else {
      if (!open) setOpen(true)
    }
  }
  if (!open) return null
  return (
    <div className="briefing-overlay" role="dialog" aria-labelledby="briefing-title">
      <div className="briefing">
        <p className="eyebrow">MISSION BRIEFING</p>
        <h1 id="briefing-title">{mission.title}</h1>
        <p className="briefing-lead">{mission.description}</p>
        <div className="briefing-steps">
          {mission.steps.map((step, index) => (
            <div className="briefing-step" key={index}>
              <span className="briefing-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="briefing-note">
          No timer. No penalties. Hints are available when you need them.
        </p>
        <button
          type="button"
          className="primary briefing-start"
          autoFocus
          onClick={() => {
            seen.current.add(mission.id)
            dismiss(mission.id)
            setOpen(false)
            onStart()
          }}
        >
          <Icon name="Play" />
          Begin mission
        </button>
      </div>
    </div>
  )
}
