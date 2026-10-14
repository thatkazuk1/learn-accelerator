import { isMissionUnlocked, missions, missionMap, nextMission } from '@homelab/core'
import type { Journey, MissionId, Player } from '@homelab/core'
import { Icon } from '@/components/Icon'

export function Dashboard({
  journey,
  player,
  onSelect,
  offline,
}: {
  journey: Journey
  player: Player
  onSelect: (id: MissionId) => void
  offline: string
}) {
  const highlighted = nextMission(journey)
  return (
    <main className="dashboard-main">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">MISSION DASHBOARD</p>
          <h1>Welcome back, {player.name}.</h1>
          <p>Choose a mission and build the lab one step at a time.</p>
        </div>
        <span className="offline-state" role="status">
          {offline}
        </span>
      </section>
      <section className="mission-list" aria-label="Learning missions">
        {missions.map((mission) => {
          const unlocked = isMissionUnlocked(mission.id, journey)
          const completed = journey.completed[mission.id] === true
          const required = mission.unlockAfter ? missionMap[mission.unlockAfter] : null
          const icon = completed ? 'Check' : unlocked ? 'ArrowRight' : 'Lock'
          return (
            <button
              key={mission.id}
              type="button"
              className="mission-card"
              data-highlight={highlighted === mission.id ? 'true' : undefined}
              disabled={!unlocked}
              onClick={() => onSelect(mission.id)}
            >
              <span className="mission-card-number">{String(mission.number).padStart(2, '0')}</span>
              <span className="mission-card-copy">
                <strong>{mission.title}</strong>
                <span>{mission.subtitle}</span>
                {!unlocked && required && (
                  <small>Complete {required.title} to unlock this mission.</small>
                )}
              </span>
              <span className="mission-card-icon" aria-hidden="true">
                <Icon name={icon} />
              </span>
            </button>
          )
        })}
      </section>
    </main>
  )
}
