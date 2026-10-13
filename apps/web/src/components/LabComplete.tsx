import type { Journey, NetworkState } from '@homelab/core'
import { Icon } from '@/components/Icon'

export function LabComplete({
  journey,
  guided,
  challenge,
}: {
  journey: Journey
  guided: NetworkState
  challenge: NetworkState
}) {
  if (!journey.reflectionSaved) return null
  return (
    <section className="lab-complete" aria-labelledby="complete-heading">
      <p className="eyebrow">LAB COMPLETE</p>
      <h2 id="complete-heading">You built a working network — twice.</h2>
      <p className="complete-lead">
        You connected a router, switch, and access point to bring a desktop and phone online. Then
        you did it again on your own and explained every device role.
      </p>
      <div className="complete-stats">
        <div className="stat">
          <span className="stat-value">2</span>
          <span className="stat-label">Networks built</span>
        </div>
        <div className="stat">
          <span className="stat-value">{guided.cables.length + challenge.cables.length}</span>
          <span className="stat-label">Cables connected</span>
        </div>
        <div className="stat">
          <span className="stat-value">{guided.hints + challenge.hints}</span>
          <span className="stat-label">Hints used</span>
        </div>
        <div className="stat">
          <span className="stat-value">3</span>
          <span className="stat-label">Device roles explained</span>
        </div>
      </div>
      <div className="complete-reflections">
        <h3>Your explanations</h3>
        <dl className="reflection-summary">
          <div>
            <dt>
              <Icon name="Router" /> Router
            </dt>
            <dd>{journey.reflections.router}</dd>
          </div>
          <div>
            <dt>
              <Icon name="Network" /> Switch
            </dt>
            <dd>{journey.reflections.switch}</dd>
          </div>
          <div>
            <dt>
              <Icon name="Wifi" /> Access point
            </dt>
            <dd>{journey.reflections.ap}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
