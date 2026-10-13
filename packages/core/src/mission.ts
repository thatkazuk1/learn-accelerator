import { initialState } from './model.js'
import type { EquipmentId, Evaluator, NetworkState } from './model.js'

export type MissionId = 'guided' | 'challenge' | 'broken-link' | 'choose-device' | 'expand'

export interface MissionStep {
  title: string
  detail: string
}

export interface MissionGoal {
  done: boolean
  label: string
}

export interface Mission {
  id: MissionId
  number: number
  title: string
  subtitle: string
  description: string
  steps: MissionStep[]
  initial: () => NetworkState
  win: (state: NetworkState, evaluate: Evaluator) => boolean
  hints: string[]
  maxHints: number
  unlockAfter: MissionId | null
  hasPrediction: boolean
  hasReflection: boolean
  goals: (state: NetworkState, evaluate: Evaluator) => MissionGoal[]
  features?: {
    deviceSelection?: { options: string[]; correct: EquipmentId[] }
    slotsLocked?: boolean
  }
}

function bothOnline(state: NetworkState, evaluate: Evaluator): boolean {
  return evaluate(state, 'desktop').online && evaluate(state, 'phone').online
}

export const missions: Mission[] = [
  {
    id: 'guided',
    number: 1,
    title: 'First connection',
    subtitle: 'YOUR FIRST NETWORK',
    description: 'Build a network that brings your desktop and phone online.',
    steps: [
      { title: 'Stock your rack', detail: 'Place each device into a rack slot.' },
      { title: 'Cable the network', detail: 'Connect ports with Ethernet cables.' },
      { title: 'Run a check', detail: 'Test connectivity for both devices.' },
    ],
    initial: initialState,
    win: bothOnline,
    hints: [
      'The router joins two networks: ISP handoff to WAN, local devices to LAN.',
      'Connect router LAN to any switch port. Connect the desktop and access point to two other switch ports.',
      'Join Lab-WiFi on the phone, then run a connectivity check.',
    ],
    maxHints: 3,
    unlockAfter: null,
    hasPrediction: true,
    hasReflection: false,
    goals(state, evaluate) {
      return [
        { done: state.slots.every((id) => id !== null), label: 'Equip your rack' },
        { done: evaluate(state, 'desktop').online, label: 'Bring desktop online' },
        { done: evaluate(state, 'phone').online, label: 'Bring phone online' },
      ]
    },
  },
  {
    id: 'challenge',
    number: 2,
    title: 'On your own',
    subtitle: 'INDEPENDENT CHALLENGE',
    description: 'Connect this fresh rack and bring both devices online.',
    steps: [
      { title: 'Cable the network', detail: 'Devices are installed. Connect the ports.' },
      { title: 'Enable wireless', detail: 'Join Lab-WiFi on the phone.' },
      { title: 'Prove it works', detail: 'Run a connectivity check and explain each role.' },
    ],
    initial: () => ({ ...initialState(), slots: ['ap', 'router', 'switch'] }),
    win: bothOnline,
    hints: [
      'The router joins two networks: ISP handoff to WAN, local devices to LAN.',
      'Connect router LAN to any switch port. Connect the desktop and access point to two other switch ports.',
      'Join Lab-WiFi on the phone, then run a connectivity check.',
    ],
    maxHints: 3,
    unlockAfter: 'guided',
    hasPrediction: false,
    hasReflection: true,
    goals(state, evaluate) {
      return [
        { done: state.cables.length > 0, label: 'Cable the devices' },
        { done: evaluate(state, 'desktop').online, label: 'Bring desktop online' },
        { done: evaluate(state, 'phone').online, label: 'Bring phone online' },
      ]
    },
  },
  {
    id: 'broken-link',
    number: 3,
    title: 'The broken link',
    subtitle: 'TROUBLESHOOTING',
    description:
      'This network was working yesterday. Someone moved two cables. Find the fault and fix it.',
    steps: [
      { title: 'Run a check', detail: 'See which devices are offline and read the error.' },
      { title: 'Find the fault', detail: 'Two cables are in the wrong ports.' },
      { title: 'Reconnect', detail: 'Move the cables to the correct ports.' },
    ],
    initial: () => ({
      version: 1 as const,
      slots: ['router', 'switch', 'ap'] as NetworkState['slots'],
      cables: [
        ['isp:ETH', 'router:LAN'],
        ['router:WAN', 'switch:1'],
        ['switch:2', 'desktop:ETH'],
        ['switch:3', 'ap:ETH'],
      ] as NetworkState['cables'],
      wifi: true,
      hints: 0,
    }),
    win: bothOnline,
    hints: [
      'Run a connectivity check. The error message tells you which side is wrong.',
      'The ISP must connect to router WAN, not router LAN. Local devices connect through router LAN.',
      'Disconnect the ISP cable and the switch cable from the router. Reconnect ISP to WAN and the switch to LAN.',
    ],
    maxHints: 3,
    unlockAfter: 'challenge',
    hasPrediction: false,
    hasReflection: false,
    goals(state, evaluate) {
      return [
        { done: evaluate(state, 'desktop').online, label: 'Fix desktop connection' },
        { done: evaluate(state, 'phone').online, label: 'Fix phone connection' },
      ]
    },
    features: { slotsLocked: true },
  },
  {
    id: 'choose-device',
    number: 4,
    title: 'Choose your gear',
    subtitle: 'DEVICE ROLES',
    description:
      'Your rack is empty and the stockroom has five devices. Pick the three you need to build a working network.',
    steps: [
      {
        title: 'Choose devices',
        detail: 'Select three devices from five options. Wrong picks get an explanation.',
      },
      { title: 'Cable the network', detail: 'Connect the devices you chose.' },
      { title: 'Go online', detail: 'Bring both the desktop and phone online.' },
    ],
    initial: initialState,
    win: bothOnline,
    hints: [
      'A hub repeats all traffic to every port. A switch sends frames only to the right port.',
      'A repeater extends a signal. An access point bridges wireless clients onto the wired network.',
      'You need a router (for upstream), a switch (for wired devices), and an access point (for wireless).',
    ],
    maxHints: 3,
    unlockAfter: 'broken-link',
    hasPrediction: false,
    hasReflection: false,
    goals(state, evaluate) {
      return [
        { done: state.slots.every((id) => id !== null), label: 'Pick the right devices' },
        { done: evaluate(state, 'desktop').online, label: 'Bring desktop online' },
        { done: evaluate(state, 'phone').online, label: 'Bring phone online' },
      ]
    },
    features: {
      deviceSelection: {
        options: ['router', 'switch', 'ap', 'hub', 'repeater'],
        correct: ['router', 'switch', 'ap'],
      },
    },
  },
  {
    id: 'expand',
    number: 5,
    title: 'Expand the lab',
    subtitle: 'SCALING UP',
    description:
      'The desktop is online. Add a second switch and connect the phone through the access point.',
    steps: [
      { title: 'Add the switch', detail: 'Place a second switch in the empty slot.' },
      { title: 'Daisy-chain', detail: 'Connect the new switch to the existing one.' },
      { title: 'Go wireless', detail: 'Connect the access point and bring the phone online.' },
    ],
    initial: initialState,
    win: bothOnline,
    hints: [
      'Connect a cable from any port on the first switch to any port on the second switch.',
      'Connect the access point to the second switch, then join Lab-WiFi.',
      'Both switches share the same local network through the daisy-chain cable.',
    ],
    maxHints: 3,
    unlockAfter: 'choose-device',
    hasPrediction: false,
    hasReflection: false,
    goals(state, evaluate) {
      return [
        { done: state.slots.every((id) => id !== null), label: 'Fill the rack' },
        { done: evaluate(state, 'desktop').online, label: 'Keep desktop online' },
        { done: evaluate(state, 'phone').online, label: 'Bring phone online' },
      ]
    },
  },
]

export const missionMap: Record<MissionId, Mission> = Object.fromEntries(
  missions.map((m) => [m.id, m]),
) as Record<MissionId, Mission>
