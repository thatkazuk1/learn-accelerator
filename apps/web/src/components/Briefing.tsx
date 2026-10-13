import { useState } from 'react'
import { Icon } from '@/components/Icon'

const storageKey = 'homelab.briefing.v1'

function dismissed(): boolean {
  try {
    return localStorage.getItem(storageKey) === 'done'
  } catch {
    return false
  }
}

function dismiss() {
  try {
    localStorage.setItem(storageKey, 'done')
  } catch {
    /* storage blocked */
  }
}

export function Briefing({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(!dismissed())
  if (!open) return null
  return (
    <div className="briefing-overlay" role="dialog" aria-labelledby="briefing-title">
      <div className="briefing">
        <p className="eyebrow">MISSION BRIEFING</p>
        <h1 id="briefing-title">Welcome to your homelab.</h1>
        <p className="briefing-lead">
          You have three devices: a router, a switch, and an access point. Your mission is to
          connect them so that a desktop and a phone can reach the internet.
        </p>
        <div className="briefing-steps">
          <div className="briefing-step">
            <span className="briefing-number">01</span>
            <div>
              <strong>Stock the rack</strong>
              <p>Place each device into an open slot.</p>
            </div>
          </div>
          <div className="briefing-step">
            <span className="briefing-number">02</span>
            <div>
              <strong>Cable the network</strong>
              <p>Connect ports between devices. The ISP handoff is already waiting.</p>
            </div>
          </div>
          <div className="briefing-step">
            <span className="briefing-number">03</span>
            <div>
              <strong>Run the check</strong>
              <p>Test connectivity. Both clients must reach the internet.</p>
            </div>
          </div>
        </div>
        <p className="briefing-note">
          No timer. No penalties. Hints are available when you need them.
        </p>
        <button
          type="button"
          className="primary briefing-start"
          autoFocus
          onClick={() => {
            dismiss()
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
