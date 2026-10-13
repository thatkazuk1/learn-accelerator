# Handoff 02: Multi-Provider Workflow

> **Executor:** Codex
> **Read first:** AGENTS.md, `docs/adrs/decisions/0001-architecture.md`, `docs/adrs/handoff/01-js-ts-conventions.md`, and `docs/AI_WORKFLOW.md` > **Language:** ASD-STE100 for all text
> **Scope:** Multi-provider workflow docs, handoff template, and local agent context
> **Do not:** Read secrets, commit, push, deploy, initialize Git, run tests, or add Ollama integration

## 0. Why

Create a small workflow that lets Codex, OpenCode, and Claude Code continue the
same project without losing task state.

## 1. Current State

The root directory cleanup is complete. Project docs are in `docs/`.
Tests and browser test config are in `apps/web`.
The checkout is not a valid Git repository, so Git-backed source of truth is
not active yet.

## 2. Files Changed

- `docs/AI_WORKFLOW.md`: operating guide for provider switching.
- `docs/adrs/handoff/00-template.md`: reusable handoff template.
- `docs/adrs/handoff/02-multi-provider-workflow.md`: current workflow setup handoff.
- `docs/adrs/report/02-multi-provider-workflow.md`: setup report.
- `.codex/README.md`: local pointer to the workflow guide.
- `README.md`: public pointer to the workflow guide.

## 3. Next Step

Use `docs/AI_WORKFLOW.md` for the next task. If Codex reaches a usage limit,
update this handoff or create a new numbered handoff, then start OpenCode with
the command in the guide.

## 4. Acceptance Criteria

- A shared operating guide exists.
- A reusable handoff template exists.
- OpenCode command examples use `openai/gpt-6-astra` without secrets.
- Claude Code review commands are documented.
- No provider credential is stored in the repository.
- No tests run during this setup.

## 5. Validation

Run non-test checks only:

- `pnpm lint`
- `pnpm exec tsc -p tsconfig.tools.json`

Do not run unit tests, browser tests, or production builds until the operator
asks for tests.

## 6. Risks

Git cannot be the source of truth until the checkout is repaired or initialized.
This needs an explicit operator request.

OpenCode network/model access was not exercised during setup. Credentials stay
outside the repository.

## 7. Handoff Notes

OpenCode is the primary fallback executor. Claude Code is the planner and
reviewer. Keep one editing owner at a time.
