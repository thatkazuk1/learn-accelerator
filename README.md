# netwright

Build a network. Break it safely. Understand why it works.

## Table of Contents

- [About the Project](#about-the-project)
- [Project Status](#project-status)
- [Features](#features)
- [Learning Journey](#learning-journey)
- [Architecture](#architecture)
- [Known Limitations](#known-limitations)
- [Future Direction](#future-direction)
- [Getting Started](#getting-started)
  - [Dependencies](#dependencies)
  - [Technology Stack](#technology-stack)
  - [Third-party Services](#third-party-services)
- [Installation & Development](#installation--development)
- [How to Get Help](#how-to-get-help)
- [Contributing](#contributing)
- [Authors](#authors)
  - [Repo Activity](#repo-activity)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## About the Project

Netwright is a browser game that teaches networking fundamentals through a small virtual rack. Learners place equipment, connect Ethernet ports,
join a wireless client, inspect traffic paths, predict failures, diagnose faults, and explain why their network works.

This is an **Andela CodexAccelerator learning project**. It addresses the **Engagement & Staying in the Learning Journey** track and also
responds to access constraints through a small, offline-capable browser experience.

The idea came from a personal gap. I run and maintain a homelab, but some networking fundamentals were not yet secure. Reading another device
definition was not enough. I wanted a way to construct a network, make a mistake, observe the result, and repair it without risking real equipment.

Most introductory tools explain networking or test recall. Netwright uses a build, predict, break, diagnose, repair, and explain loop. The
simulation evaluates device roles and router LAN/WAN boundaries, so a drawing does not pass only because every node is connected.

A hosted instance is running at **<https://netwright.kazuki.uk>**. It needs no account. Progress and written explanations stay in the learner's browser.

## Project Status

The capstone proof of concept is complete and publicly deployed. The current build contains five progressive missions, local progress, responsive
controls, and offline access after the first successful load.

The verified submission build passes strict TypeScript checks, 12 domain tests, and 13 production browser scenarios. The production bundle is
approximately 304 KB before transport compression.

The application is actively maintained for the submission period. `master` is the production branch and deploys through my self-hosted Coolify instance.

## Features

- Role-aware network simulation with distinct router WAN and LAN boundaries.
- Rack placement and labelled Ethernet-port connections.
- Separate wired connectivity and Wi-Fi association.
- Diagnostics that identify relevant faults instead of requiring random guesses.
- Conceptual client-to-internet path traces.
- Predict-then-test cable-removal experiments.
- Progressive hints with no score penalty.
- Undo, reconnect, and reset actions for safe experimentation.
- Local player profile, mission progress, and written reflections.
- Five-mission dashboard with locked, available, and completed states.
- Responsive pointer, touch, and keyboard controls.
- Reduced-motion behavior and text labels for important states.
- Content-versioned offline cache with safe update and failure handling.
- No external runtime fonts, images, scripts, APIs, or account service.

## Learning Journey

1. **First connection** - Place a router, switch, and access point. Cable both clients and connect the phone to Wi-Fi.
2. **On your own** - Apply the same ideas to a fresh layout, then explain each device role.
3. **The broken link** - Diagnose a network with the router LAN and WAN cables reversed.
4. **Choose your gear** - Select the correct devices from a router, switch, access point, hub, and repeater.
5. **Expand the lab** - Add another switch and extend the local network.

The first mission also asks learners to predict what will happen when the access-point uplink, router WAN, or desktop cable is removed. The result
separates physical connection, Wi-Fi association, local-network access, and internet access.

## Architecture

Netwright is a pnpm workspace with a strict boundary between simulation rules and browser I/O.

```text
packages/
`-- core/       Pure TypeScript. Missions, network rules, predictions, models, and save validation.
apps/
`-- web/        Vite + React. Game interface, Graphlib adapter, local storage, offline support, and tests.
```

- `packages/core/src/mission.ts` defines mission goals, hints, unlock order, and initial states.
- `packages/core/src/connectivity.ts` evaluates connectivity and produces diagnostic feedback.
- `packages/core/src/prediction.ts` applies reversible experiments and explains their outcomes.
- `packages/core/src/journey.ts` validates saved profiles and progress.
- `apps/web/src/network.ts` adapts Graphlib traversal to the pure core evaluator.
- `apps/web/vite.config.ts` generates the production bundle and offline service worker.
- `apps/web/tests/` owns test configuration, domain tests, browser scenarios, and test artifacts.

The core package has no runtime dependencies or browser I/O. The web package owns all browser state and generated web artifacts. This keeps the
network rules testable without rendering the interface.

## Known Limitations

This is a focused learning simulation, not a packet-level network emulator.

- Power, routing, NAT, DHCP, and Wi-Fi credentials are preconfigured.
- DNS, firewall rules, radio range, protocol exchanges, packet timing, and real DHCP leases are not simulated.
- Connectivity is recomputed immediately after a topology change.
- Progress belongs to one browser and origin. Clearing browser storage removes it.
- The submitted interface and learning content are in English.
- External source links require internet access even when the game itself is available offline.
- Cloudflare currently gives `sw.js` a four-hour browser cache lifetime, which can delay update checks after a deployment.

The interface identifies the simulation boundary and links to technical sources. The full claim review is in [docs/CONTENT_REVIEW.md](docs/CONTENT_REVIEW.md).

## Future Direction

The long-term ambition is to grow Netwright into a systems-learning sandbox with the depth and sense of discovery that made Kerbal Space Program compelling.
Instead of following only fixed lessons, learners could design increasingly complex networks, operate virtual infrastructure, observe failures, and
develop an intuition for how complete systems behave. A progression from a bedroom homelab to small-business, campus, data-centre, and service-provider
scenarios could connect basic device roles to routing, addressing, security, reliability, and operations.

This direction also expands the project beyond its current 2D rack. Open-source tools such as Blender can provide equipment, environments, and animation
assets for a richer simulated world. Codex will remain part of my production workflow. I will direct the product, learning design, engineering, and art
decisions while using Codex to help plan systems, implement features, automate Blender and asset pipelines, verify behavior, and coordinate other open-source
tools. The goal is not to generate a finished world from one prompt, but to use agent-assisted, testable iterations to build something ambitious over time.

## Getting Started

### Dependencies

To run Netwright locally:

- **git** - clone the repository and work with branches.
- **Node.js 20.12 or newer** - the minimum version declared by the workspace.
- **pnpm 8.6.1** - pinned in `package.json`.
- **A Chromium-based browser** - system Chrome or Playwright Chromium for browser tests.
- **Docker** - optional; required only to build and verify the production container.

### Technology Stack

- **TypeScript** - strict application and test code.
- **React + Vite** - browser interface and production bundle.
- **Graphlib** - graph traversal behind the network adapter.
- **Lucide React** - interface icons.
- **Playwright** - desktop, mobile, accessibility, persistence, and offline browser scenarios.
- **Node test runner + tsx** - domain-level network tests.
- **ESLint + Prettier** - static analysis and formatting.
- **pnpm workspaces** - package and application boundaries.
- **nginx** - unprivileged static runtime for deployment.

### Third-party Services

- **GitHub** - canonical source repository and pull-request history.
- **Coolify** - builds and hosts the production container from Git.
- **Cloudflare** - DNS and edge proxy for `learn.kazuki.uk`.

The game itself does not call a third-party service at runtime.

## Installation & Development

```bash
git clone https://github.com/thatkazuk1/learn-accelerator.git
cd learn-accelerator
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite.

Run the complete validation gate:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

For an offline production preview:

```bash
pnpm build
pnpm preview
```

Wait for **Ready for offline play** before disconnecting. HTTPS or localhost is required for service workers.

The root `Dockerfile` builds `apps/web/dist/` and serves it through unprivileged nginx on port `8080`. The runtime needs no environment variables,
database, or persistent volume.

## How to Get Help

Open an [issue](https://github.com/thatkazuk1/learn-accelerator/issues) for bugs, questions, or feature requests. This is a solo learning project
with no dedicated support channel or service-level agreement.

Useful project records:

- [Submission brief and rubric evidence](docs/SUBMISSION.md)
- [Public agent instructions](AGENTS.md)
- [Three-minute demo script](docs/DEMO_SCRIPT.md)
- [Project brief](docs/PROJECT_BRIEF.md)
- [Development log](docs/DEVELOPMENT_LOG.md)
- [How I used Codex](docs/CODEX_USAGE.md)
- [AI development workflow](docs/AI_WORKFLOW.md)

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch model, Conventional Commits rules, code style, and validation commands.

Keep simulation rules in `packages/core`, browser I/O in `apps/web`, and generated artifacts with the package or test concern that owns them. New technical
claims need a credible source, and new interactions must support keyboard and touch input.

**[Back to top](#table-of-contents)**

## Authors

**Desmond Edem** ([@thatkazuk1](https://github.com/thatkazuk1)) - project creator and sole maintainer.

### Repo Activity

This project was developed during the Andela CodexAccelerator learning program. Git branches, short Conventional Commits, pull requests, decision records,
handoffs, and reports preserve the major iterations.

## License

No open-source license is currently included. Copyright remains with the project author.

## Acknowledgements

- **Andela CodexAccelerator** - the learning program and capstone context for this project.
- **Codex** - implementation, testing, debugging, documentation, and deployment support. I retained responsibility for the idea, learning goals, and product decisions.
- **Cisco networking references and RFC 2131** - source material used to review technical claims.
- **The homelab community** - inspiration for making networking infrastructure visible and understandable.
