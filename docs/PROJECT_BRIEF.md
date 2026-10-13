# Networking Homelab Game

Working title; final name to be chosen by the project owner.

## Purpose

A browser game for IT students and more experienced learners who want a
stronger understanding of networking fundamentals. The learner builds and
connects a tiny homelab, observes its behavior, and learns why it works.

The idea comes from the project owner's experience maintaining a homelab
while still having gaps in foundational networking knowledge. The primary
hackathon track is Engagement & Staying in the Learning Journey.

## Agreed Direction

- Solo project within a two-month hackathon.
- Build-and-connect gameplay with a small homelab rack.
- Introduce routers, switches, and wireless access points.
- Include a simulated internet destination to give routing a visible purpose.
- Aim for a polished initial MVP in roughly two to three weeks, subject to
  available development time and learner feedback.

## Proposed MVP

A 10-15 minute experience with one guided setup and one independent variation.
The learner connects a wired computer and a wireless client to a small network
and a simulated internet destination.

Learning outcomes:

- Explain the distinct roles of a router, switch, and access point.
- Connect the appropriate device ports into a working network.
- Distinguish wired connections from wireless association.
- Explain the path used to reach the simulated internet destination.
- Use feedback to correct an unsuccessful connection.

Addresses are assigned automatically in this version. Manual subnetting,
VLANs, firewall configuration, realistic operating systems, accounts,
multiplayer, leaderboards, and an AI tutor are outside the initial scope.

## First Playable Milestone

Build one complete level before expanding content or investing in extensive art.

1. Present a compact 2D rack, client workspace, and device inventory.
2. Allow the learner to place a router, switch, and access point.
3. Allow port-to-port wired connections and a separate wireless association.
4. Provide inspection of each device's role and connection state.
5. Evaluate connectivity to the simulated internet destination.
6. Show an explanatory traffic path and useful feedback when a check fails.
7. Allow connections to be removed and the level to be reset.

Completion criteria:

- The intended topology passes the connectivity check.
- Disconnecting a required link causes the affected connectivity check to fail.
- Restoring the link restores connectivity without restarting the level.
- Feedback identifies a relevant problem without requiring random guessing.
- The level can be completed using keyboard controls as well as a pointer.
- Text labels convey essential states without depending on color alone.

## Simulation Rules To Validate

- Separate devices teach separate roles; explain that consumer routers often
  combine routing, switching, and Wi-Fi in one enclosure.
- A switch is useful because the scenario needs additional wired ports. Do not
  reject otherwise valid networks solely for omitting a prescribed device.
- Wireless association is distinct from plugging in a cable.
- Connectivity checks must evaluate device roles and port connections, not
  merely whether the drawing forms a connected graph.
- Traffic animations are explanatory models, not claims to emulate every
  packet or protocol exchange.
- Review technical rules and explanations against credible primary sources
  before including them in the learner experience.

## Release Quality

- Lightweight assets with no required video or external runtime services.
- Offline play after the first successful download.
- Local progress persistence with no account required.
- Touch and keyboard alternatives to dragging.
- Readable device labels and ports on small screens.
- Text separated from gameplay code to support future translations.
- Source references and explicit simulation limitations.

## Delivery Sequence

Week 1: Complete the first playable level and verify core simulation rules.

Week 2: Refine visuals and feedback; add saved progress, the independent
variation, and offline support; verify accessibility and small-screen behavior.

Week 3: Test with learners, address observed problems, and prepare a short demo.

Use the remaining hackathon time to improve the demonstrated learning
experience. Add more concepts only after the initial loop is working well.

## Evidence Of Learning And Codex Use

Ask learners to explain the device roles before and after play, then attempt
the independent variation. Record where they hesitate, which hints they use,
and whether they can explain why the finished network works. Treat a small
pilot as formative feedback rather than proof of broad educational impact.

Keep a development log of meaningful decisions, selected Codex contributions,
verification results, corrections by the project owner, and changes prompted
by learner feedback. The project owner retains ownership of the idea and
learning goals; Codex supports implementation, testing, and refinement.

## Next Design Decisions

- Exact device inventory and port counts for the first level.
- First-level layout and interaction flow.
- Implementation stack and an appropriate basis for the bounded simulation.
- Primary technical sources for the included networking concepts.
