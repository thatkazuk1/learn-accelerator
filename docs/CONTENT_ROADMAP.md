# Interactive Content Roadmap

## Submission Status

The proof of concept contains a complete five-mission learning journey.

| Mission          | Learner action                                                           | Learning goal                                                     |
| ---------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| First connection | Place equipment, connect Ethernet ports, join Wi-Fi, and run diagnostics | Router, switch, and access-point roles                            |
| On your own      | Build the same network from a rearranged rack and explain each role      | Independent application and reflection                            |
| The broken link  | Diagnose and repair reversed router WAN and LAN connections              | Troubleshooting and network boundaries                            |
| Choose your gear | Select three useful devices from five options                            | Distinguish routers, switches, access points, hubs, and repeaters |
| Expand the lab   | Add another switch and connect the wireless client through it            | Local-network expansion and switch chaining                       |

The journey also includes three predict-then-test disconnection experiments, progressive hints,
conceptual path traces, local progress, offline play, and a mission dashboard.

## Submission Scope

The build is intentionally bounded:

- Connectivity and device roles, not packet-level emulation.
- A static browser application, not an account platform.
- Local progress, not learner analytics.
- English content, with a structure that can support later localization.
- Five polished missions instead of a large catalog of shallow lessons.

This scope keeps the application small, private, and useful on limited connections.

## Delivered Access Work

- Public HTTPS deployment at [learn.kazuki.uk](https://learn.kazuki.uk).
- Approximately 304 KB production bundle before transport compression.
- No external runtime assets, API, database, or account.
- Offline access after the first successful load.
- Mobile, touch, pointer, and keyboard operation.
- Reduced-motion behavior and text labels for important states.
- Source-backed technical explanations and explicit simulation limits.

## Future Development

These are post-submission opportunities, not missing requirements for the proof of concept.

| Priority | Addition                                             | Purpose                                                         |
| -------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| 1        | Extract interface and mission text into locale files | Prepare complete translations without mixing content with logic |
| 2        | Add a complete French locale                         | Demonstrate multilingual scaling across more African learners   |
| 3        | Add more troubleshooting presets                     | Reuse the evaluator for repeated diagnostic practice            |
| 4        | Add subnetting and address-planning missions         | Extend the curriculum after the connectivity foundation         |
| 5        | Export a local progress summary                      | Let a learner share work without creating an account            |

## Product Rules

Future work should preserve these decisions:

- No timers, lost lives, or score penalty for hints.
- No account requirement for core learning.
- New missions must work with keyboard and touch input.
- New technical claims need credible sources.
- Saved data must be versioned and validated.
- The core model must remain independent of browser I/O.
- New content must not weaken offline use or the small download size.
