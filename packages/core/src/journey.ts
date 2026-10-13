import { equipmentIds, initialState } from './model.js'
import type { EquipmentId, LevelId, NetworkState } from './model.js'

export const levelKeys: Record<LevelId, string> = {
  guided: 'homelab.level-one.v1',
  challenge: 'homelab.level-two.v1',
}
export const journeyKey = 'homelab.journey.v1'
export interface Journey {
  level: LevelId
  unlocked: boolean
  reflections: Record<EquipmentId, string>
  reflectionSaved: boolean
}
export function freshLevel(level: LevelId): NetworkState {
  if (level === 'challenge') return { ...initialState(), slots: ['ap', 'router', 'switch'] }
  return initialState()
}
export function freshJourney(): Journey {
  return {
    level: 'guided',
    unlocked: false,
    reflections: { router: '', switch: '', ap: '' },
    reflectionSaved: false,
  }
}
export function reflectionReady(values: Journey['reflections']): boolean {
  return equipmentIds.every((id) => values[id].trim().length >= 10)
}
export function restoreJourney(raw: unknown): Journey {
  const journey = freshJourney()
  if (typeof raw !== 'object' || raw === null) return journey
  const value = raw as Record<string, unknown>
  journey.unlocked = value.unlocked === true
  journey.level = value.level === 'challenge' && journey.unlocked ? 'challenge' : 'guided'
  if (typeof value.reflections === 'object' && value.reflections !== null) {
    const reflections = value.reflections as Record<string, unknown>
    for (const id of equipmentIds) {
      const text = reflections[id]
      if (typeof text === 'string') journey.reflections[id] = text.slice(0, 1000)
    }
  }
  journey.reflectionSaved = value.reflectionSaved === true && reflectionReady(journey.reflections)
  return journey
}
