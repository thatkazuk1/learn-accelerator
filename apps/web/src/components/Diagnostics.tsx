import { clientIds, devices } from '@homelab/core'
import type { ClientId, Connectivity } from '@homelab/core'
import type { Dispatch } from 'react'
import type { Action, Game } from '@/game'
import { deviceIcons, Icon } from '@/components/Icon'

export function Diagnostics({
  game,
  dispatch,
  statuses,
}: {
  game: Game
  dispatch: Dispatch<Action>
  statuses: Record<ClientId, Connectivity>
}) {
  const won = statuses.desktop.online && statuses.phone.online
  return (
    <section className="diagnostics">
      <div className="diagnostic-heading">
        <div>
          <p className="eyebrow">CONNECTIVITY CHECK</p>
          <h2>
            {game.tested && won
              ? 'Your homelab is online.'
              : 'Can your devices reach the internet?'}
          </h2>
        </div>
        <button
          type="button"
          className="primary"
          data-action="test"
          onClick={() => dispatch({ type: 'test' })}
        >
          <Icon name="Play" />
          Run check
        </button>
      </div>
      {game.tested && (
        <div className="results">
          {clientIds.map((id) => {
            const status = statuses[id]
            return (
              <article key={id} className={`result ${status.online ? 'pass' : ''}`}>
                <div>
                  <Icon name={status.online ? 'CircleCheck' : 'CircleAlert'} />
                  <h3>{devices[id].name}</h3>
                  <span>{status.online ? 'PASSED' : 'NOT YET'}</span>
                </div>
                <p>{status.message}</p>
                <div className="stages">
                  <span>
                    {status.physical ? '✓' : '○'} {id === 'phone' ? 'Wi-Fi' : 'Link'}
                  </span>
                  <span>{status.lan ? '✓' : '○'} LAN</span>
                  <span>{status.online ? '✓' : '○'} Internet</span>
                </div>
                {status.online && (
                  <button
                    type="button"
                    className="text-button"
                    data-trace={id}
                    onClick={() => dispatch({ type: 'trace', client: id })}
                  >
                    <Icon name="Route" />
                    Trace connection
                  </button>
                )}
              </article>
            )
          })}
        </div>
      )}
      {game.trace && (
        <div className="trace">
          <p className="eyebrow">CONCEPTUAL OUTBOUND PATH</p>
          <ol>
            {statuses[game.trace].path.map((id, index) => (
              <li key={`${id}-${index}`}>
                <Icon name={deviceIcons[id]} />
                {id === 'internet' ? 'Learning server' : devices[id].name}
              </li>
            ))}
          </ol>
          <p>The router carries traffic between your local network and the upstream network.</p>
        </div>
      )}
      {game.tested && won && game.journey.level === 'guided' && (
        <p className="completion">
          Mission complete. Both clients reached the learning server. Try removing the access point
          uplink: which device will stay online?
        </p>
      )}
    </section>
  )
}
