import { devices, portLabel, present } from '@homelab/core'
import type { Connectivity } from '@homelab/core'
import type { Dispatch } from 'react'
import type { Action, Game } from '@/game'
import { deviceIcons, Icon, IconButton } from '@/components/Icon'

export function Inspector({
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
  const id = game.selected
  const device = devices[id]
  let client: Connectivity | null = null
  if (id === 'desktop') client = desktop
  if (id === 'phone') client = phone
  const removable = id === 'router' || id === 'switch' || id === 'ap'
  return (
    <aside className="inspector">
      <div className="section-title">
        <h2>Device inspector</h2>
        <Icon name="Scan" />
      </div>
      <div className="inspect-symbol">
        <Icon name={deviceIcons[id]} />
      </div>
      <p className="eyebrow">{client ? 'CLIENT DEVICE' : 'NETWORK EQUIPMENT'}</p>
      <h3>{device.name}</h3>
      <p className="role-copy">{device.role}</p>
      <dl>
        <div>
          <dt>Power</dt>
          <dd>{present(state, id) ? 'On' : 'Not placed'}</dd>
        </div>
        <div>
          <dt>Interfaces</dt>
          <dd>
            {device.ports.length} Ethernet{(id === 'ap' || id === 'phone') && ' / Wi-Fi'}
          </dd>
        </div>
        {client && (
          <div>
            <dt>Local configuration</dt>
            <dd>{client.lan ? 'Assigned' : 'Unavailable'}</dd>
          </div>
        )}
      </dl>
      {removable && state.slots.includes(id) && (
        <button
          type="button"
          className="remove-device"
          data-action="remove"
          aria-label={`Remove ${device.name} from rack`}
          onClick={() => dispatch({ type: 'remove', id })}
        >
          <Icon name="MinusCircle" />
          Remove from rack
        </button>
      )}
      <div className="connections">
        <div className="section-title">
          <h2>Connections</h2>
          <span>{state.cables.length}</span>
        </div>
        {state.cables.length === 0 && <p className="muted">No cables connected.</p>}
        {state.cables.map(([a, b], index) => (
          <div className="connection-row" key={`${a}-${b}`}>
            <span className={`cable-dot c${index}`} />
            <span>
              {portLabel(a)}
              <small>{portLabel(b)}</small>
            </span>
            <IconButton
              icon="Unplug"
              title={`Remove cable ${portLabel(a)} to ${portLabel(b)}`}
              action={`disconnect-${index}`}
              onClick={() => dispatch({ type: 'disconnect', index })}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}
