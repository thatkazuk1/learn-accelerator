# Handoff 05: Pre-pilot hardening

> **Executor:** Codex CLI
> **Read first:** `AGENTS.md` (all of it), `docs/adrs/decisions/0001-architecture.md`, `docs/adrs/report/03-coolify-deployment.md`, `docs/LEARNER_PILOT.md`, `.agents/skills/anti-slop-typescript/SKILL.md`, `.agents/skills/better-ui/SKILL.md` and its six linked files
> **Language:** ASD-STE100 for all text, including text that a learner reads
> **Scope:** `apps/web/src/`, `apps/web/tests/`, `packages/core/src/` (text and tests only), `docs/`, and `docs/adrs/report/05-pre-pilot-hardening.md` > **Do not:** Add a lesson, level, or device, change save keys or their version-1 shapes, add a dependency, add an API, run deployment steps, commit, or push

## 0. Why

The core MVP works. Three checks must pass before learners play. Do them in this order:
technical accuracy, offline update behavior, then accessibility (lower priority).
Findings from learners are more useful when these basic faults are already gone.
This handoff adds no new lessons.

## 1. Current State

- Keyboard and mobile checks pass (report 01).
- The offline reload works. Upgrade of a cached version is not tested.
- Report 03 verified the container, headers and offline reload locally.
- No screen-reader, contrast, or touch-target audit exists.
- No one has reviewed each explanation against a source.

## 2. Task 1 (first): Technical content review

Create `docs/CONTENT_REVIEW.md` with one table row for each learner-facing claim:

| ID  | Where | Text | Claim type | Source | Verdict | Action |
| --- | ----- | ---- | ---------- | ------ | ------- | ------ |

- Include every device role in `packages/core/src/model.ts`.
- Include every message in `connectivity.ts`.
- Include every explanation in `prediction.ts`.
- Include the journey text and reflection prompts in `apps/web/src/`.
- Claim type is one of: fact, model assumption, simplification.
- Source: use the three links in `docs/LEVEL_ONE.md`, or add a primary source. Do not cite a source that you did not open.
- Verdict is one of: accurate, accurate for this model, needs wording change, wrong.
- Fix every "wrong" and "needs wording change" item in the same change. Keep the message meaning that tests assert.
  If a test asserts old text, update the test and say so in the report.

Check these claims with extra care:

1. "Wi-Fi can stay joined while the AP has no uplink."
2. "Any switch port can serve any connection."
3. "WAN faces the ISP; LAN faces your devices."
4. The wording that real address leases can persist after a disconnection.
5. Each place where the interface says or implies that all real networks work this way.

Mark each model assumption in the interface text where it affects what the learner believes.

## 3. Task 2 (second): Offline update test

The service worker cache name changes with each build. Test these cases against the production preview:

1. Load version A. Wait for "Ready for offline play".
2. Build version B (change one visible string). Serve B at the same origin.
3. Reload while online. The learner must see a clear state: A keeps running, B waits for old tabs to close.
4. Close all tabs and open the page. B must load, and the old cache must be deleted.
5. Interrupt the install of B (block one asset). A must keep working offline, and the page must report the failure.
6. After step 5, restore the network and reload. B must install.
7. Saved progress and reflections survive steps 3 to 6.

If a case fails, fix `apps/web/vite.config.ts` or `apps/web/src/offline.ts`.
Add one browser test for each case that can run in CI. State which cases you tested by hand.

## 4. Task 3 (last, lower priority): Accessibility audit

Start this task only after tasks 1 and 2 are done and reported. The operator lowered its priority.
Do a reduced pass: fix faults that block a learner (no accessible name, no keyboard path, target too small to hit, text that fails contrast).
Record the other faults as open items. Do not redesign.

Audit the production build at 320, 390 and 1280 pixel widths.

| Check                  | Standard                                                                                  | Method                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Text and icon contrast | WCAG 2.1 AA (4.5:1 text, 3:1 large text and controls)                                     | Compute from the color tokens. Include disabled, selected, and error states. |
| Touch target size      | At least 44 by 44 CSS pixels for ports, buttons, and selects                              | Measure in the browser. Cable ports are the main risk.                       |
| Accessible names       | Every control has a name that includes its device and state                               | Read the accessibility tree.                                                 |
| Live feedback          | Check results and notices reach a screen reader once, not twice                           | Check the live region use.                                                   |
| Focus                  | Visible focus ring, logical order, no trap, return to a sensible target after each action | Keyboard walk-through of both levels.                                        |
| Not by color alone     | Link state, error, and success have text or shape cues                                    | Inspect each status.                                                         |
| Reduced motion         | Route trace has an ordered text path, and no animation runs                               | Emulate the preference.                                                      |
| Zoom                   | 200 percent zoom keeps all controls usable                                                | Browser zoom.                                                                |

Fix each fault in the smallest change. Keep the approved rack layout and palette.
Keep cable ports static on press (see `AGENTS.md`). If a 44 pixel target conflicts with the rack drawing,
enlarge the hit area and not the drawing.

Add a Playwright test for each fixed fault that a test can express (names, focus, target size).
List each fault that needs a human screen-reader pass. Do not claim that you tested a screen reader if you did not.

## 5. Acceptance Criteria

- `docs/CONTENT_REVIEW.md` covers every learner-facing claim, and no "wrong" verdict remains.
- Each offline case in task 2 has a result and a method (automated or by hand).
- Each audit check in task 3 has a result: pass, fixed, or open with a reason. Open items are allowed.
- All existing domain and browser scenarios still pass.
- No save key, save shape, dependency, or new lesson was added.
- The report lists all items that need a human check (screen reader, real device).

## 6. Validation

```sh
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

Include the better-ui findings table in the report. Mark each check that you did not verify.

## 7. Risks

| Risk                                        | Handling                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| A contrast fix changes the approved palette | Change the smallest token. Show the old and new value in the report.                  |
| A larger touch target moves the cables      | Enlarge the hit area only. Keep the drawing and the endpoints.                        |
| An update test is flaky in CI               | Keep it deterministic with a local preview server. Mark it by hand if it stays flaky. |
| A content fix changes tested text           | Update the test in the same change. Report it.                                        |

## 8. Handoff Notes

Write `docs/adrs/report/05-pre-pilot-hardening.md` when the work is done.
Put the open human-check list at the top. The operator uses it to prepare the learner sessions.
Keep the report free of hostnames, IP addresses and tunnel IDs.
