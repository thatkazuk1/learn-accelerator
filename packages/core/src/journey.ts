import { equipmentIds, initialState } from './model.js'
import type { EquipmentId, LevelId, NetworkState } from './model.js'
import type { MissionId } from './mission.js'
import { missionMap, missions } from './mission.js'

export const levelKeys: Record<LevelId, string> = {
  guided: 'homelab.level-one.v1',
  challenge: 'homelab.level-two.v1',
}
export const missionKeys: Record<MissionId, string> = {
  guided: 'homelab.level-one.v1',
  challenge: 'homelab.level-two.v1',
  'broken-link': 'homelab.mission-broken-link.v1',
  'choose-device': 'homelab.mission-choose-device.v1',
  expand: 'homelab.mission-expand.v1',
}
export const journeyKey = 'homelab.journey.v1'
export const playerKey = 'homelab.player.v1'
export interface Player {
  name: string
}
export interface Journey {
  level: LevelId
  unlocked: boolean
  reflections: Record<EquipmentId, string>
  reflectionSaved: boolean
  activeMission: MissionId
  completed: Partial<Record<MissionId, true>>
}
export function freshLevel(level: LevelId): NetworkState {
  if (level === 'challenge') return { ...initialState(), slots: ['ap', 'router', 'switch'] }
  return initialState()
}
export function freshMission(id: MissionId): NetworkState {
  return missionMap[id].initial()
}
export function freshJourney(): Journey {
  return {
    level: 'guided',
    unlocked: false,
    reflections: { router: '', switch: '', ap: '' },
    reflectionSaved: false,
    activeMission: 'guided',
    completed: {},
  }
}
export function freshPlayer(): Player {
  return { name: '' }
}
export function restorePlayer(raw: unknown): Player {
  const player = freshPlayer()
  if (typeof raw !== 'object' || raw === null) return player
  const value = raw as { name?: unknown }
  if (typeof value.name === 'string') player.name = value.name.trim().slice(0, 80)
  return player
}
export function reflectionReady(values: Journey['reflections']): boolean {
  return equipmentIds.every((id) => values[id].trim().length >= 10)
}
export function isMissionUnlocked(id: MissionId, journey: Journey): boolean {
  const mission = missionMap[id]
  if (!mission.unlockAfter) return true
  return journey.completed[mission.unlockAfter] === true
}
export function nextMission(journey: Journey): MissionId | null {
  for (const m of missions) {
    if (!journey.completed[m.id] && isMissionUnlocked(m.id, journey)) return m.id
  }
  return null
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
  if (journey.unlocked) journey.completed.guided = true
  if (journey.reflectionSaved) journey.completed.challenge = true
  if (typeof value.completed === 'object' && value.completed !== null) {
    const completed = value.completed as Record<string, unknown>
    for (const m of missions) {
      if (completed[m.id] === true) journey.completed[m.id] = true
    }
  }
  const missionIds: string[] = missions.map((m) => m.id)
  if (typeof value.activeMission === 'string' && missionIds.includes(value.activeMission)) {
    const candidate = value.activeMission as MissionId
    if (isMissionUnlocked(candidate, journey)) journey.activeMission = candidate
  } else {
    journey.activeMission = journey.level
  }
  return journey
}
