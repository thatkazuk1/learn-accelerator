# ADR 0001: Browser-Only TypeScript Workspace

Status: Accepted for the conventions refactor on 2026-10-13.

## Context

Homelab is a static browser game. It has no accounts, database, or server requests.
The operator requested the shared JS/TS conventions before public HTTPS deployment.
No local architecture ADR or agent guide existed at the start of this work.

## Decision

Use a pnpm workspace with `packages/core` and `apps/web`.
Core holds the networking rules, prediction rules, and save validation. It has zero runtime dependencies.
The web app uses React and Vite. It owns storage, DOM work, and offline registration.
Graphlib remains the graph engine. A small typed adapter supplies graph operations to pure core rules.
Do not add an unused NestJS API. Add one only when a server feature requires it.
Use NodeNext for core and Node tools. Use ESNext and Bundler resolution for the Vite app, as in the reference project.
Build core first. Keep the static web output in `apps/web/dist/`, owned by the web workspace.
Keep the existing save keys, save version, learning content, and gameplay behavior.

## Consequences

The app can still run offline after its first complete load.
The web bundle now includes React. Measure its transfer size before deployment.
Public hosting remains a separate task. No external service is required for this refactor.
Local saves are bound to an origin. A future public URL will not automatically receive localhost saves.
