# Handoff 01: JS/TS Conventions

> **Executor:** Codex CLI
> **Read first:** AGENTS.md (all of it), the skills, related handoffs
> **Language:** ASD-STE100 for all text
> **Scope:** Root tooling, apps/web, packages/core, tests, docs, and private agent context
> **Do not:** Deploy, add an unused API, change save formats, read secrets, commit, or push

## 0. Why

Apply the operator's shared conventions before the Public HTTPS deployment task.
Preserve the approved game and all existing test scenarios.

## 1. Refactor

Use pnpm, strict TypeScript, React, and a dependency-free core package.
Keep Graphlib in the web adapter. Keep browser I/O out of core.
Move colors into CSS tokens. Preserve the approved layout and accessible controls.
Add the private guide and unmodified skill folders. Exclude them from Git and Docker.

## 2. Verify

Run format, typecheck, lint, unit tests, build, and production browser tests.
Check saved progress, blocked storage, keyboard focus, mobile layout, and offline play.
Inspect the anti-slop review gate and report better-ui findings.
Record missing inputs and checks that could not run. Do not claim deployment.
