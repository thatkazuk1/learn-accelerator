import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { journeyKey, missionKeys, missions, missionMap, isMissionUnlocked } from '@homelab/core'
import { loadGame, reduceGame } from '@/game'
import { evaluate } from '@/network'
import { prepareOffline, initialOfflineStatus } from '@/offline'
import { Icon } from '@/components/Icon'
import { Briefing } from '@/components/Briefing'
import { Equipment } from '@/components/Equipment'
import { Workbench } from '@/components/Workbench'
import { Inspector } from '@/components/Inspector'
import { Diagnostics } from '@/components/Diagnostics'
import { PredictionPanel } from '@/components/PredictionPanel'
import { Reflection } from '@/components/Reflection'
import { LabComplete } from '@/components/LabComplete'

export function App() {
  const [game, dispatch] = useReducer(reduceGame, undefined, loadGame)
  const [storageOK, setStorageOK] = useState(game.initialStorageOK)
  const [offline, setOffline] = useState(initialOfflineStatus)
  const root = useRef<HTMLDivElement>(null)
  const missionId = game.journey.activeMission
  const mission = missionMap[missionId]
  const state = game.states[missionId]
  const desktop = evaluate(state, 'desktop'),
    phone = evaluate(state, 'phone')
  const won = desktop.online && phone.online
  const isChallenge = missionId === 'challenge'
  useEffect(() => {
    if (!game.changed) return
    try {
      for (const m of missions) {
        localStorage.setItem(missionKeys[m.id], JSON.stringify(game.states[m.id]))
      }
      localStorage.setItem(journeyKey, JSON.stringify(game.journey))
      setStorageOK(true)
    } catch {
      setStorageOK(false)
    }
  }, [game.changed, game.states, game.journey])
  useLayoutEffect(() => {
    if (game.focusTarget)
      root.current?.querySelector<HTMLElement>(game.focusTarget)?.focus({ preventScroll: true })
  }, [game.focusTarget])
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && (game.pending || game.equipment)) dispatch({ type: 'cancel' })
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [game.pending, game.equipment])
  useEffect(() => prepareOffline(setOffline), [])
  return (
    <div ref={root}>
      <Briefing
        mission={mission}
        onStart={() => root.current?.querySelector<HTMLElement>('h1')?.focus()}
      />
      <header className="topbar">
        <a className="brand" href="/">
          <Icon name="Network" />
          <span>
            homelab<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="edition">
          NETWORKING / MISSION {String(mission.number).padStart(2, '0')}
        </span>
        <span className="save-state">
          <Icon name={storageOK ? 'HardDrive' : 'AlertCircle'} />
          {storageOK ? 'Saved on this device' : 'Progress is not saved'}
        </span>
      </header>
      <main className={isChallenge ? 'challenge' : undefined}>
        <section className="mission">
          <div>
            <p className="eyebrow">{mission.subtitle}</p>
            <h1 tabIndex={-1}>
              {mission.title === 'First connection'
                ? 'Make the first connection.'
                : mission.title === 'On your own'
                  ? 'Your network. Your call.'
                  : mission.description}
            </h1>
            <p>
              {mission.id === 'guided'
                ? 'Build a network that brings your desktop and phone online.'
                : mission.id === 'challenge'
                  ? 'Connect this fresh rack and bring both devices online.'
                  : mission.description}
            </p>
          </div>
          <div className="mission-progress">
            <span className="count">
              {Number(desktop.online) + Number(phone.online)}
              <small>/ 2</small>
            </span>
            <span>devices online</span>
          </div>
        </section>
        <nav className="journey-nav" aria-label="Learning missions">
          {missions.map((m) => (
            <button
              key={m.id}
              type="button"
              data-level={m.id}
              aria-current={missionId === m.id ? 'step' : undefined}
              disabled={!isMissionUnlocked(m.id, game.journey)}
              onClick={() => dispatch({ type: 'mission', id: m.id })}
            >
              <span>{String(m.number).padStart(2, '0')}</span> {m.title}
            </button>
          ))}
          <span className="offline-state" role="status">
            {offline}
          </span>
        </nav>
        <div className="lab-layout">
          <Equipment game={game} dispatch={dispatch} mission={mission} />
          <Workbench game={game} dispatch={dispatch} desktop={desktop} phone={phone} />
          <Inspector game={game} dispatch={dispatch} desktop={desktop} phone={phone} />
        </div>
        <Diagnostics
          game={game}
          dispatch={dispatch}
          statuses={{ desktop, phone }}
          mission={mission}
        />
        {game.prediction && <PredictionPanel prediction={game.prediction} dispatch={dispatch} />}
        {isChallenge && game.tested && won && (
          <Reflection
            journey={game.journey}
            hints={state.hints}
            storageOK={storageOK}
            dispatch={dispatch}
          />
        )}
        {isChallenge && (
          <LabComplete
            journey={game.journey}
            guided={game.states.guided}
            challenge={game.states.challenge}
          />
        )}
        <details className="reference">
          <summary>Lab assumptions &amp; sources</summary>
          <p>
            This model checks connections. It does not simulate each packet. Devices are powered
            automatically; routing, NAT, DHCP and Wi-Fi credentials are preconfigured. DNS, radio
            range and protocol exchanges are not simulated. In real networks, DHCP leases can remain
            valid for a time after a disconnection. This lab recomputes connectivity right away. A
            home router may combine the three roles shown separately here.
          </p>
          <p>
            Sources:{' '}
            <a
              href="https://www.cisco.com/site/us/en/learn/topics/small-business/network-switch-how.html"
              target="_blank"
              rel="noreferrer"
            >
              Cisco: switches
            </a>{' '}
            ·{' '}
            <a
              href="https://www.cisco.com/site/us/en/learn/topics/small-business/network-switch-vs-router.html"
              target="_blank"
              rel="noreferrer"
            >
              routers
            </a>{' '}
            ·{' '}
            <a
              href="https://www.cisco.com/site/us/en/learn/topics/small-business/what-is-an-access-point.html"
              target="_blank"
              rel="noreferrer"
            >
              access points
            </a>
            .
          </p>
        </details>
      </main>
      <footer>
        <span>HOMELAB / {mission.title.toUpperCase()}</span>
        <span>Built for curiosity. No timer, no lost lives.</span>
      </footer>
    </div>
  )
}
