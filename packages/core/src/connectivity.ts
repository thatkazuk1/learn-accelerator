import { deviceIds, devices, present } from './model.js'
import type { ClientId, Connectivity, DeviceId, NetworkState, NodeId } from './model.js'

// The host supplies graph operations. Core owns the network rules, with no runtime dependency.
export interface NetworkGraph {
  addNode(node: NodeId): void
  link(a: NodeId, b: NodeId): void
  component(node: NodeId): NodeId[]
  edgeCount(nodes: NodeId[]): number
  path(from: NodeId, to: NodeId): NodeId[]
}

export function evaluateNetwork(
  state: NetworkState,
  client: ClientId,
  graph: NetworkGraph,
): Connectivity {
  for (const id of deviceIds) {
    if (present(state, id)) devices[id].ports.forEach((port) => graph.addNode(port))
  }
  // Use an internal bus so one switch does not create false cycles.
  if (present(state, 'switch')) {
    graph.addNode('switch:bus')
    devices.switch.ports.forEach((port) => graph.link('switch:bus', port))
  }
  if (present(state, 'ap')) graph.link('ap:ETH', 'ap:radio')
  graph.addNode('phone:radio')
  if (state.wifi && present(state, 'ap')) graph.link('phone:radio', 'ap:radio')
  state.cables.forEach(([a, b]) => graph.link(a, b))
  const origin: NodeId = client === 'phone' ? 'phone:radio' : 'desktop:ETH'
  const component = graph.component(origin)
  const physical =
    client === 'phone'
      ? state.wifi && present(state, 'ap')
      : state.cables.some((cable) => cable.includes('desktop:ETH'))
  const result: Connectivity = { physical, lan: false, online: false, path: [], message: '' }
  if (!physical) {
    result.message =
      client === 'phone'
        ? 'The phone has not joined Lab-WiFi.'
        : 'The desktop has no Ethernet link.'
  } else if (client === 'phone' && !state.cables.some((cable) => cable.includes('ap:ETH'))) {
    result.message = 'Wi-Fi is connected, but the access point has no wired uplink.'
  } else if (graph.edgeCount(component) >= component.length) {
    result.message =
      'This network has a Layer 2 loop. This level does not support loops. Remove the extra link.'
  } else if (component.includes('isp:ETH') || component.includes('router:WAN')) {
    result.message =
      'The local and upstream sides are mixed. Keep clients on router LAN and the ISP on router WAN.'
  } else if (!component.includes('router:LAN')) {
    result.message = 'This device cannot reach router LAN for automatic network configuration.'
  } else {
    result.lan = true
    if (!graph.component('router:WAN').includes('isp:ETH')) {
      result.message =
        'The local network is connected. The router has no path from WAN to the ISP handoff.'
      return result
    }
    const route = graph.path(origin, 'router:LAN').map((port) => port.split(':')[0] as DeviceId)
    result.path = [
      ...route.filter((id, index) => index === 0 || id !== route[index - 1]),
      'isp',
      'internet',
    ]
    result.online = true
    result.message =
      'Internet destination reached. Your local network and upstream connection are working.'
  }
  return result
}
