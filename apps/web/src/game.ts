import {
  connect,
  devices,
  freshJourney,
  freshLevel,
  journeyKey,
  levelKeys,
  restore,
  restoreJourney,
  runExperiment,
} from '@homelab/core'
import type {
  AnswerId,
  ClientId,
  DeviceId,
  EquipmentId,
  ExperimentId,
  Journey,
  LevelId,
  NetworkState,
  PortId,
  Prediction,
} from '@homelab/core'
import { evaluate } from '@/network'

export interface Game {
  levels: Record<LevelId, NetworkState>
  journey: Journey
  selected: DeviceId
  equipment: EquipmentId | null
  pending: PortId | null
  tested: boolean
  trace: ClientId | null
  hint: boolean
  history: NetworkState[]
  prediction: Prediction | null
  notice: string
  focusTarget: string | null
  initialStorageOK: boolean
  changed: boolean
}
export type Action =
  | { type: 'equipment'; id: EquipmentId }
  | { type: 'place'; slot: 0 | 1 | 2 }
  | { type: 'inspect'; id: DeviceId }
  | { type: 'port'; port: PortId }
  | { type: 'wifi'; joined: boolean }
  | { type: 'trace'; client: ClientId }
  | { type: 'remove'; id: EquipmentId }
  | { type: 'disconnect'; index: number }
  | { type: 'level'; level: LevelId }
  | { type: 'experiment'; id: ExperimentId }
  | { type: 'answer'; id: AnswerId }
  | { type: 'reflection'; id: EquipmentId; text: string }
  | {
      type:
        | 'test'
        | 'hint'
        | 'undo'
        | 'reset'
        | 'cancel'
        | 'run-experiment'
        | 'restore-experiment'
        | 'save-reflection'
    }

export function loadGame(): Game {
  let journey = freshJourney()
  const levels = { guided: freshLevel('guided'), challenge: freshLevel('challenge') }
  let initialStorageOK = true
  try {
    const saved = localStorage.getItem(journeyKey)
    if (saved) journey = restoreJourney(JSON.parse(saved))
  } catch {
    initialStorageOK = false
  }
  for (const level of ['guided', 'challenge'] as const) {
    try {
      const saved = localStorage.getItem(levelKeys[level])
      if (saved) levels[level] = restore(JSON.parse(saved))
    } catch {
      initialStorageOK = false
    }
  }
  return {
    levels,
    journey,
    initialStorageOK,
    changed: false,
    selected: 'router',
    equipment: null,
    pending: null,
    tested: false,
    trace: null,
    hint: false,
    history: [],
    prediction: null,
    notice: 'Your internet connection is ready. Bring both devices online.',
    focusTarget: null,
  }
}

function changeNetwork(game: Game, network: NetworkState, notice: string): Game {
  return {
    ...game,
    levels: { ...game.levels, [game.journey.level]: network },
    history: [...game.history.slice(-29), game.levels[game.journey.level]],
    pending: null,
    trace: null,
    prediction: null,
    notice,
    changed: true,
  }
}

export function reduceGame(previous: Game, action: Action): Game {
  let game: Game = { ...previous, focusTarget: null }
  const state = game.levels[game.journey.level]
  switch (action.type) {
    case 'equipment': {
      const equipment = state.slots.includes(action.id) ? null : action.id
      game = {
        ...game,
        selected: action.id,
        equipment,
        notice: `${devices[action.id].name} selected.`,
      }
      if (equipment) game.focusTarget = '[data-slot]'
      break
    }
    case 'place': {
      if (!game.equipment)
        return { ...game, notice: 'Choose a device from your starter kit first.' }
      const id = game.equipment
      const slots: NetworkState['slots'] = [...state.slots]
      slots[action.slot] = id
      game = changeNetwork(game, { ...state, slots }, 'Device installed and powered on.')
      game.equipment = null
      game.focusTarget = `[data-device="${id}"] [data-port]`
      break
    }
    case 'inspect':
      game.selected = action.id
      break
    case 'port': {
      if (state.cables.some((cable) => cable.includes(action.port)))
        return {
          ...game,
          pending: null,
          notice: 'This port is occupied. Remove its cable from Connections first.',
        }
      if (game.pending === action.port) return { ...game, pending: null }
      if (!game.pending) return { ...game, pending: action.port }
      try {
        game = changeNetwork(game, connect(state, game.pending, action.port), 'Cable connected.')
      } catch (error) {
        game.pending = null
        game.notice = (error as Error).message
      }
      break
    }
    case 'wifi':
      game = changeNetwork(
        game,
        { ...state, wifi: action.joined },
        action.joined ? 'Phone joined Lab-WiFi.' : 'Phone disconnected from Wi-Fi.',
      )
      break
    case 'trace':
      game.trace = action.client
      break
    case 'test':
      game.tested = true
      game.notice = 'Connectivity checks updated.'
      break
    case 'hint':
      game.hint = true
      game.levels = {
        ...game.levels,
        [game.journey.level]: { ...state, hints: Math.min(3, state.hints + 1) },
      }
      game.changed = true
      break
    case 'undo': {
      const last = game.history.at(-1)
      if (!last) return game
      game = {
        ...game,
        levels: { ...game.levels, [game.journey.level]: last },
        history: game.history.slice(0, -1),
        prediction: null,
        pending: null,
        equipment: null,
        trace: null,
        changed: true,
        notice: 'Last change undone.',
      }
      break
    }
    case 'reset':
      game = changeNetwork(game, freshLevel(game.journey.level), 'Level reset. Undo is available.')
      game.tested = false
      game.equipment = null
      game.hint = false
      break
    case 'remove': {
      const slots = state.slots.map((id) => (id === action.id ? null : id)) as NetworkState['slots']
      game = changeNetwork(
        game,
        {
          ...state,
          slots,
          cables: state.cables.filter(
            (cable) => !cable.some((port) => port.startsWith(`${action.id}:`)),
          ),
          wifi: action.id === 'ap' ? false : state.wifi,
        },
        `${devices[action.id].name} returned to inventory. Undo is available.`,
      )
      game.focusTarget = `[data-equipment="${action.id}"]`
      break
    }
    case 'disconnect':
      game = changeNetwork(
        game,
        { ...state, cables: state.cables.filter((_, index) => index !== action.index) },
        'Cable removed.',
      )
      break
    case 'cancel':
      game.focusTarget = game.equipment ? `[data-equipment="${game.equipment}"]` : null
      game.pending = null
      game.equipment = null
      break
    case 'level': {
      if (
        action.level === game.journey.level ||
        (action.level === 'challenge' && !game.journey.unlocked)
      )
        return game
      return {
        ...game,
        journey: { ...game.journey, level: action.level },
        selected: action.level === 'challenge' ? 'ap' : 'router',
        equipment: null,
        pending: null,
        tested: false,
        trace: null,
        hint: false,
        history: [],
        prediction: null,
        changed: true,
        notice: 'Bring both devices online. Hints are available whenever you need them.',
        focusTarget: 'h1',
      }
    }
    case 'experiment':
      game.prediction = { phase: 'choose', experiment: action.id, answer: null }
      break
    case 'answer':
      if (game.prediction?.phase === 'choose')
        game.prediction = { ...game.prediction, answer: action.id }
      break
    case 'run-experiment': {
      const prediction = game.prediction
      if (!prediction || prediction.phase !== 'choose' || !prediction.answer) return game
      try {
        const result = runExperiment(state, prediction.experiment, prediction.answer, evaluate)
        game = changeNetwork(
          game,
          result.next,
          'Experiment applied. Compare your prediction with the connectivity results.',
        )
        game.prediction = {
          phase: 'result',
          experiment: prediction.experiment,
          answer: prediction.answer,
          before: state,
        }
        game.tested = true
        game.focusTarget = '#prediction-heading'
      } catch (error) {
        game.notice = (error as Error).message
      }
      break
    }
    case 'restore-experiment': {
      if (game.prediction?.phase !== 'result') return game
      game = changeNetwork(
        game,
        game.prediction.before,
        'Cable reconnected. Both devices are back online.',
      )
      game.focusTarget = '#prediction-heading'
      break
    }
    case 'reflection':
      game.journey = {
        ...game.journey,
        reflections: { ...game.journey.reflections, [action.id]: action.text.slice(0, 1000) },
        reflectionSaved: false,
      }
      game.changed = true
      break
    case 'save-reflection':
      game.journey = { ...game.journey, reflectionSaved: true }
      game.changed = true
      break
  }
  const current = game.levels[game.journey.level]
  if (game.tested && evaluate(current, 'desktop').online && evaluate(current, 'phone').online) {
    if (!game.journey.unlocked) {
      game.journey = { ...game.journey, unlocked: true }
      game.changed = true
    }
    if (game.journey.level === 'guided' && !game.prediction)
      game.prediction = { phase: 'choose', experiment: 'ap', answer: null }
  }
  return game
}
