# Homelab

A browser networking game for the Andela CodexAccelerator capstone.
Working title. The first playable level implements the build-and-connect
direction defined by the project owner.

## Run

Requires Node.js 20.12 or newer and pnpm 8.6.1. The version is pinned in `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. If its port is occupied, Vite selects
another one. No backend, account, API key, or external runtime asset is needed.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:browser
```

Browser tests use system Chrome on Linux if present, otherwise Playwright's
Chromium. Install the latter with `pnpm exec playwright install chromium`, or set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to a compatible local executable.
The test server uses port 5173; ensure an existing server there is this project.
Set `HOMELAB_TEST_PORT` to use another port. To verify the built application,
including offline reload, run:

```sh
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

## Play

Select a device from Equipment, then an empty rack slot. Select two free
Ethernet ports to cable them together. Join Lab-WiFi from the phone after
installing the access point. Run the connectivity check, inspect results,
and trace successful paths.

After both devices pass a connectivity check, a prediction exercise appears.
Choose a cable-removal experiment, predict which clients will retain internet
access, and test it against your actual network. The cable is removed from the
workbench and the result explains why. Reconnect restores the prior layout;
normal edits or Undo end the current experiment to avoid stale results.
Predictions are session-only; the resulting network layout is saved as usual.

Passing the first connectivity check with both clients online unlocks
"On your own". This second level rearranges the rack and clients, starts with
no cables, and hides the guided checklist. Hints and inspection remain
available. After connecting both clients, write a short explanation of each
device's role. Explanations are saved locally for review, not automatically
graded. The ten-character minimum checks only that an answer was entered.

The levels have separate saved layouts. Switching levels preserves progress,
but clears session-only undo history and experiments. Reset resets only the
current layout; saved explanations remain available. Explanation drafts are
saved while typing. The original level-one save key remains supported.

## Offline Play

```sh
pnpm build
pnpm preview
```

Offline support is enabled in the production build, not the development
server. Wait for "Ready for offline play" before disconnecting. Reloading,
both levels, prediction experiments, and local progress work without a
network after that initial download. External source links still need internet.

A build-generated service worker precaches the HTML and all bundled assets.
Cache versions are derived from file contents. Failed installation removes
the incomplete cache. Updates activate after tabs using the previous version
close, avoiding replacement halfway through play. Only this app's caches
are cleaned up. HTTPS or localhost is required; an HTTP LAN address does not
support service workers. Browser storage eviction can remove offline data.

## Deploy

The root `Dockerfile` builds the static site and serves it with unprivileged nginx on port `8080`.
Use the Dockerfile build pack. The deployment needs no runtime environment variables or persistent storage.
The public URL must use HTTPS so the offline service worker can register.

Implementation references:

- [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Vite: Plugin API](https://vite.dev/guide/api-plugin.html)

The intended solution is ISP to router WAN, router LAN to switch, and switch
to desktop and AP. All switch ports are equivalent. Direct router-to-desktop
connectivity is correctly accepted as a partial solution.

Remove cables through Connections. Remove devices through the inspector.
Undo restores the most recent change, including a reset. Escape cancels a
pending cable or placement. Controls are native keyboard-accessible buttons
and a Wi-Fi selector; dragging is not required.

Progress stays in localStorage on this browser and origin. No learner data is
sent to a server. Reset clears the current saved layout. Undo history lasts
only for the current page session.

## Architecture

- `packages/core/src/`: pure network rules, prediction rules, and saved-state validation.
- `apps/web/src/network.ts`: Graphlib adapter for the core evaluator.
- `apps/web/src/game.ts`: typed interaction state and actions.
- `apps/web/src/App.tsx` and `components/`: React workbench, status, and learning panels.
- `apps/web/src/styles/`: responsive hardware illustrations, design tokens, and UI styles.
- `apps/web/vite.config.ts`: production build and offline cache generation.
- `apps/web/tests/playwright.config.ts`: browser test server and launch settings.
- `apps/web/tests/network.test.ts`: networking behavior and state-integrity tests.
- `apps/web/tests/browser/game.spec.ts`: desktop/mobile play, keyboard interactions,
  persistence, undo, and screenshots.

The application uses a pnpm workspace, strict TypeScript, React, Vite, Lucide icons, and Graphlib.
Core has no runtime dependencies. The web app owns all browser I/O. There is no API.
Root commands build core before its consumers. `pnpm build` produces the static site in `apps/web/dist/`.
Hardware illustrations are local HTML/CSS, and cables are SVG. The production
build contains no remote fonts, images, or scripts.

See [CONTRIBUTING.md](CONTRIBUTING.md) for code rules and checks.
See [the AI workflow guide](docs/AI_WORKFLOW.md) for Codex, OpenCode, and Claude Code handoffs.

## Simulation Boundaries

This is a connectivity model, not a real network emulator. Power, routing,
NAT, WAN service, DHCP configuration, and Wi-Fi credentials are preconfigured.
Router LAN and WAN remain separate graph endpoints. Switch and AP forwarding
are modeled explicitly. An address is considered available only with a valid
LAN path, and is recomputed immediately after topology changes.

Protocol exchanges, DNS, actual leases, firewall behavior, radio propagation,
and detailed NAT are omitted. The trace shows a conceptual outbound path.
Sources and these assumptions are also available in the game's reference area.

## Remaining MVP Work

- Public HTTPS deployment and checks on the real host.
- Learner pilot and improvements based on observed confusion.
- Translation support and a fuller accessibility audit.
- Additional browser/device coverage and offline cache-update testing.

See [the project brief](docs/PROJECT_BRIEF.md), [level design](docs/LEVEL_ONE.md), and
[development log](docs/DEVELOPMENT_LOG.md).

## Demo Preparation

Use [the presentation script](docs/DEMO_SCRIPT.md) for a three-minute walkthrough
and [demo hosting notes](docs/DEMO_README.md) when serving the compiled build.
The game has not been published publicly. Keep the learner pilot separate
from presentation rehearsal: a working demo alone does not establish learning.

If local storage is blocked, both level layouts remain available during the
current page session. Reloading loses that session; the interface reports
that saving is unavailable.
