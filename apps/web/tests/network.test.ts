import test from 'node:test'
import assert from 'node:assert/strict'
import {
  initialState,
  connect,
  restore,
  runExperiment,
  freshLevel,
  restoreJourney,
  reflectionReady,
  clientIds,
} from '@homelab/core'
import type { NetworkState, Cable, ExperimentId, AnswerId, PortId } from '@homelab/core'
import { evaluate } from '../src/network.js'

function working(): NetworkState {
  let state: NetworkState = { ...initialState(), slots: ['router', 'switch', 'ap'], wifi: true }
  const cables: Cable[] = [
    ['isp:ETH', 'router:WAN'],
    ['router:LAN', 'switch:1'],
    ['switch:2', 'desktop:ETH'],
    ['switch:3', 'ap:ETH'],
  ]
  for (const cable of cables) state = connect(state, ...cable)
  return state
}

test('independent level is fresh and saved reflections are validated', () => {
  const level = freshLevel('challenge')
  assert.deepEqual(level.slots, ['ap', 'router', 'switch'])
  assert.equal(level.cables.length, 0)
  assert.equal(evaluate(level, 'phone').online, false)
  assert.equal(restoreJourney({ level: 'challenge', unlocked: false }).level, 'guided')
  assert.equal(reflectionReady({ router: 'x', switch: 'x', ap: 'x' }), false)
  const text = '</textarea><script>bad()</script>'
  const journey = restoreJourney({
    unlocked: true,
    level: 'challenge',
    reflections: { router: text },
  })
  assert.equal(journey.level, 'challenge')
  assert.equal(journey.reflections.router, text)
  assert.equal(journey.reflections.switch, '')
})

test('experiments evaluate real topology without mutating the baseline', () => {
  const state = working(),
    before = structuredClone(state)
  const cases: [ExperimentId, AnswerId][] = [
    ['ap', 'desktop'],
    ['wan', 'neither'],
    ['desktop', 'phone'],
  ]
  for (const [experiment, expected] of cases) {
    const result = runExperiment(state, experiment, expected, evaluate)
    assert.equal(result.actual, expected)
    assert.equal(result.correct, true)
    assert.equal(result.next.cables.length, state.cables.length - 1)
  }
  assert.deepEqual(state, before)
  assert.equal(runExperiment(state, 'ap', 'both', evaluate).correct, false)
  assert.equal(runExperiment(state, 'ap', 'desktop', evaluate).phone.physical, true)
  assert.equal(runExperiment(state, 'wan', 'neither', evaluate).phone.lan, true)
})

test('prediction requires a valid choice and working baseline', () => {
  assert.throws(() => runExperiment(working(), 'ap', null, evaluate))
  // A JavaScript caller can bypass the TypeScript contract.
  // @ts-expect-error Deliberately invalid experiment at the public boundary.
  assert.throws(() => runExperiment(working(), 'unknown', 'both', evaluate))
  assert.throws(
    () => runExperiment(initialState(), 'ap', 'desktop', evaluate),
    /both devices online/,
  )
})

test('both clients reach internet through correct roles', () => {
  const state = working()
  assert.equal(evaluate(state, 'desktop').online, true)
  assert.deepEqual(evaluate(state, 'phone').path, [
    'phone',
    'ap',
    'switch',
    'router',
    'isp',
    'internet',
  ])
})

test('rack position and switch port choice have no semantic effect', () => {
  const state = working()
  state.slots.reverse()
  const movePort = (port: PortId): PortId => (port === 'switch:1' ? 'switch:5' : port)
  state.cables = state.cables.map(([a, b]) => [movePort(a), movePort(b)])
  assert.equal(evaluate(state, 'phone').online, true)
})

test('direct LAN to desktop is a valid partial solution', () => {
  let state: NetworkState = { ...initialState(), slots: ['router', null, null] }
  state = connect(state, 'isp:ETH', 'router:WAN')
  state = connect(state, 'desktop:ETH', 'router:LAN')
  assert.equal(evaluate(state, 'desktop').online, true)
  assert.equal(evaluate(state, 'phone').online, false)
})

test('AP uplink removal preserves association and desktop internet', () => {
  const state = working()
  state.cables.pop()
  assert.equal(evaluate(state, 'desktop').online, true)
  assert.equal(evaluate(state, 'phone').physical, true)
  assert.equal(evaluate(state, 'phone').online, false)
  assert.match(evaluate(state, 'phone').message, /uplink/)
})

test('WAN removal preserves local configuration; restoring repairs it', () => {
  let state = working()
  const cable = state.cables.shift()
  assert.ok(cable)
  for (const id of clientIds) {
    assert.equal(evaluate(state, id).lan, true)
    assert.equal(evaluate(state, id).online, false)
  }
  state = connect(state, ...cable)
  assert.equal(evaluate(state, 'phone').online, true)
})

test('swapped LAN and WAN do not pass', () => {
  const state = working()
  function swapPort(port: PortId): PortId {
    if (port === 'router:WAN') return 'router:LAN'
    if (port === 'router:LAN') return 'router:WAN'
    return port
  }
  state.cables = state.cables.map(([a, b]) => [swapPort(a), swapPort(b)])
  assert.equal(evaluate(state, 'desktop').online, false)
})

test('ISP on client switch cannot substitute for a router', () => {
  let state: NetworkState = { ...initialState(), slots: ['switch', 'ap', null], wifi: true }
  const cables: Cable[] = [
    ['isp:ETH', 'switch:1'],
    ['desktop:ETH', 'switch:2'],
    ['ap:ETH', 'switch:3'],
  ]
  for (const cable of cables) state = connect(state, ...cable)
  assert.equal(evaluate(state, 'desktop').online, false)
  assert.equal(evaluate(state, 'phone').lan, false)
})

test('invalid actions cannot overwrite cables', () => {
  const state = working(),
    before = structuredClone(state)
  assert.throws(() => connect(state, 'isp:ETH', 'switch:4'), /occupied/)
  assert.throws(() => connect(state, 'switch:4', 'switch:5'), /different device/)
  assert.throws(() => connect(initialState(), 'router:LAN', 'desktop:ETH'), /available/)
  assert.deepEqual(state, before)
})

test('saved game round-trip and untrusted save validation', () => {
  assert.deepEqual(restore(JSON.parse(JSON.stringify(working()))), working())
  assert.throws(() => restore({ ...working(), slots: ['router', 'router', null] }))
  assert.throws(() => restore({ ...working(), cables: [['bad:port', 'desktop:ETH']] }))
})
