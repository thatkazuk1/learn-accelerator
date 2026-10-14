# How We Used Codex

## Project Ownership

The project owner chose the problem, audience, and product direction. The idea came from a personal
need: even with experience running a homelab, some networking fundamentals were not yet secure.
The owner proposed a browser game in which learners build and connect a small homelab rack. Codex
did not generate the capstone idea.

Codex was the primary software-development assistant. It helped turn the owner's direction into a
working proof of concept, test the result, document decisions, and prepare the project for public
deployment and submission. The owner reviewed the game throughout development, played each major
iteration, changed priorities, and corrected implementation and repository decisions.

## Development Process

The work used short, verified iterations instead of one large generated application.

| Stage | Human direction | Codex contribution | Evidence |
| ----- | --------------- | ------------------ | -------- |
| Scope | Build a browser game for IT learners. Start with a tiny homelab rack and basic devices. | Converted the direction into a bounded MVP with explicit learning outcomes and simulation limits. | `docs/PROJECT_BRIEF.md`, `docs/LEVEL_ONE.md` |
| First playable lab | Let learners place a router, switch, and access point, then connect wired and wireless clients. | Implemented the interaction model, network evaluator, diagnostics, hints, route trace, undo, reset, keyboard controls, and local saves. | `packages/core/src/`, `apps/web/src/`, `docs/DEVELOPMENT_LOG.md` |
| Learning loop | Go beyond content delivery and make learners reason about the network. | Added predict-then-test disconnection experiments, an independent challenge, and written device-role explanations. | `packages/core/src/prediction.ts`, `apps/web/src/components/PredictionPanel.tsx`, `apps/web/src/components/Reflection.tsx` |
| Access constraints | Keep the game useful with limited connectivity and basic devices. | Added a content-versioned service worker, local assets, offline reload, mobile layouts, local progress, and storage-failure handling. | `apps/web/vite.config.ts`, `apps/web/src/offline.ts`, browser tests |
| Technical credibility | Do not teach inaccurate networking rules. | Separated the pure network model from browser I/O, added explicit LAN/WAN and device-role rules, documented simulation boundaries, and reviewed claims against primary sources. | `packages/core/src/connectivity.ts`, `docs/CONTENT_REVIEW.md` |
| Project structure | Apply the owner's normal JavaScript and TypeScript conventions. | Refactored the project into a strict TypeScript pnpm workspace with a pure core package and React web application. Added linting, formatting, typed configuration, and validation at storage boundaries. | `docs/adrs/report/01-js-ts-conventions.md`, `packages/core/`, `apps/web/` |
| Deployment | Prepare the static application for the owner's self-hosted Coolify instance. | Added a pinned multi-stage Docker build, unprivileged nginx, cache policy, health check, security headers, and local container verification. | `Dockerfile`, `nginx.conf`, `docs/adrs/report/03-coolify-deployment.md` |
| Expanded journey | Turn the first exercise into a visible learning path. | Helped implement five progressive missions, mission briefings, completion state, a welcome flow, and a mission dashboard. | `packages/core/src/mission.ts`, `apps/web/src/components/Briefing.tsx`, `apps/web/src/components/Dashboard.tsx` |

## Human Corrections And Decisions

The owner did not accept generated output without review. Important corrections included:

- Keep the owner's original capstone idea and use AI only to develop it.
- Use `master` as the primary branch name.
- Use Conventional Commits and short commit messages.
- Apply the owner's shared JavaScript and TypeScript conventions.
- Keep generated artifacts with the package and concern that owns them. The web build moved to
  `apps/web/dist/`. Playwright configuration, environment examples, results, screenshots, and reports
  moved under `apps/web/tests/`.
- Keep a clear boundary between the pure networking package and browser-specific code.
- Do not add a backend, accounts, an AI tutor, or other features that weaken the focused proof of
  concept.

These corrections are part of the Codex usage story: the owner supplied judgment and constraints,
while Codex performed implementation, migration, search, and verification work.

## Verification With Codex

Codex did more than generate source files. It repeatedly ran the project and used failures as input
for the next change. The verification process found and corrected problems such as:

- CommonJS interoperability with the graph library in Node tests.
- Keyboard focus loss after interface rerenders.
- An accessible-name problem in mission navigation.
- An offline cache miss caused by the preview server's `Vary: Origin` header.
- Unsafe assumptions about blocked browser storage.
- Service-worker update behavior across open tabs.
- Build and test artifacts leaking into the repository root instead of their owning workspace.

The current local verification includes:

- Strict TypeScript checks.
- ESLint and Prettier checks.
- 12 domain tests for network behavior and saved-state validation.
- 13 production browser scenarios for gameplay, mobile layout, keyboard use, accessibility, offline
  reload, and service-worker update failure.
- A production bundle of approximately 304 KB before transport compression.
- A locally verified unprivileged nginx container with cache and security headers.

The public application is available at [learn.kazuki.uk](https://learn.kazuki.uk).

## Collaboration Records

The repository keeps concise evidence of the AI-assisted process:

- `docs/DEVELOPMENT_LOG.md` records major iterations, corrections, and verification results.
- `docs/adrs/decisions/` records architecture decisions.
- `docs/adrs/handoff/` defines scoped tasks and acceptance criteria before implementation.
- `docs/adrs/report/` records what changed, what passed, and what remained open.
- `docs/AI_WORKFLOW.md` defines ownership, handoff, review, and recovery rules for AI tools.
- Git branches, Conventional Commits, and pull requests preserve implementation milestones.

This evidence is intentionally more useful than a raw transcript. It connects human decisions,
Codex actions, code changes, and test results.

## Result

Codex accelerated architecture, implementation, testing, debugging, documentation, and deployment
preparation. The owner remained responsible for the idea, learning goals, product decisions, visual
approval, repository conventions, and final submission. The result is not a generated demo screen;
it is a tested learning game that learners can build, break, diagnose, and use offline in a browser.
