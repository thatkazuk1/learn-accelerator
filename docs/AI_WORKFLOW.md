# Multi-Provider AI Workflow

Use this workflow when Codex, OpenCode, and Claude Code share work on this
repository.

## 0. Source Of Truth

Git is the source of truth for code state, task state, and review state.
This checkout must be a valid Git repository before the full workflow is used.
Do not initialize Git, commit, push, or deploy unless the operator asks for it.

Tracked decisions, handoffs, and reports live in `docs/adrs/`.

The current checkout also has local private agent context. Keep these paths out
of Git and Docker contexts:

- `AGENTS.md`
- `CLAUDE.md`
- `.agents/`
- `.claude/`
- `.codex/`

Do not store secrets in this repository. OpenCode and Claude Code credentials
belong in their own user-level configuration.

## 0.1 Git Naming

All providers and human contributors use Conventional Commits.
Keep commit subjects short, specific, and imperative. Do not write essay-style
subjects or wordy commit bodies. Add a brief body only when necessary context
does not fit in the subject.

Name branches `<type>/<short-description>`. Examples are
`feat/coolify-deployment` and `fix/offline-cache`.

## 1. Roles

Codex is the primary executor. Use it for planning, implementation, cleanup,
and local verification.

OpenCode is the primary fallback executor. Use it when Codex reaches a usage
limit or when the operator wants a second implementation pass. Run it with the
existing OpenAI provider setup and the `openai/gpt-6-astra` model.

Claude Code is the planner and reviewer. Use it for architecture checks,
implementation reviews, risk analysis, and fallback implementation when useful.

Ollama is reserved for a later task. Do not add it now.

## 2. Ownership Rule

Only one agent edits the working tree at a time.

Before an agent stops work, it must update the active handoff with:

- current state
- files changed
- next step
- acceptance criteria
- validation done
- validation still needed
- known risks

The next agent reads the active handoff before editing.

## 3. Required Reading

Before code changes, each agent reads:

- `AGENTS.md`
- `docs/adrs/decisions/0001-architecture.md`
- the active numbered handoff in `docs/adrs/handoff/`
- relevant reports in `docs/adrs/report/`
- the local skill files required by `AGENTS.md`

For JS and TS work, read `.agents/skills/anti-slop-typescript/SKILL.md`.
For UI work, also read `.agents/skills/better-ui/SKILL.md` and its six linked
reference files.

## 4. Handoff Protocol

Create one numbered handoff per task:

```txt
docs/adrs/handoff/NN-short-task-name.md
```

Use `docs/adrs/handoff/00-template.md` as the starting point.

The handoff is the contract between agents. It must state the executor, scope,
do-not list, acceptance criteria, and exact validation commands.

When a task is complete, write a matching report:

```txt
docs/adrs/report/NN-short-task-name.md
```

The report must say what changed, what was verified, what was not verified, and
what remains open.

## 5. Codex To OpenCode

Use this when Codex must stop before a task is done:

1. Codex updates the active handoff.
2. Codex leaves the working tree in a coherent state.
3. The operator starts OpenCode from the repository root.
4. OpenCode reads the handoff and resumes.

Recommended OpenCode command:

```sh
opencode run -m openai/gpt-6-astra \
  --title "homelab: resume handoff NN" \
  --file AGENTS.md \
  --file docs/adrs/decisions/0001-architecture.md \
  --file docs/adrs/handoff/NN-short-task-name.md \
  "Resume this task. Follow AGENTS.md and its Git naming rules. Do not read secrets. Do not commit, push, deploy, or run tests unless the operator asks for tests."
```

If OpenCode has an active session for the same task, continue it:

```sh
opencode run --continue \
  --file docs/adrs/handoff/NN-short-task-name.md \
  "Continue from the updated handoff. Report what changed and what remains."
```

Do not put API keys, account IDs, or model credentials in project files.

## 6. Claude Code Review

Use Claude Code after implementation and before the task is marked complete:

```sh
claude -p --permission-mode plan \
  --add-dir . \
  "Review the current task against AGENTS.md, ADR 0001, and the active handoff. Report bugs, architecture risks, missing validation, and unclear acceptance criteria. Do not edit files."
```

For a stronger review of a branch, use Claude Code review features only after
Git is valid and the operator asks for that review.

## 7. Validation

The standard gate from `AGENTS.md` is:

```sh
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

If the operator pauses tests, run only the approved non-test checks and record
the omitted checks in the report.

For UI work, include the better-ui findings table and mark checks that were not
verified.

## 8. Recovery

When switching providers:

- stop the current agent first
- keep the same working tree owner until the handoff is written
- do not run two agents that can edit the same files at the same time
- prefer a fresh handoff over a long chat transcript
- record blocked commands, failed checks, and partial work

If the checkout is not a valid Git repository, do not claim Git-backed source
of truth. Record that limit and ask the operator before Git setup.

## 9. Automation Roadmap

Add automation only after the manual workflow succeeds.

Possible later steps:

- a script that creates the next numbered handoff from the template
- a script that prints the active handoff and recommended OpenCode command
- a script that runs the standard gate selected by the operator
- a review command that sends the handoff and diff to Claude Code
- an Ollama fallback path for local-only review or small edits
