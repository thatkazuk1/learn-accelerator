# Report 02: Multi-Provider Workflow

The workflow setup is complete. No tests were run.

## Changes

- Added `docs/AI_WORKFLOW.md` with the shared provider workflow.
- Added `docs/adrs/handoff/00-template.md` for future task handoffs.
- Added `docs/adrs/handoff/02-multi-provider-workflow.md` as the active setup handoff.
- Added this report.
- Updated `.codex/README.md` and `README.md` to point to the workflow guide.

## Decisions

Codex remains the primary executor.
OpenCode is the primary fallback executor with `openai/gpt-6-astra`.
Claude Code is the planner and reviewer.
Only one provider edits the working tree at a time.
No OpenCode credentials or Claude credentials are stored in the repository.
Ollama is left for a future task.

## Verification

- `pnpm lint`
- `pnpm exec tsc -p tsconfig.tools.json`

Both commands passed.

Not run by request:

- unit tests
- browser tests
- production browser tests
- build

## Limits

The checkout is not a valid Git repository. Git-backed source of truth needs an
explicit operator request before setup.
