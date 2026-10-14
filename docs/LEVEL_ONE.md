# Level One: Bring Your Network Online

Status: implementation-ready proposal, expanding the agreed project brief.

## Mission

"Your internet connection is ready. Build a network that brings your desktop
and phone online."

Target duration: 5-8 minutes for this guided level. The independent variation
will complete the MVP's 10-15 minute experience.

## Inventory

| Item             | Interfaces                          | Starting state                |
| ---------------- | ----------------------------------- | ----------------------------- |
| ISP handoff      | One Ethernet port                   | Fixed and ready               |
| Router           | One WAN port, one LAN port          | In inventory                  |
| Unmanaged switch | Five interchangeable Ethernet ports | In inventory                  |
| Access point     | One Ethernet port, Wi-Fi radio      | In inventory                  |
| Desktop          | One Ethernet port                   | Fixed on desk                 |
| Phone            | Wi-Fi only                          | Fixed on desk, not associated |

The ISP handoff abstracts an already installed modem/ONT and upstream service.
The internet destination is a simulated learning-resource server beyond it.
No real network probes or external learning service are required.

All placed devices are powered automatically. The router's WAN service,
routing, NAT, and LAN DHCP are preconfigured. The AP has a preconfigured
secured network named Lab-WiFi; credentials are provided automatically.
These are scenario assumptions, not claims that real equipment requires no setup.

## Expected Network

```text
Simulated internet destination
             |
       ISP handoff
             |
         WAN Router LAN
                      |
                    Switch
                    /    \
              Desktop    Access point
                              :
                            Phone

Solid connections: Ethernet. Dotted connection: Wi-Fi association.
```

Any switch port can serve any connection. Rack position and cable drawing
order do not affect correctness. A direct router-to-desktop connection can
give the desktop internet access; it cannot complete the two-client mission
with this router's single LAN port. Credit partial working configurations.

## Player Journey

1. Read the mission and inspect the available equipment.
2. Place equipment in the rack or on its shelf using selection and placement.
3. Select an Ethernet port and then another port to connect them.
4. Select Lab-WiFi from the phone's network selector to associate with the AP.
5. Run a check from either client and inspect the result.
6. Correct connections as needed until both clients can reach the destination.
7. Predict which device connects the local network to the upstream network,
   then view the explanatory traffic path.

Allow steps in any order. Hints are optional, progressive, and carry no score
penalty. Avoid countdowns and limits on attempts.

## Interaction And Layout

- Desktop: inventory on the left, rack and desk in the center, selected-device
  inspection on the right. Put the mission and two client statuses above.
- Small screens: stack the workspace and inspection area; keep port targets
  readable rather than shrinking the entire desktop layout.
- Click/tap or keyboard activation selects an item, slot, or port. Dragging
  can be added later but must never be required.
- Selecting a port highlights its state. Escape cancels a pending connection.
- A connection can be selected and removed. Occupied ports must be freed
  before attaching another cable; never silently replace an existing cable.
- Removing a device also removes its links, with an undo action.
- Connection lines and port labels remain legible independently of color.
- Use reduced-motion preferences for traffic animation and provide an
  equivalent ordered text path.

Device inspection includes its role, interfaces, current link states, and a
short explanation relevant to the current setup. Keep long lessons outside
the main workspace.

## Status And Feedback

Separate physical link, wireless association, LAN configuration, and internet
reachability. A cable can have link while being connected to the wrong role
for this scenario. A phone can associate with an AP whose uplink is unplugged.

| Situation                           | Feedback                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Desktop has no cable                | "The desktop has no Ethernet link."                                                                     |
| Phone is not associated             | "The phone has not joined Lab-WiFi."                                                                    |
| Phone associated; AP has no uplink  | "Wi-Fi is connected, but the access point has no wired uplink."                                         |
| Client cannot reach router LAN      | "This device cannot reach the router's LAN interface for automatic network configuration."              |
| LAN works; WAN is disconnected      | "The local network is connected. The router has no link to the ISP handoff."                            |
| ISP connected to LAN instead of WAN | "The ISP handoff is connected to the LAN side. This router's upstream connection is configured on WAN." |
| Desktop works; phone fails          | "Desktop online. Check the phone's Wi-Fi association and the access point's uplink."                    |

These messages describe the bounded model. Do not imply that every valid real
network must use this exact arrangement. Wrong-role Ethernet links should
be allowed physically, then diagnosed; impossible UI actions such as using an
occupied port twice should be rejected immediately with an explanation.

## Simulation Contract

Store device instances, placements, port-to-port cables, and wireless
associations. Derive status from this state after every change.

- Cables join two distinct free Ethernet ports on different devices.
- Switch ports share a forwarding domain in this unmanaged-switch model.
- The AP bridges its radio to its Ethernet interface.
- Clients and the ISP handoff are endpoints, not transit devices.
- Router LAN and WAN are separate interfaces; do not treat them as a switch.
- A client receives modeled LAN configuration only when its local forwarding
  domain reaches router LAN and does not include the ISP handoff or router WAN.
- Internet success requires that valid local path plus the configured WAN
  path to the ISP handoff, with WAN and LAN domains kept separate.
- Check both clients independently. Win only when both checks succeed.
- Detect redundant Layer 2 cycles and flag them as outside this level's model;
  do not hang traversal or invent spanning-tree behavior.

Prefer a maintained graph library for traversal and cycle analysis when the
implementation stack is selected. Networking role constraints remain explicit
domain rules; generic graph reachability alone is insufficient.

The visualization shows a conceptual outbound path, not a packet capture.
ARP exchanges, DHCP leases, DNS, packet timing, Wi-Fi signal strength, protocol
headers, firewall behavior, and detailed NAT processing are not simulated.
Removing a connection recomputes modeled configuration immediately; explain
that real address leases can persist after a disconnection.

## Verification Cases

1. Intended network gives both clients internet reachability.
2. Permuting switch port numbers or rack positions leaves results unchanged.
3. Direct router LAN-to-desktop works for that client only.
4. Removing the AP uplink leaves desktop online and phone associated but offline.
5. Removing WAN connectivity makes both internet checks fail while LAN stays configured.
6. Swapping router LAN and WAN connections does not pass the mission.
7. Putting the ISP and clients on a switch without a routed LAN path does not pass.
8. Duplicate port use and self-connections cannot corrupt state.
9. Removing and restoring a link updates results without restarting the level.
10. Keyboard-only completion, reduced motion, and a narrow viewport are usable.

## Independent Variation

Start a fresh layout with the same device types, rearranged positions, and no
step-by-step prompts. Require both clients online and ask the learner to explain
the router, switch, and AP roles. Keep hints available and record their use
locally. Do not treat the guided level's completion alone as learning evidence.

## Technical Sources

Checked on 2026-10-01. These support the device-role explanations; port counts,
automatic configuration, and status rules above are deliberate scenario choices.

- Cisco, How Does a Switch Work?
  https://www.cisco.com/site/us/en/learn/topics/small-business/network-switch-how.html
- Cisco, What Is a Switch vs a Router?
  https://www.cisco.com/site/us/en/learn/topics/small-business/network-switch-vs-router.html
- Cisco, What Is an Access Point?
  https://www.cisco.com/site/us/en/learn/topics/small-business/what-is-an-access-point.html

Review additional protocol-specific sources before introducing deeper protocol
explanations. Include source links in the eventual learning reference view.
