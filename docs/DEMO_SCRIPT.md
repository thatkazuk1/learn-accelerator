# Homelab: Three-Minute Demo

## Before Presenting

Open the production build on localhost or an HTTPS host and wait for
"Ready for offline play". Use a fresh browser profile for a clean starting
point, or reset level one. Reset preserves saved explanations and the unlock
of level two; do not describe it as clearing all learner data.

Keep a completed second level in another tab if time is tight. Do not open
two tabs with different saves on the same origin and assume they synchronize:
progress is local to each page until saved/reloaded.

## 0:00-0:25 - The Problem

"I maintain a homelab, but I still had gaps in networking fundamentals.
I wanted learners to understand why their network works, not just memorize
the names of the boxes. Homelab turns that into a small, hands-on exercise."

## 0:25-1:20 - Build

Place the router, switch, and access point. Connect the ISP handoff to WAN,
router LAN to the switch, and the switch to the desktop and AP. Join Lab-WiFi
on the phone and run the check.

"The router has one LAN port. The switch makes room for both wired connections.
The access point brings the wireless phone onto that network."

Show a connection trace. Call it an explanatory path, not a real packet capture.

## 1:20-1:55 - Predict And Test

Choose the AP-uplink experiment. Predict which client will stay online, then
test it. Show that Wi-Fi association remains while the phone loses internet.
Reconnect using the recovery action.

"The feedback separates being connected to Wi-Fi from being connected to the
internet. Mistakes are reversible and there is no timer."

## 1:55-2:25 - Apply And Explain

Open "On your own". Show the rearranged, disconnected rack and optional hints.
Show the completed second level and explanation fields if preprepared.

"The second challenge asks learners to apply the same device roles in a new
layout and explain their reasoning. Explanations are saved for review, not
automatically graded."

## 2:25-2:45 - Real Access Conditions

Disconnect networking in browser developer tools, reload, and run the check.

"After the initial download, the game works offline. It uses local assets,
requires no account, and stores progress in this browser."

## 2:45-3:00 - Codex And What Comes Next

"I chose the problem and learning direction. Codex helped implement the
simulation, interface, tests, and offline support. Tests caught real issues,
including offline asset matching and keyboard focus. Next I am testing with
learners to find out whether their explanations improve."

Show DEVELOPMENT_LOG.md if asked for collaboration evidence. Do not claim
learner validation, multilingual support, or production deployment that has
not happened. Use LEARNER_PILOT.md to organize the first feedback sessions.
