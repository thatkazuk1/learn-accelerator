import { useState } from 'react'
import { playerKey, restorePlayer } from '@homelab/core'
import { Icon } from '@/components/Icon'

function storedName(): string {
  try {
    const saved = localStorage.getItem(playerKey)
    if (!saved) return ''
    return restorePlayer(JSON.parse(saved)).name
  } catch {
    return ''
  }
}

function saveName(name: string) {
  try {
    localStorage.setItem(playerKey, JSON.stringify({ name }))
  } catch {
    /* storage blocked */
  }
}

export function Welcome({ name, onStart }: { name: string; onStart: (name: string) => void }) {
  const [open, setOpen] = useState(() => !name && !storedName())
  const [draft, setDraft] = useState('')
  const trimmed = draft.trim()
  const valid = trimmed.length >= 2
  if (!open) return null
  return (
    <div className="welcome-overlay" role="dialog" aria-labelledby="welcome-title">
      <form
        className="welcome"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          saveName(trimmed)
          onStart(trimmed)
          setOpen(false)
        }}
      >
        <div className="welcome-brand">
          <Icon name="Network" />
          <span>
            homelab<span className="brand-dot">.</span>
          </span>
        </div>
        <p className="eyebrow">PLAYER PROFILE</p>
        <h1 id="welcome-title">Welcome to your homelab.</h1>
        <label className="welcome-field">
          <span>Your name</span>
          <input
            autoFocus
            required
            minLength={2}
            maxLength={80}
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
          />
        </label>
        <button type="submit" className="primary welcome-start" disabled={!valid}>
          <Icon name="ArrowRight" />
          Start
        </button>
      </form>
    </div>
  )
}
