# Report 05: Pre-pilot hardening

## Human checks needed

- Screen-reader pass on both levels (VoiceOver or NVDA). The live region, focus order, and accessible names are set, but no screen reader was used.
- Real-device touch-target test at 320 px on a phone. The port hit areas use a `::before` pseudo-element. Verify that taps register on the enlarged area.
- Manual offline update test on a real deployment (handoff cases 3 to 7). The browser tests simulate the service worker lifecycle with route intercepts.

## Task 1: Technical content review

Created `docs/CONTENT_REVIEW.md` with 33 claims. Sources: three Cisco articles and RFC 2131.

| Verdict                 | Count |
| ----------------------- | ----- |
| accurate                | 8     |
| accurate for this model | 24    |
| needs wording change    | 1     |
| wrong                   | 0     |

One wording fix (CR-021): the DHCP lease sentence in `apps/web/src/App.tsx` now reads "In real networks, DHCP leases can remain valid for a time after a disconnection. This lab recomputes connectivity right away." The old text said "leases ... are not simulated," which was imprecise.

No "wrong" verdict remains. No test text changed.

## Task 2: Offline update test

Updated `apps/web/src/offline.ts`:

- Added `updatefound` listener so a new SW version triggers the "Update ready" message.
- Changed the `statechange` handler: `installed` + `waiting` reports "Update ready. Close all tabs to finish." The `redundant` state reports "Offline download failed. Reload to retry."
- Cleaned up the installing worker listener on each new install.

Added two browser tests in `apps/web/tests/browser/game.spec.ts`:

| Case                                | Test                                                            | Method                                                                                                                                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Update waits for old tabs           | `production update waits for old tabs and keeps saved progress` | Automated. Registers a modified SW with a different cache name. Asserts the "Update ready" message and that only one cache key remains.                                                                                       |
| Failed update keeps current version | `production failed update keeps current offline version`        | Automated. Registers a SW whose install handler rejects. Asserts the "Offline download failed" message, then verifies offline play still works with the original SW. Uses `context.route()` to intercept the SW script fetch. |

Cases 1, 2, and 7 (initial load, version build, save persistence) are covered by the existing `production build reloads and plays offline with saved progress` test. Cases 3 to 6 (tab lifecycle on a real origin) need a manual test on a deployed build.

## Task 3: Accessibility audit (reduced pass)

Audited at the default viewport width. Fixed blocking faults only.

| Check             | Result | Detail                                                                                                                                                                                                                                                                    |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Touch target size | Fixed  | Icon buttons raised from 38 px to 44 px. Port buttons use a `::before` pseudo-element with `inset: -5px -4px` to enlarge the hit area without moving the drawing. Wi-Fi select raised from 34 px to 44 px. The `.connection-row .icon-button` 28 px override was removed. |
| Accessible names  | Fixed  | Equipment buttons include the device name and state (not installed / selected for placement / installed). The remove button includes the device name. The inspect button includes the device name. The Wi-Fi select includes the connection state.                        |
| Target size test  | Added  | `controls have state names and target sizes` test checks that all visible enabled controls are at least 44 x 44 px.                                                                                                                                                       |

### Open items (not fixed, recorded for later)

- Contrast audit at 320, 390, and 1280 px widths: not done. The existing palette uses light green on white for some status text. A full token review is needed.
- Live region audit: not done. The `.offline-state` element may announce status changes. A screen-reader pass is needed to verify that messages arrive once.
- Focus order walk-through at 320 and 390 px: not done beyond the existing keyboard tests.
- Reduced motion: the existing `route-trace` animation has a reduced-motion alternative (verified by the existing test). Other elements were not checked.
- Zoom at 200%: not tested.

## Validation gate

All commands pass:

```
pnpm format       — no changes
pnpm typecheck    — clean
pnpm lint         — clean
pnpm test         — 12 domain tests pass
pnpm build        — clean (243.70 kB JS, 23.27 kB CSS)
pnpm test:browser — 12 browser tests pass (HOMELAB_PRODUCTION=true)
```

## Changes

| File                                    | Change                                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/App.tsx`                  | Wording fix for CR-021 (DHCP lease sentence).                                                                               |
| `apps/web/src/offline.ts`               | Update-ready and failed-update status messages. `updatefound` listener.                                                     |
| `apps/web/src/components/Equipment.tsx` | `aria-label` with device name and state on equipment buttons.                                                               |
| `apps/web/src/components/Inspector.tsx` | `aria-label` with device name on the remove button.                                                                         |
| `apps/web/src/components/Workbench.tsx` | `aria-label` on inspect button and Wi-Fi select.                                                                            |
| `apps/web/src/styles/style.css`         | Touch targets raised to 44 px. Port hit area enlarged with `::before`.                                                      |
| `apps/web/tests/browser/game.spec.ts`   | Three new tests: target sizes, SW update, SW failed update. Updated one existing test to match the new remove-button label. |
| `docs/CONTENT_REVIEW.md`                | New file. 33 claims reviewed.                                                                                               |

## Not changed

- No save key, save shape, dependency, or new lesson was added.
- No existing domain or browser test was removed.
- No color token was changed. The approved palette is unchanged.
- No hostname, IP address, or tunnel ID appears in this report.
