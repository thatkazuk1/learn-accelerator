# Development Log

## 2026-10-01 - First playable level

### Human direction

I proposed a browser game for networking fundamentals based on my own homelab
experience. I chose build-and-connect gameplay, a tiny
rack, IT students and above, and a solo two-month hackathon scope. They approved
the first-level specification before implementation.

### Codex contribution

Implemented a lightweight browser workbench with rack placement, Ethernet
connections, wireless association, device inspection, connectivity checks,
conceptual route traces, local saves, undo, reset, and progressive hints.
Used Graphlib for traversal and explicit rules for network roles rather than
assuming that a connected drawing is a valid routed network.

Kept hardware assets local and imported only the icons the game uses. This
reduced the production JavaScript from about 626 KB to 42 KB before compression.

### Corrections during verification

- Fixed CommonJS interoperability for Graphlib in Node tests.
- Preserved Wi-Fi selector focus after rerender for keyboard interaction.
- Disabled animation during screenshot capture to inspect complete traces.
- Distinguished association, local configuration, and internet reachability.

### Verification evidence

- Nine domain tests cover successful networks, equivalent switch ports,
  valid partial solutions, disconnected AP/WAN links, swapped router ports,
  missing routing, invalid connections, and saved-state validation.
- Browser tests cover full desktop play, failure feedback, undo, reload,
  reset, keyboard activation, mobile width, and reduced motion.
- Production bundle builds successfully.
- Desktop and mobile screenshots are generated under `apps/web/tests/test-results/`.

These are functional checks, not evidence of learning effectiveness. No learner
pilot has occurred. Offline reload and the independent variation remain open.

## 2026-10-01 - Prediction experiments

I played the first level and confirmed that it worked well, then authorized
the next step. Added three experiments after successful
connectivity checks: remove the AP uplink, router WAN, or desktop cable.
Players commit to a prediction before the game applies the disconnection.
Feedback compares the prediction with the simulation and explains the device
roles involved. Reconnect and Undo support recovery without rebuilding.

Results are derived from the same network evaluator as normal play. The
original topology is copied before an experiment, and subsequent manual edits
clear its result so the explanation cannot become stale. No external services,
new dependencies, or learner analytics were added. Prediction answers remain
session-only; topology persistence continues unchanged.

Prepared and tested in a temporary copy because the project had moved from
the chat's configured directory to `shokunbi/homelab-weave`. Applying changes
to that location requires the chat's filesystem approval.

## 2026-10-01 - Independent challenge and offline play

Added an independent second layout after the first successful connectivity
check. Rack and client positions change; hints remain optional. Each level
keeps its own saved topology. Learners explain the three device roles after
connecting the second network. These responses are local review material,
not automatically assessed learning outcomes.

Added a content-versioned production service worker. It precaches all bundled
assets and the entry page, handles offline navigation, and waits for old tabs
to close before activating updates. The browser reports offline readiness
only after installation. Development mode does not install a service worker.

Verification found and corrected an accessible-name issue on level navigation
and an offline asset-cache mismatch caused by the preview server's Vary: Origin
header. Static build assets now ignore that header during cache lookup.

All 12 domain tests and six production-browser scenarios pass, including
offline reload, completing the independent challenge while disconnected,
separate level saves, explanation persistence, desktop/mobile layouts,
prediction recovery, and keyboard operation. Visual checks used generated
desktop and mobile screenshots. No learner pilot has occurred yet.

## 2026-10-02 - Demo readiness

Audited the current learning flow before expanding lesson content. Fixed
keyboard focus after selecting, placing, and removing equipment, and kept
Escape from interrupting reflection text entry when nothing is being cancelled.

Added in-memory level saves so learners with blocked browser storage can
switch levels without losing work during that session. Storage failures now
remain explicit in reflection feedback after rerenders. This does not make
session data survive reloads when storage is unavailable.

Added regression scenarios for these cases, plus a three-minute presentation
script and static-demo hosting notes. No public deployment or learner pilot
is implied by preparing a demo bundle.

Verification: all eight production-browser scenarios passed, including the
two new regressions, and the 12 existing domain checks passed. The production
build remains self-contained and offline-capable after its initial download.

## 2026-10-13 - Shared JS/TS Conventions

I requested my shared JS/TS conventions before public HTTPS deployment.
Converted the app to a pnpm workspace with strict TypeScript, a pure core package,
and a React web app. Graphlib remains the graph engine in a web adapter.
No API was added because the game has no server feature.

Added ESLint, Prettier, typed test configuration, contribution rules, and private
agent context. Moved UI colors into tokens and preserved the approved rack design.
The original save keys and version-one shapes remain unchanged. The existing
domain and browser scenarios were ported to TypeScript. A browser regression
checks old saves and text that contains HTML syntax.

This refactor does not publish the game. Public hosting and learner validation
remain separate tasks.

## 2026-10-14 - Five-Mission Journey And Public Submission

Adopted **Netwright** as the public game name. The name gives the learner an identity: a person who
builds, tests, repairs, and understands networks. Internal package names, environment variables,
cache prefixes, and storage keys remain unchanged to preserve tooling and saved progress.

Expanded the original guided and independent labs into five progressive missions. The new missions
ask learners to repair reversed router connections, choose the correct devices from plausible
alternatives, and extend the local network with another switch. Mission definitions, goals, hints,
unlock rules, and initial states are data-driven in the core package.

Added mission briefings, completion tracking, a local player name, a welcome screen, and a dashboard
that shows available, locked, and completed missions. The dashboard gives the game a clear entry
point and makes the learning journey visible without adding accounts or server storage.

Published the static Docker image through my self-hosted Coolify instance at
`https://learn.kazuki.uk`. The application remains independent of a backend and external runtime
assets.

Submission verification passed strict TypeScript checks, linting, 12 domain tests, the production
build, and 13 production browser scenarios. The browser suite covers the welcome flow, existing-save
compatibility, mobile and keyboard play, control names and target sizes, blocked storage, offline
reload, and successful and failed service-worker updates. The built site is approximately 304 KB
before transport compression.

Prepared updated submission documentation, a three-minute recording script, and a detailed account
of how Codex supported the project while I retained the idea and product decisions. No
learner-study result or multilingual feature is claimed.
