import { devices, equipmentIds } from '@homelab/core'
import type { Mission } from '@homelab/core'
import type { Dispatch } from 'react'
import type { Action, Game } from '@/game'
import { evaluate } from '@/network'
import { deviceIcons, Icon } from '@/components/Icon'

const interfaces = { router: '1 WAN / 1 LAN', switch: '5 Ethernet ports', ap: 'Ethernet + Wi-Fi' }

const distractorInfo: Record<string, { name: string; iface: string }> = {
  hub: { name: 'Hub', iface: '4 Ethernet ports' },
  repeater: { name: 'Repeater', iface: '2 Ethernet ports' },
}

export function Equipment({
  game,
  dispatch,
  mission,
}: {
  game: Game
  dispatch: Dispatch<Action>
  mission: Mission
}) {
  const state = game.states[game.journey.activeMission]
  const goals = mission.goals(state, evaluate)
  const sel = mission.features?.deviceSelection
  const selectionDone = !sel || game.deviceChoices.length >= sel.correct.length

  return (
    <aside className="inventory">
      <div className="section-title">
        <h2>Equipment</h2>
        <span>{String(equipmentIds.length).padStart(2, '0')}</span>
      </div>

      {sel && !selectionDone && (
        <div className="device-selection">
          <p className="eyebrow">CHOOSE YOUR DEVICES</p>
          <p className="section-caption">Pick {sel.correct.length} devices for your rack.</p>
          <div className="device-options">
            {sel.options.map((option) => {
              const chosen = game.deviceChoices.includes(option)
              const isEquip = option in interfaces
              const name = isEquip
                ? devices[option as keyof typeof devices].name
                : (distractorInfo[option]?.name ?? option)
              const iface = isEquip
                ? interfaces[option as keyof typeof interfaces]
                : (distractorInfo[option]?.iface ?? '')
              return (
                <button
                  key={option}
                  type="button"
                  className={`equipment ${chosen ? 'chosen' : ''}`}
                  disabled={chosen}
                  onClick={() => dispatch({ type: 'selectDevice', option })}
                >
                  <span className="equipment-icon">
                    <Icon
                      name={isEquip ? deviceIcons[option as keyof typeof deviceIcons] : 'Box'}
                    />
                  </span>
                  <span>
                    <strong>{name}</strong>
                    <small>{iface}</small>
                  </span>
                  {chosen && (
                    <span className="kit-state">
                      <Icon name="Check" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {game.deviceFeedback && (
            <p className="device-feedback" role="alert">
              <Icon name="CircleAlert" /> {game.deviceFeedback}
            </p>
          )}
        </div>
      )}

      {(!sel || selectionDone) && !mission.features?.slotsLocked && (
        <>
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
        </>
      )}

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
      {game.hint && <p className="hint-text">{mission.hints[Math.max(0, state.hints - 1)]}</p>}
    </aside>
  )
}
