import { devices, equipmentIds } from '@homelab/core'
import type { Connectivity } from '@homelab/core'
import type { Dispatch } from 'react'
import type { Action, Game } from '@/game'
import { deviceIcons, Icon } from '@/components/Icon'

const hints = [
  'The router joins two networks: ISP handoff to WAN, local devices to LAN.',
  'Connect router LAN to any switch port. Connect the desktop and access point to two other switch ports.',
  'Join Lab-WiFi on the phone, then run a connectivity check.',
] as const
const interfaces = { router: '1 WAN / 1 LAN', switch: '5 Ethernet ports', ap: 'Ethernet + Wi-Fi' }
export function Equipment({
  game,
  dispatch,
  desktop,
  phone,
}: {
  game: Game
  dispatch: Dispatch<Action>
  desktop: Connectivity
  phone: Connectivity
}) {
  const state = game.levels[game.journey.level]
  const goals = [
    { done: state.slots.every((id) => id !== null), label: 'Equip your rack' },
    { done: desktop.online, label: 'Bring desktop online' },
    { done: phone.online, label: 'Bring phone online' },
  ]
  return (
    <aside className="inventory">
      <div className="section-title">
        <h2>Equipment</h2>
        <span>03</span>
      </div>
      <p className="section-caption">YOUR STARTER KIT</p>
      {equipmentIds.map((id, index) => (
        <button
          type="button"
          key={id}
          className={`equipment ${game.equipment === id ? 'active' : ''}`}
          data-equipment={id}
          aria-label={`${devices[id].name}, ${
            state.slots.includes(id)
              ? 'installed'
              : game.equipment === id
                ? 'selected for placement'
                : 'not installed'
          }`}
          aria-pressed={game.equipment === id}
          onClick={() => dispatch({ type: 'equipment', id })}
        >
          <span className="equipment-icon">
            <Icon name={deviceIcons[id]} />
          </span>
          <span>
            <strong>{devices[id].name}</strong>
            <small>{interfaces[id]}</small>
          </span>
          <span className="kit-state">
            {state.slots.includes(id) ? <Icon name="Check" /> : `0${index + 1}`}
          </span>
        </button>
      ))}
      <div className="objective">
        <p className="eyebrow">MISSION CHECKLIST</p>
        <ul>
          {goals.map((goal) => (
            <li key={goal.label} className={goal.done ? 'done' : ''}>
              <Icon name={goal.done ? 'CircleCheck' : 'Circle'} />
              {goal.label}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="hint-button"
        data-action="hint"
        onClick={() => dispatch({ type: 'hint' })}
      >
        <Icon name="Lightbulb" />
        Need a hint?
      </button>
      {game.hint && <p className="hint-text">{hints[Math.max(0, state.hints - 1)]}</p>}
    </aside>
  )
}
