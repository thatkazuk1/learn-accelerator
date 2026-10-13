import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { journeyKey, levelKeys } from '@homelab/core'
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
  const state = game.levels[game.journey.level]
  const desktop = evaluate(state, 'desktop'),
    phone = evaluate(state, 'phone')
  const won = desktop.online && phone.online
  const challenge = game.journey.level === 'challenge'
  useEffect(() => {
    if (!game.changed) return
    try {
      for (const level of ['guided', 'challenge'] as const)
        localStorage.setItem(levelKeys[level], JSON.stringify(game.levels[level]))
      localStorage.setItem(journeyKey, JSON.stringify(game.journey))
      setStorageOK(true)
    } catch {
      setStorageOK(false)
    }
  }, [game.changed, game.levels, game.journey])
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
      <Briefing onStart={() => root.current?.querySelector<HTMLElement>('h1')?.focus()} />
      <header className="topbar">
        <a className="brand" href="/">
          <Icon name="Network" />
          <span>
            homelab<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="edition">NETWORKING / FIELD LAB {challenge ? '02' : '01'}</span>
        <span className="save-state">
          <Icon name={storageOK ? 'HardDrive' : 'AlertCircle'} />
          {storageOK ? 'Saved on this device' : 'Progress is not saved'}
        </span>
      </header>
      <main className={challenge ? 'challenge' : undefined}>
        <section className="mission">
          <div>
            <p className="eyebrow">{challenge ? 'INDEPENDENT CHALLENGE' : 'YOUR FIRST NETWORK'}</p>
            <h1 tabIndex={-1}>
              {challenge ? 'Your network. Your call.' : 'Make the first connection.'}
            </h1>
            <p>
              {challenge
                ? 'Connect this fresh rack and bring both devices online.'
                : 'Build a network that brings your desktop and phone online.'}
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
        <nav className="journey-nav" aria-label="Learning levels">
          <button
            type="button"
            data-level="guided"
            aria-current={!challenge ? 'step' : undefined}
            onClick={() => dispatch({ type: 'level', level: 'guided' })}
          >
            <span>01</span> First connection
          </button>
          <button
            type="button"
            data-level="challenge"
            aria-current={challenge ? 'step' : undefined}
            disabled={!game.journey.unlocked}
            onClick={() => dispatch({ type: 'level', level: 'challenge' })}
          >
            <span>02</span> On your own
          </button>
          <span className="offline-state" role="status">
            {offline}
          </span>
        </nav>
        <div className="lab-layout">
          <Equipment game={game} dispatch={dispatch} desktop={desktop} phone={phone} />
          <Workbench game={game} dispatch={dispatch} desktop={desktop} phone={phone} />
          <Inspector game={game} dispatch={dispatch} desktop={desktop} phone={phone} />
        </div>
        <Diagnostics game={game} dispatch={dispatch} statuses={{ desktop, phone }} />
        {game.prediction && <PredictionPanel prediction={game.prediction} dispatch={dispatch} />}
        {challenge && game.tested && won && (
          <Reflection
            journey={game.journey}
            hints={state.hints}
            storageOK={storageOK}
            dispatch={dispatch}
          />
        )}
        {challenge && (
          <LabComplete
            journey={game.journey}
            guided={game.levels.guided}
            challenge={game.levels.challenge}
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
        <span>HOMELAB / FIRST CONNECTION</span>
        <span>Built for curiosity. No timer, no lost lives.</span>
      </footer>
    </div>
  )
}
