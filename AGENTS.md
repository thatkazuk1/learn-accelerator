# Netwright Project Guide

Read this file, `docs/adrs/decisions/0001-architecture.md`, and the active numbered handoff before you change code.
Use ASD-STE100 Simplified Technical English for reports, comments, and new user-facing text.

## Skills

Read `.agents/skills/anti-slop-typescript/SKILL.md` for all JS/TS work.
For UI work, also read `.agents/skills/better-ui/SKILL.md` and all six linked reference files.
Keep the skill folders unchanged. Put project overrides in this file.

## Architecture

- Use pnpm and Node 20.12 or later. Keep `.nvmrc` and `packageManager` current.
- `packages/core` contains pure TypeScript rules and save validation. It has no runtime dependencies or I/O.
- `apps/web` contains the React UI, Graphlib adapter, browser storage, and service worker registration.
- Do not add an API until a feature needs a server. Use NestJS if that need occurs.
- Use strict TypeScript. The core and Node tools use NodeNext. Vite uses ESNext and Bundler resolution.
- Use `@/` for imports within the web app. Import shared rules from `@homelab/core`.
- Read environment values in `config()` only. New variables need a Config field, default, validation, and `.env.example` entry.
- Keep derived connectivity and prediction results out of saved state.
- Keep existing localStorage keys and their version-1 data shapes unchanged.
- Validate unknown data at external boundaries. Trust typed application code within those boundaries.

## UI Overrides

Preserve the approved rack layout, visual density, hardware drawings, and green/neutral palette during this refactor.
Hardware borders and shadows show device parts; they are not floating panel decorations.
The staged route trace explains path order. Keep this animation and its reduced-motion alternative.
Cable port buttons stay static on press because the cable endpoints must not move.
Status icons change immediately during repeated network actions. Keep text and color cues visible.
The existing brand mark and hardware art remain code-native. Do not add image downloads to this offline game.
Use color tokens, Lucide icons, 0.96 button press scale, and 150ms ease-out press transitions.
Do not add page entrance animations or a motion library.

## Tests And Gates

This project permits focused new tests. The sure-school no-new-tests rule does not apply here.
Keep all existing gameplay scenarios. Run these commands at the root:

```sh
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

Review every new helper, cast, branch, and fallback against anti-slop-typescript.
For UI work, include the better-ui findings table and mark checks that were not verified.

## Agent Context

Keep `AGENTS.md`, `CLAUDE.md`, `.agents/`, and `.codex/` in Git as public evidence of the agent setup used for this learning project.
Keep all agent files out of the Docker context and production image.
`CLAUDE.md` contains only `@AGENTS.md`.
Put Git-tracked handoffs in `docs/adrs/handoff/`, decisions in `docs/adrs/decisions/`, and reports in `docs/adrs/report/`.
Keep `.claude/adrs/` as private local agent context when a tool needs it.
Use the required handoff header: Executor, Read first, Language, Scope, Do not, then sections starting with `0. Why`.
Never read `.claude/test-credentials.md`, secret values, or credential stores. Inspect environment variable names only.

## Change Control

Do not commit, push, initialize Git, or deploy without a user request.
Use Conventional Commits for commit messages and `<type>/<short-description>` for branch names.
Keep commit subjects short, specific, and imperative, for example `feat: add Coolify image`.
Do not write essay-style subjects or wordy commit bodies. Add a brief body only when it records necessary context.
Do not add attribution trailers or change signing settings.
Check the actual code before following old handoffs. This guide controls project-specific layout.
Keep unrelated user changes. Update docs and build paths when files move.
