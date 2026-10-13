# Handoff 04: Fix-It racks

> **Status: Deferred.** Do not start this handoff. Codex advised no new lessons until the first learner sessions.
> Reopen it when the pilot shows that learners need more practice. Handoff 05 is the active work.

> **Executor:** Codex CLI
> **Read first:** `AGENTS.md` (all of it), `docs/adrs/decisions/0001-architecture.md`, `docs/CONTENT_ROADMAP.md`, `docs/LEVEL_ONE.md`, `.agents/skills/anti-slop-typescript/SKILL.md`, `.agents/skills/better-ui/SKILL.md` and its six linked files
> **Language:** ASD-STE100 for all text, including text that a learner reads
> **Scope:** `packages/core/src/`, `apps/web/src/`, `apps/web/tests/`, `docs/LEVEL_ONE.md` (one short section), and `docs/adrs/report/04-fixit-racks.md` > **Do not:** Change the three existing save keys or their version-1 shapes, change `evaluateNetwork` messages, add a dependency, add a timer or attempt limit, add an API, run deployment steps, commit, or push

## 0. Why

Learners finish two levels and then have nothing new to do. A pre-built broken network
gives a new task that uses the whole evaluator. The learner diagnoses, repairs, and names the fault.
This also tests the diagnostic messages that exist today.

## 1. Current State

- `evaluateNetwork` returns a message for each fault class.
- `NetworkState` holds three slots, up to five cables, and the Wi-Fi flag.
- `LevelId` is `'guided' | 'challenge'`. `restoreJourney` accepts only those two values.
- `docs/CONTENT_ROADMAP.md` describes the content map.

## 2. Design

Add four Fix-It racks. Each rack is a preset `NetworkState` with all three devices placed.
Every rack fails the check for a clear reason. The learner repairs it until both clients are online.

| #   | Title             | Preset                                                                                                 | Expected first message (existing text)                                              |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| F1  | Swapped ports     | ISP on `router:LAN`, `router:WAN` to `switch:1`, desktop to `switch:2`, AP to `switch:3`, Wi-Fi joined | The local and upstream sides are mixed.                                             |
| F2  | Dead uplink       | Correct network, but no cable on `ap:ETH`, Wi-Fi joined                                                | Wi-Fi is connected, but the access point has no wired uplink.                       |
| F3  | Missing WAN       | Correct network, but no cable on `router:WAN`                                                          | The local network is connected. The router has no path from WAN to the ISP handoff. |
| F4  | ISP on the switch | ISP, router LAN, desktop, and AP all on switch ports, Wi-Fi joined                                     | The local and upstream sides are mixed.                                             |

Verify each expected message with a domain test. If a preset gives another message,
change the preset and not the message.

After both clients are online, show one question: "What was wrong?"
Give three choices. Only one is correct. Show a short explanation for each choice.
The answer does not affect progress. It is review material only.

## 3. Implementation rules

1. Put the preset data and the validation in `packages/core/src/fixit.ts`. Export it from `index.ts`.
   Core keeps zero runtime dependencies and no I/O.
2. Store progress in a **new** key: `homelab.fixit.v1`. Shape: `{ version: 1, solved: string[] }`.
   Store only the IDs of solved racks. Do not store connectivity results or the answer text.
3. Restore with the same pattern as `restoreJourney`: validate once at the boundary, use precise types after.
   Drop unknown IDs. A broken value gives an empty list, not an exception.
4. Do not widen `LevelId` if a separate type is simpler. Check how `levelKeys`, `loadGame`, and `reduceGame`
   use it first. Choose the smaller change and state the reason in the report.
5. Unlock Fix-It racks after the independent challenge is complete (`journey.unlocked`).
6. Reuse the existing board, inspector, check, trace, hint, undo and reset. Do not build a second board.
7. Reset on a Fix-It rack restores its preset, not an empty rack.
8. Keep in-memory fallback when storage is blocked, as the levels do today.
9. Use the existing tokens and Lucide icons. No entrance animation. Keep the reduced-motion path.
10. Review every new helper, cast, and fallback against `anti-slop-typescript` before you finish.

## 4. Acceptance Criteria

- Four racks load with the preset, and each shows its expected first message after Check.
- A correct repair brings both clients online. The learner can finish without a hint.
- Undo, reset, hints, and keyboard operation work on each rack.
- Reload keeps the solved list. Blocked storage does not break the page.
- Old saves under the three existing keys still load. A test proves it.
- No existing domain or browser scenario is removed or weakened.
- New domain tests cover each preset message and the restore of `homelab.fixit.v1`.
- At least one browser test solves a rack by keyboard only.

## 5. Validation

Run at the repository root:

```sh
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

Include the better-ui findings table in the report. Mark each check you did not verify.

## 6. Risks

| Risk                                      | Handling                                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A preset gives an unexpected message      | Change the preset. Do not change the evaluator text.                                                  |
| `LevelId` change spreads through the code | Use a separate type and a separate save key.                                                          |
| Learners guess instead of reason          | The "What was wrong?" step and the explanations address this. Review it in the pilot.                 |
| Layer 2 loop message is unreachable       | Do not plan a loop rack. Add one test that proves no cable set creates a loop, and report the result. |

## 7. Handoff Notes

Write `docs/adrs/report/04-fixit-racks.md` when the work is done.
State what changed, what you verified, what you did not verify, and what is open.
Keep the report free of hostnames, IP addresses and tunnel IDs.
