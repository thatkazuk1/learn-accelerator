# Interactive Content Roadmap

Status: proposal. It extends `docs/LEVEL_ONE.md` and `docs/PROJECT_BRIEF.md`.
It keeps the bounded model: no IP addressing, DHCP, DNS, or packet detail.

## 1. What exists

| Area         | Content today                                                     |
| ------------ | ----------------------------------------------------------------- |
| Levels       | Guided level and independent challenge (3 devices, 2 clients)     |
| Interactions | Place, cable, join Wi-Fi, check, trace, hint, undo, reset         |
| Prediction   | 3 experiments: unplug AP uplink, router WAN, desktop cable        |
| Reflection   | One written explanation for each device role (router, switch, AP) |
| Feedback     | 7 diagnostic messages from `evaluateNetwork`                      |
| Offline      | Service worker. Both levels work offline.                         |

## 2. Open work from Codex reports

| Item                                               | Source                  | Owner    |
| -------------------------------------------------- | ----------------------- | -------- |
| First commit, remote, and push                     | Report 03               | Operator |
| Coolify app, hostname, DNS, tunnel ingress, deploy | Report 03, handoff 03   | Operator |
| Public-edge checks (HTTPS, cache, offline, saves)  | Report 03               | Operator |
| Learner pilot with 3 to 5 learners                 | `docs/LEARNER_PILOT.md` | Operator |
| Measure transfer size before deployment            | ADR 0001                | Codex    |
| Learning reference view with source links          | `docs/LEVEL_ONE.md`     | Codex    |

## 3. Proposed content

Each item reuses the existing evaluator unless the table says otherwise.

| #   | Content                              | Player action                                                           | Learning goal                              | Model change                    | Cost   |
| --- | ------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------ | ------------------------------- | ------ |
| 1   | **Fix-It racks** (4 broken networks) | Read the symptom, find the faulty cable, repair it, name the fault      | Diagnosis. WAN/LAN roles. Uplink vs Wi-Fi. | None. New preset data only.     | Low    |
| 2   | **Hop-by-hop path**                  | Step through the route. At each hop, answer "what does this device do?" | Device roles in sequence                   | None. Uses `Connectivity.path`. | Low    |
| 3   | **Spot the fault**                   | Look at a drawn rack. Click the wrong cable.                            | Fast visual diagnosis                      | None                            | Low    |
| 4   | **Fewest devices**                   | Bring one chosen client online with the fewest devices                  | Why each device exists                     | None                            | Low    |
| 5   | **Role match**                       | Match 6 short scenarios to router, switch, or AP                        | Role vocabulary                            | None                            | Low    |
| 6   | **Reference and glossary**           | Open a panel with role summaries and source links                       | Review and trust                           | None                            | Low    |
| 7   | **Progress and badges**              | See levels done, hints used, predictions correct                        | Staying in the journey                     | New save key                    | Medium |
| 8   | **Loop lab**                         | Build a loop on purpose, then remove it                                 | Layer 2 loops                              | Second switch or second AP      | High   |
| 9   | **Two access points**                | Add a second AP. Predict which clients stay online.                     | Redundancy and bridging                    | More slots and ports            | High   |

## 4. Finding: the loop message is probably unreachable

`evaluateNetwork` reports a Layer 2 loop. With one switch, one AP, and one router,
no cable set creates a cycle. The router LAN and WAN ports are not linked inside the router.
Cables must join two different devices. Content item 8 needs a second switch or AP first.
Codex must confirm this with a test before any loop content is planned.

## 5. Recommended order

Codex advises that no new networking lessons start before the first learner sessions.
The order of work is: deploy, test with 3 to 5 learners, fix the observed problems, prepare the submission.

| Step  | Work                                                                                                              | Handoff                   |
| ----- | ----------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1     | Public HTTPS deployment                                                                                           | 03 (operator steps)       |
| 2     | Pre-pilot hardening, in this order: technical content review, offline update test, accessibility (lower priority) | 05                        |
| 3     | Learner sessions                                                                                                  | `docs/LEARNER_PILOT.md`   |
| 4     | Fix observed problems                                                                                             | New handoff, after step 3 |
| 5     | Capstone evidence and presentation                                                                                | New handoff, after step 4 |
| Later | Content in section 3, chosen by pilot findings. Fix-It racks are ready as handoff 04 (deferred).                  | 04                        |

Optional additions from Codex: export of learner explanations, and multilingual support.
Do not add accounts, an AI tutor, leaderboards, or a full network emulator.

## 6. Rules for every new item

- Keep the three existing save keys and their version-1 shapes unchanged.
- Give each new feature its own save key and version.
- Keep derived results out of saved state.
- No timers, no attempt limits, no score penalty for hints.
- Keyboard and reduced-motion support are required.
- No new dependency and no external request.
- Say in the interface what the model does not simulate.
