# Netwright: Three-Minute Demo

## Before Recording

Open [learn.kazuki.uk](https://learn.kazuki.uk) in a fresh browser profile. Confirm the welcome
screen appears and wait for **Ready for offline play**. Record at 1080p or higher. Keep the pointer
still when speaking, enlarge the browser if labels are hard to read, and add captions.

Prepare a second browser profile with the first two missions complete. Use it to show the later
missions without spending the video solving every lab.

## 0:00-0:25 - Problem And Approach

Show the welcome screen and enter a name.

> I run and maintain a homelab, but I still found gaps in my networking fundamentals. Many learning
> tools explain device names or give a quiz. Netwright lets learners construct a network, predict its
> behavior, break it safely, diagnose it, and explain why it works.

## 0:25-0:45 - Learning Journey

Show the five-mission dashboard and the locked progression.

> The journey starts with a guided build, then removes support. Later missions ask learners to repair
> a broken network, choose the correct equipment, and expand the lab with another switch.

## 0:45-1:30 - Build And Diagnose

Open **First connection**. Place the router, switch, and access point. Deliberately connect the ISP to
router LAN and run the check. Show the diagnostic message, then correct the connection and finish the
network.

> The simulation checks device roles and LAN/WAN boundaries. A connected drawing does not
> automatically pass. Feedback points to a networking idea instead of asking the learner to guess.

Show the successful path trace.

> This is a conceptual route, not a packet capture. The game states its simulation limits and links
> to its technical sources.

## 1:30-1:55 - Predict Before Testing

Choose the access-point uplink experiment. Predict that only the desktop remains online, run the
experiment, and show that the phone stays associated with Wi-Fi but loses internet access.

> Learners commit to a prediction before the game changes the topology. The result separates Wi-Fi
> association from internet connectivity. Reconnect and Undo make experimentation safe.

## 1:55-2:15 - Apply And Progress

Switch to the prepared profile. Show a completed mission and briefly open **The broken link**,
**Choose your gear**, and **Expand the lab** from the dashboard.

> Progress is local to the device. There is no account, timer, leaderboard, or penalty for hints.
> The focus is understanding and continued practice.

## 2:15-2:35 - Access Conditions

Use browser developer tools to go offline, reload the dashboard, and open a mission.

> The complete application is about 304 kilobytes before transport compression. After the first
> load, all five missions work offline. It has no external runtime assets or application backend and
> remains usable on mobile and with keyboard controls.

## 2:35-2:55 - Codex Usage

Show `docs/CODEX_USAGE.md`, a handoff, and the final test output or repository pull requests.

> I chose the problem, audience, and learning direction. Codex helped me plan bounded iterations,
> implement the simulation and interface, test real browser behavior, find accessibility and offline
> bugs, refactor the architecture, and prepare deployment. I reviewed the work and redirected it when
> repository structure or product choices did not match my standards.

## 2:55-3:00 - Close

Return to the dashboard with the public URL visible.

> Netwright turns networking fundamentals into something learners can build, break, and understand.

## Recording Checklist

- Public URL is visible at least once.
- Voice is clear and captions are present.
- The video shows one mistake and its diagnostic feedback.
- The prediction happens before the disconnection.
- Offline mode is demonstrated, not only described.
- Codex evidence is visible for several seconds.
- Do not claim learner-study results, multilingual support, or packet-level simulation.
