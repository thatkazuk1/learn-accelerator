# Handoff 06 — Welcome screen and mission dashboard

- **Executor:** Codex
- **Read first:** `AGENTS.md`, `docs/adrs/decisions/0001-architecture.md`, this file
- **Language:** ASD-STE100 Simplified Technical English
- **Scope:** Add a welcome/profile screen and a mission dashboard as the landing page
- **Do not:** commit to master directly, add runtime dependencies to core, break the 12 existing browser tests, change the 3 existing localStorage key shapes

## 0. Why

The game has 5 missions but no entry point. A new visitor sees the guided mission immediately with no context. We need a welcome screen that collects a player name and a mission dashboard that shows progress.

## 1. Branch

Create and work on branch `feat/welcome-dashboard`. Base it on current `master` (commit `927d5d3`).

## 2. Current state

The multi-mission system is complete on master:

- `packages/core/src/mission.ts` — `MissionId`, `Mission` interface, `missions` array (5 entries), `missionMap`
- `packages/core/src/journey.ts` — `Journey` has `activeMission: MissionId` and `completed: Partial<Record<MissionId, true>>`
- `apps/web/src/game.ts` — `Game.states: Record<MissionId, NetworkState>`, actions include `{ type: 'mission'; id: MissionId }`
- `apps/web/src/components/Briefing.tsx` — per-mission briefing overlay with localStorage dismiss keys
- All 12 browser tests and 12 unit tests pass
- All gates pass: `pnpm format && pnpm typecheck && pnpm lint && pnpm test`

## 3. Tasks

### 3.1 Player name (localStorage)

- Add `homelab.player.v1` localStorage key.
- Store `{ name: string }`.
- Add a `playerKey` constant and `restorePlayer` / `freshPlayer` functions to `packages/core/src/journey.ts`.
- Read and restore in `loadGame()`.

### 3.2 Welcome screen component

Create `apps/web/src/components/Welcome.tsx`:

- Full-page overlay (like the Briefing component pattern).
- Shows the homelab brand mark and a heading: "Welcome to your homelab."
- A single text input for the player's name (required, min 2 characters).
- A "Start" button that saves the name and dismisses the screen.
- On return visits, this screen does not show (check localStorage).
- Handle storage errors the same way Briefing does (try/catch, degrade).

### 3.3 Mission dashboard component

Create `apps/web/src/components/Dashboard.tsx`:

- Shows after the welcome screen, before any mission starts.
- Displays the player's name as a greeting: "Welcome back, {name}."
- Lists all 5 missions as cards in a vertical stack:
  - Mission number, title, subtitle
  - Lock icon if locked, checkmark if completed, arrow if available
  - The first unlocked-and-incomplete mission is highlighted
- Each card is a button that dispatches `{ type: 'mission'; id }`.
- Locked missions show which mission must be completed first.

### 3.4 App.tsx integration

- The app starts on the dashboard view, not directly in a mission.
- Add a `view` state: `'dashboard' | 'mission'`.
- The dashboard is the default. When the player selects a mission, switch to `'mission'` view.
- Add a back button in the topbar that returns to the dashboard.
- The per-mission Briefing shows after selecting a mission, before gameplay.

### 3.5 CSS

- Add styles in `apps/web/src/styles/style.css` for Welcome and Dashboard.
- Use the existing color tokens from `tokens.css`.
- Mobile responsive at 560px and 320px breakpoints.
- No page entrance animations or motion libraries (per AGENTS.md).

### 3.6 Tests

- Update the `beforeEach` in `game.spec.ts` to set `homelab.player.v1` so the welcome screen does not block tests.
- Keep all 12 existing browser tests passing.
- Add 1 test: "welcome screen collects name and shows dashboard".

## 4. Validation

Run these commands at the repo root before you finish:

```sh
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

All must pass.

## 5. Key files to read

- `packages/core/src/mission.ts` — mission definitions
- `packages/core/src/journey.ts` — journey state, localStorage keys
- `apps/web/src/game.ts` — Game interface, loadGame, reduceGame
- `apps/web/src/App.tsx` — current app shell
- `apps/web/src/components/Briefing.tsx` — pattern for localStorage-gated overlays
- `apps/web/src/styles/tokens.css` — color tokens
- `apps/web/tests/browser/game.spec.ts` — existing test suite

## 6. Constraints

- Keep `packages/core` free of runtime dependencies and I/O.
- Use `@/` imports in the web app. Import shared types from `@homelab/core`.
- Use color tokens, Lucide icons, 0.96 button press scale, 150ms ease-out transitions.
- Do not add image downloads. Keep all art code-native.
- Validate unknown data at external boundaries. Trust typed code within those boundaries.
