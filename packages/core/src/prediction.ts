import type { Connectivity, Evaluator, NetworkState, PortId } from './model.js'

export type ExperimentId = 'ap' | 'wan' | 'desktop'
export type AnswerId = 'desktop' | 'phone' | 'both' | 'neither'
export const experiments: Record<
  ExperimentId,
  { label: string; port: PortId; explanation: string }
> = {
  ap: {
    label: 'Unplug the access point uplink',
    port: 'ap:ETH',
    explanation:
      'The desktop still has a wired path through the switch and router. The phone stays joined to Wi-Fi, but the access point no longer has a wired path to the router.',
  },
  wan: {
    label: 'Unplug the router WAN connection',
    port: 'router:WAN',
    explanation:
      'Both devices can still reach router LAN. Their local network remains connected, but neither can reach the internet without the router WAN connection.',
  },
  desktop: {
    label: 'Unplug the desktop cable',
    port: 'desktop:ETH',
    explanation:
      'Only the desktop loses its connection. The phone still reaches the router through the access point and switch.',
  },
}
export const answers: Record<AnswerId, string> = {
  desktop: 'Desktop only',
  phone: 'Phone only',
  both: 'Both devices',
  neither: 'Neither device',
}
export interface ExperimentResult {
  next: NetworkState
  actual: AnswerId
  correct: boolean
  desktop: Connectivity
  phone: Connectivity
}
export type Prediction =
  | { phase: 'choose'; experiment: ExperimentId; answer: AnswerId | null }
  | { phase: 'result'; experiment: ExperimentId; answer: AnswerId; before: NetworkState }

export function runExperiment(
  state: NetworkState,
  experiment: ExperimentId,
  answer: AnswerId | null,
  evaluate: Evaluator,
): ExperimentResult {
  if (!Object.hasOwn(experiments, experiment) || answer === null || !Object.hasOwn(answers, answer))
    throw new Error('Choose an experiment and a prediction.')
  if (!evaluate(state, 'desktop').online || !evaluate(state, 'phone').online)
    throw new Error('Bring both devices online before the experiment.')
  const cable = state.cables.findIndex((item) => item.includes(experiments[experiment].port))
  if (cable < 0) throw new Error('The experiment cable is missing.')
  const next = { ...state, cables: state.cables.filter((_, index) => index !== cable) }
  const desktop = evaluate(next, 'desktop')
  const phone = evaluate(next, 'phone')
  let actual: AnswerId = 'neither'
  if (desktop.online && phone.online) actual = 'both'
  else if (desktop.online) actual = 'desktop'
  else if (phone.online) actual = 'phone'
  return { next, actual, correct: actual === answer, desktop, phone }
}
