import { useLayoutEffect, useRef, useState } from 'react'
import type { Dispatch } from 'react'
import { devices, portLabel } from '@homelab/core'
import type { Connectivity, DeviceId, EquipmentId, NetworkState, PortId } from '@homelab/core'
import type { Action, Game } from '@/game'
import { deviceIcons, Icon, IconButton } from '@/components/Icon'

function Port({
  port,
  state,
  pending,
  dispatch,
}: {
  port: PortId
  state: NetworkState
  pending: PortId | null
  dispatch: Dispatch<Action>
}) {
  const occupied = state.cables.some((cable) => cable.includes(port))
  const label = port.split(':')[1]
  return (
    <button
      type="button"
      className={`port ${occupied ? 'occupied' : ''} ${pending === port ? 'chosen' : ''} ${label === 'WAN' ? 'wan' : ''}`}
      data-static
      data-port={port}
      aria-label={`${portLabel(port)}, ${occupied ? 'connected' : 'free'}`}
      aria-pressed={pending === port}
      title={portLabel(port)}
      onClick={() => dispatch({ type: 'port', port })}
    >
      <span className="socket">
        <span />
      </span>
      <span>{label}</span>
    </button>
  )
}
function DeviceName({ id, dispatch }: { id: DeviceId; dispatch: Dispatch<Action> }) {
  return (
    <button
      type="button"
      className="device-name"
      data-inspect={id}
      aria-label={`Inspect ${devices[id].name}`}
      onClick={() => dispatch({ type: 'inspect', id })}
    >
      <Icon name={deviceIcons[id]} />
      <span>{devices[id].name}</span>
    </button>
  )
}
function Hardware({
  id,
  game,
  dispatch,
}: {
  id: EquipmentId
  game: Game
  dispatch: Dispatch<Action>
}) {
  return (
    <article
      className={`hardware ${id} ${game.selected === id ? 'inspected' : ''}`}
      data-device={id}
    >
      <div className="hardware-top">
        <DeviceName id={id} dispatch={dispatch} />
        <span className="power">
          <b /> PWR
        </span>
      </div>
      <div className="face">
        <span className="vent" aria-hidden="true" />
        <div className="ports">
          {devices[id].ports.map((port) => (
            <Port
              key={port}
              port={port}
              state={game.states[game.journey.activeMission]}
              pending={game.pending}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    </article>
  )
}
interface CablePath {
  d: string
  color: string
  wireless: boolean
}
export function Workbench({
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
  const state = game.states[game.journey.activeMission]
  const sceneRef = useRef<HTMLDivElement>(null)
  const [drawing, setDrawing] = useState<{ width: number; height: number; paths: CablePath[] }>({
    width: 1,
    height: 1,
    paths: [],
  })
  useLayoutEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    const measure = () => {
      const rect = scene.getBoundingClientRect()
      const point = (port: PortId): [number, number] => {
        const socket = scene.querySelector(`[data-port="${port}"] .socket`)
        if (!socket) throw new Error(`Missing port element: ${port}`)
        const box = socket.getBoundingClientRect()
        return [box.x + box.width / 2 - rect.x, box.y + box.height / 2 - rect.y]
      }
      const paths = state.cables.map(([a, b], index): CablePath => {
        const [x, y] = point(a),
          [xx, yy] = point(b)
        const bend = Math.max(45, Math.abs(yy - y) / 2)
        return {
          d: `M ${x} ${y} C ${x + 30} ${y + bend}, ${xx + 35} ${yy - bend}, ${xx} ${yy}`,
          color: `var(--cable-${(index % 5) + 1})`,
          wireless: false,
        }
      })
      if (state.wifi && state.slots.includes('ap')) {
        const ap = scene.querySelector('[data-device="ap"]')
        const handset = scene.querySelector('.phone-art')
        if (!ap || !handset) throw new Error('Missing wireless device element')
        const apBox = ap.getBoundingClientRect(),
          phoneBox = handset.getBoundingClientRect()
        const x = apBox.x + 35 - rect.x,
          y = apBox.bottom - rect.y
        const xx = phoneBox.x + phoneBox.width / 2 - rect.x,
          yy = phoneBox.top - rect.y
        paths.push({
          d: `M ${x} ${y} Q ${x} ${yy - 20}, ${xx} ${yy}`,
          color: 'var(--wireless)',
          wireless: true,
        })
      }
      setDrawing({ width: rect.width, height: rect.height, paths })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(scene)
    return () => observer.disconnect()
  }, [state])
  return (
    <section className="workbench" aria-label="Network workbench">
      <div className="bench-toolbar">
        <span>
          <Icon name="Box" /> WORKBENCH <span className="live-dot" />
        </span>
        <div>
          <IconButton
            action="undo"
            icon="Undo2"
            title="Undo last change"
            disabled={game.history.length === 0}
            onClick={() => dispatch({ type: 'undo' })}
          />
          <IconButton
            action="reset"
            icon="RotateCcw"
            title="Reset level"
            onClick={() => dispatch({ type: 'reset' })}
          />
        </div>
      </div>
      <div className="scene" id="scene" ref={sceneRef}>
        <svg
          className="cables"
          id="cables"
          aria-hidden="true"
          viewBox={`0 0 ${drawing.width} ${drawing.height}`}
        >
          {drawing.paths.map((path, index) => (
            <path
              key={index}
              d={path.d}
              stroke={path.color}
              className={path.wireless ? 'wireless-path' : undefined}
            />
          ))}
        </svg>
        <div className="uplink">
          <div className="uplink-copy">
            <Icon name="Globe" />
            <span>
              <strong>Internet</strong>
              <small>ISP handoff / ready</small>
            </span>
          </div>
          <Port port="isp:ETH" state={state} pending={game.pending} dispatch={dispatch} />
        </div>
        <div className="rack">
          <div className="rack-cap">
            <span>HOME LAB / RACK 01</span>
            <span>3U</span>
          </div>
          {state.slots.map((id, index) => (
            <div className="rack-slot" key={index}>
              <span className="rack-number">0{index + 1}</span>
              {id ? (
                <Hardware id={id} game={game} dispatch={dispatch} />
              ) : (
                <button
                  type="button"
                  data-static
                  className={`empty-slot ${game.equipment ? 'available' : ''}`}
                  data-slot={index}
                  aria-label={`Place selected equipment in slot ${index + 1}`}
                  onClick={() => dispatch({ type: 'place', slot: index as 0 | 1 | 2 })}
                >
                  <Icon name="Plus" />
                  <span>
                    {game.equipment
                      ? `Place ${devices[game.equipment].name.toLowerCase()}`
                      : 'Empty slot'}
                  </span>
                </button>
              )}
              <span className="rack-screw" aria-hidden="true">
                +
              </span>
            </div>
          ))}
          <div className="rack-foot" />
        </div>
        <div className="desk">
          <article className="client desktop-client">
            <DeviceName id="desktop" dispatch={dispatch} />
            <div className="monitor-art" aria-hidden="true">
              <div>
                <span className="terminal-prompt">&gt;_</span>
                <span className="screen-state">
                  {desktop.online ? 'CONNECTED' : 'NO CONNECTION'}
                </span>
              </div>
            </div>
            <div className="client-bottom">
              <Port port="desktop:ETH" state={state} pending={game.pending} dispatch={dispatch} />
              <span className={`status ${desktop.online ? 'online' : ''}`}>
                {desktop.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </article>
          <article className="client phone-client">
            <DeviceName id="phone" dispatch={dispatch} />
            <div className="phone-art" aria-hidden="true">
              <Icon name="Wifi" />
              <span>{state.wifi ? 'Lab-WiFi' : 'Not joined'}</span>
            </div>
            <label className="wifi-label" htmlFor="wifi">
              Wi-Fi network
            </label>
            <select
              id="wifi"
              aria-label={`Phone Wi-Fi network, ${state.wifi ? 'joined to Lab-WiFi' : 'not connected'}`}
              disabled={!state.slots.includes('ap')}
              value={state.wifi ? 'on' : 'off'}
              onChange={(event) => dispatch({ type: 'wifi', joined: event.target.value === 'on' })}
            >
              <option value="off">Not connected</option>
              <option value="on">Lab-WiFi</option>
            </select>
            <span className={`status ${phone.online ? 'online' : ''}`}>
              {phone.online ? 'Online' : 'Offline'}
            </span>
          </article>
        </div>
      </div>
      <div className="bench-status" role="status">
        <Icon name={game.pending ? 'Cable' : 'Info'} />
        <span>
          {game.pending
            ? `${portLabel(game.pending)} selected. Choose another free port.`
            : game.notice}
        </span>
        {game.pending && (
          <IconButton
            action="cancel"
            icon="X"
            title="Cancel connection"
            onClick={() => dispatch({ type: 'cancel' })}
          />
        )}
      </div>
    </section>
  )
}
