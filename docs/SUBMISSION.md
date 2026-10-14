# Netwright Submission Brief

## Links

- Live application: [learn.kazuki.uk](https://learn.kazuki.uk)
- Source repository: [github.com/thatkazuk1/learn-accelerator](https://github.com/thatkazuk1/learn-accelerator)
- Codex evidence: [How I Used Codex](CODEX_USAGE.md)
- Demo script: [Three-Minute Demo](DEMO_SCRIPT.md)

## One-Sentence Description

Netwright is an offline-capable browser game where learners build, break, diagnose, and expand a
virtual computer network to understand what routers, switches, and access points actually do.

## Short Description

Netwright teaches networking fundamentals through a virtual equipment rack instead of a quiz. Across
five progressive missions, learners connect wired and wireless clients, predict failures, repair
incorrect WAN and LAN links, choose suitable devices, and expand a local network. It requires no
account or backend, saves progress locally, supports keyboard and mobile input, and works offline
after its first small download.

## Full Project Description

Access to a networking course does not guarantee that a learner develops an accurate mental model.
Device definitions can remain abstract, and a learner can memorize terms without understanding why
a network works or what a failed connection means.

Netwright turns those concepts into a hands-on browser game. The learner works with a router, switches,
an access point, an ISP handoff, a desktop, and a phone. The simulation evaluates device roles and
router LAN/WAN boundaries instead of accepting any connected drawing. Diagnostics explain relevant
faults, and a conceptual path trace shows how each client reaches the learning server.

The five-mission journey moves from guided construction to independent work, troubleshooting,
device selection, and network expansion. Predict-then-test experiments ask the learner to commit to
an outcome before a cable is removed. The independent mission also asks learners to explain each
device role in their own words. There is no timer, lost-life mechanic, or penalty for using hints.

Netwright is designed for realistic access constraints. The static production build is approximately
304 KB before transport compression, has no external runtime assets or application backend, and
works offline after the first successful load. Progress remains in the learner's browser, so no
account or personal academic record is required.

## Future Direction

The long-term goal is a systems-learning sandbox with the depth and experimental progression that
made Kerbal Space Program compelling. Learners could advance from a bedroom homelab to
small-business, campus, data-centre, and service-provider environments while studying routing,
addressing, security, reliability, and operations. Blender and other open-source tools can provide a
richer equipment and environment pipeline. I will direct the product, learning, and art decisions
while using Codex to plan and implement features, automate asset production, verify behavior, and
coordinate the toolchain through small, testable iterations.

## Rubric Evidence

### Uniqueness

- Uses a build, predict, break, diagnose, repair, and explain loop instead of a conventional quiz.
- Separates Wi-Fi association from internet connectivity through an interactive failure experiment.
- Accepts valid alternative topologies while enforcing device roles and LAN/WAN boundaries.
- Makes mistakes reversible and removes timers and hint penalties.

### Scalability

- Static deployment with no database, API, account service, or persistent server state.
- Approximately 304 KB production bundle before transport compression.
- Offline access to all five missions after the first successful load.
- Local progress and privacy-preserving written reflections.
- Responsive pointer, touch, and keyboard operation.
- Data-driven mission definitions make new scenarios possible without a new application architecture.

The submitted build is in English. Locale extraction and a complete French translation are sensible
future steps, but multilingual support is not claimed in this submission.

### Codex Usage

- Codex supported scoping, architecture, implementation, refactoring, tests, debugging,
  documentation, and deployment preparation.
- I supplied the original idea, learning goals, product decisions, and repository standards.
- Handoffs and reports connect each task to acceptance criteria and validation evidence.
- Codex-assisted checks found real focus, accessible-name, storage, offline-cache, and
  service-worker-update problems.
- The final build passes strict TypeScript checks, 12 domain tests, and 13 production browser
  scenarios.

### Presentation

- Public HTTPS demo with a welcome flow and five-mission dashboard.
- Three-minute script demonstrates a failure, repair, prediction, later missions, offline access, and
  Codex evidence.
- Source-backed technical claims and explicit simulation limits build trust.
- The repository contains a project brief, development log, architecture records, deployment report,
  and Codex-usage narrative.

## Honest Boundaries

- Netwright is a connectivity model, not a packet-level network emulator.
- The submission does not claim a learner study or measured learning improvement.
- The submission does not claim multilingual support.
- Browser storage can be cleared by the learner or browser.
- External source links require internet access.

## Final Video Checklist

- Show the public URL.
- Show all five missions on the dashboard.
- Demonstrate one incorrect connection and its diagnostic response.
- Make a prediction before running the cable-removal experiment.
- Demonstrate offline reload.
- Show Codex evidence and a passing test summary.
- Add captions and keep the video within the submission time limit.
