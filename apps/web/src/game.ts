import {
  connect,
  devices,
  freshJourney,
  freshMission,
  journeyKey,
  missionKeys,
  missionMap,
  missions,
  restore,
  restoreJourney,
  runExperiment,
  isMissionUnlocked,
} from '@homelab/core'
import type {
  AnswerId,
  ClientId,
  DeviceId,
  EquipmentId,
  ExperimentId,
  Journey,
  MissionId,
  NetworkState,
  PortId,
  Prediction,
} from '@homelab/core'
import { evaluate } from '@/network'

export interface Game {
  states: Record<MissionId, NetworkState>
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
  deviceChoices: string[]
  deviceFeedback: string | null
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
  | { type: 'level'; level: MissionId }
  | { type: 'mission'; id: MissionId }
  | { type: 'experiment'; id: ExperimentId }
  | { type: 'answer'; id: AnswerId }
  | { type: 'reflection'; id: EquipmentId; text: string }
  | { type: 'selectDevice'; option: string }
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
  const states: Record<string, NetworkState> = {}
  for (const m of missions) states[m.id] = freshMission(m.id)
  let initialStorageOK = true
  try {
    const saved = localStorage.getItem(journeyKey)
    if (saved) journey = restoreJourney(JSON.parse(saved))
  } catch {
    initialStorageOK = false
  }
  for (const m of missions) {
    try {
      const saved = localStorage.getItem(missionKeys[m.id])
      if (saved) states[m.id] = restore(JSON.parse(saved))
    } catch {
      initialStorageOK = false
    }
  }
  return {
    states: states as Record<MissionId, NetworkState>,
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
    deviceChoices: [],
    deviceFeedback: null,
  }
}

function changeNetwork(game: Game, network: NetworkState, notice: string): Game {
  const id = game.journey.activeMission
  return {
    ...game,
    states: { ...game.states, [id]: network },
    history: [...game.history.slice(-29), game.states[id]],
    pending: null,
    trace: null,
    prediction: null,
    notice,
    changed: true,
  }
}

export function reduceGame(previous: Game, action: Action): Game {
  let game: Game = { ...previous, focusTarget: null }
  const missionId = game.journey.activeMission
  const mission = missionMap[missionId]
  const state = game.states[missionId]
  switch (action.type) {
    case 'equipment': {
      if (mission.features?.slotsLocked) return game
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
      if (mission.features?.slotsLocked) return game
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
      game.states = {
        ...game.states,
        [missionId]: { ...state, hints: Math.min(mission.maxHints, state.hints + 1) },
      }
      game.changed = true
      break
    case 'undo': {
      const last = game.history.at(-1)
      if (!last) return game
      game = {
        ...game,
        states: { ...game.states, [missionId]: last },
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
      game = changeNetwork(game, mission.initial(), 'Mission reset. Undo is available.')
      game.tested = false
      game.equipment = null
      game.hint = false
      game.deviceChoices = []
      game.deviceFeedback = null
      break
    case 'remove': {
      if (mission.features?.slotsLocked) return game
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
    case 'level':
    case 'mission': {
      const targetId = action.type === 'level' ? action.level : action.id
      if (targetId === missionId || !isMissionUnlocked(targetId, game.journey)) return game
      return {
        ...game,
        journey: {
          ...game.journey,
          activeMission: targetId,
          level: targetId === 'guided' || targetId === 'challenge' ? targetId : game.journey.level,
        },
        selected: targetId === 'challenge' ? 'ap' : 'router',
        equipment: null,
        pending: null,
        tested: false,
        trace: null,
        hint: false,
        history: [],
        prediction: null,
        changed: true,
        notice: missionMap[targetId].description,
        focusTarget: 'h1',
        deviceChoices: [],
        deviceFeedback: null,
      }
    }
    case 'selectDevice': {
      const sel = mission.features?.deviceSelection
      if (!sel) return game
      const option = action.option
      if (game.deviceChoices.includes(option)) return game
      const correct = sel.correct as string[]
      if (!correct.includes(option)) {
        const feedback =
          option === 'hub'
            ? 'A hub repeats all traffic to every port. A switch is more efficient.'
            : option === 'repeater'
              ? 'A repeater extends a signal range. An access point bridges wireless to wired.'
              : `${option} is not the right device for this network.`
        return { ...game, deviceFeedback: feedback }
      }
      const choices = [...game.deviceChoices, option]
      game = { ...game, deviceChoices: choices, deviceFeedback: null }
      if (choices.length === correct.length) {
        const slots = correct.slice() as NetworkState['slots']
        game = changeNetwork(
          game,
          { ...state, slots },
          'All devices selected. Now cable the network.',
        )
      }
      break
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
  const current = game.states[missionId]
  if (game.tested && mission.win(current, evaluate)) {
    if (!game.journey.completed[missionId]) {
      game.journey = {
        ...game.journey,
        completed: { ...game.journey.completed, [missionId]: true },
      }
      if (missionId === 'guided') game.journey.unlocked = true
      game.changed = true
    }
    if (mission.hasPrediction && !game.prediction)
      game.prediction = { phase: 'choose', experiment: 'ap', answer: null }
  }
  return game
}
