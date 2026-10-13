# Report 01: JS/TS Conventions

The refactor is complete in the verification copy. Deployment has not started.

## Changes

- Added a pnpm workspace, Node pin, strict TypeScript, ESLint 9, and Prettier.
- Moved pure rules into `packages/core`, with zero runtime dependencies and no browser I/O.
- Converted the UI to React in `apps/web`. Graphlib remains the graph engine in the web adapter.
- Kept local save keys and version-one data shapes. Prediction results remain derived values.
- Kept the approved rack layout. Moved colors into tokens and added the required press feedback.
- Ported all 12 domain scenarios and all eight existing browser scenarios to TypeScript.
- Added an old-save and HTML-text regression. The old HTML-escaping assertion now runs in the browser, where React renders the text.
- Added private agent context, unmodified skill copies, ignore rules, and public contribution rules.
- Removed the old npm lockfile and replaced the old JS entry points with the workspace sources.

## Architecture Decisions

No NestJS API was added. This static game has no server feature. The decision is recorded in ADR 0001.
Core and Node tools use NodeNext. The Vite app uses ESNext and Bundler resolution, as in the reference project.
The web workspace owns its `apps/web/dist/` deployment artifact.
The sure-school no-new-tests rule is project-specific and was not copied.

## Verification

The staged copy and the actual project both passed format, typecheck, lint, 12 domain tests,
build, and nine production-browser tests.
The browser suite covers desktop and mobile play, keyboard focus, undo, reset, predictions, separate saves,
blocked storage, explanation text, and offline reload. Layout checks include 390px and 320px widths.
A one-time comparison matched 4,000 client evaluations across 2,000 generated layouts against the old evaluator.
The Layer 2 loop message was simplified; its result did not change.
Screenshots were inspected for desktop, mobile, and challenge states.
The current build contains about 76.1 KB gzip JavaScript and 6.0 KB gzip CSS, plus HTML and the service worker.
It uses no external fonts, images, scripts, or application backend.

The first browser attempt could not start the sandboxed server. The approved run passed.
An intermediate type error in reducer state inference and a missing wireless color token were corrected.
A regression now checks the rendered wireless stroke and the four wired paths.

## Anti-Slop Review

Reviewed the new source against the previous implementation, not against an unavailable Git diff.
Unknown data stays in save/config boundaries. Device IDs, ports, actions, and prediction phases have specific types.
DOM and Graphlib casts connect known registries to external library types.
Removed a duplicate DOM null check, unnecessary select validation, and a hidden Graphlib fallback.
Storage and service-worker catches report real external failures. Connection errors remain visible to the learner.
The network transition helper owns undo semantics; components own distinct UI sections.
No new generic validation layer, state library, motion library, API, or database was added.

## UI Review

### Motion And Stable Controls

| Severity   | Location                                                                                                                    | Before                                | After                                                                                                     | Why                                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| LOW, fixed | apps/web/src/styles/interactions.css:1; apps/web/src/components/Workbench.tsx:25; apps/web/src/components/Workbench.tsx:217 | Buttons had no shared press feedback. | 0.96 scale with 150ms ease-out. Port and slot controls are static. Reduced motion disables the transform. | Scale on press gives feedback without moving cable anchors. |

### Icon Weight

| Severity   | Location                                                                    | Before                                      | After                                                                | Why                                                |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| LOW, fixed | apps/web/src/components/Icon.tsx:1; apps/web/src/styles/interactions.css:12 | One icon weight did not follow text weight. | Regular icons use 1.5; device labels use 2; the bold brand uses 2.5. | Match icon weight to text. One Lucide set remains. |

### Verification Scope

Desktop and mobile screenshots, empty/connected/error states, disabled controls, keyboard focus,
and reduced-motion behavior were checked. Code inspection covered hover, active, focus, and loading text.
Surface borders, hardware drawings, and staged path traces retain the approved design overrides in AGENTS.md.
No theme switch, exit animation, or image loading surface exists in this scope.
Not verified: manual replay at 10% speed in the browser Animations panel, every hover state on a real touch device,
screen-reader output, Safari, Firefox, and a full accessibility audit.

Approve for the inspected scope. No HIGH finding remains. This is not approval of unverified coverage.

## Missing Inputs And Limits

The actual project is `/home/oxdfa/Documents/0s1s/shokunbi/homelab-weave`.
The chat's configured project directory no longer exists. Changes were staged in `/tmp/homelab-conventions`.
No local AGENTS.md or architecture ADR existed before this task. Both were created.
The project is not a Git repository. A feature branch, tracked-file audit, and Git diff could not run.
All named private paths are excluded in both ignore files. Skill copies match their local sources.
No Git repository was initialized. No commit, push, public deployment, learner pilot, or secret read occurred.
STE wording was applied as a writing convention; formal dictionary compliance was not certified.
Offline cache replacement across multiple published versions remains a later deployment check.
