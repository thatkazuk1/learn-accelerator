export type EquipmentId = 'router' | 'switch' | 'ap'
export type DeviceId = EquipmentId | 'isp' | 'desktop' | 'phone'
export type ClientId = 'desktop' | 'phone'
export type LevelId = 'guided' | 'challenge'
export type PortId =
  | 'isp:ETH'
  | 'router:WAN'
  | 'router:LAN'
  | `switch:${1 | 2 | 3 | 4 | 5}`
  | 'ap:ETH'
  | 'desktop:ETH'
export type NodeId = PortId | 'switch:bus' | 'ap:radio' | 'phone:radio'
export type Cable = [PortId, PortId]
export interface NetworkState {
  version: 1
  slots: [EquipmentId | null, EquipmentId | null, EquipmentId | null]
  cables: Cable[]
  wifi: boolean
  hints: number
}
export interface Connectivity {
  physical: boolean
  lan: boolean
  online: boolean
  path: (DeviceId | 'internet')[]
  message: string
}
export type Evaluator = (state: NetworkState, client: ClientId) => Connectivity
export const equipmentIds: EquipmentId[] = ['router', 'switch', 'ap']
export const clientIds: ClientId[] = ['desktop', 'phone']
export const deviceIds: DeviceId[] = ['isp', 'router', 'switch', 'ap', 'desktop', 'phone']
export const devices: Record<DeviceId, { name: string; role: string; ports: PortId[] }> = {
  isp: {
    name: 'ISP handoff',
    role: 'Your upstream connection. The modem or ONT and internet service are already ready.',
    ports: ['isp:ETH'],
  },
  router: {
    name: 'Router',
    role: 'Connects your local network to another network. WAN faces the ISP; LAN faces your devices.',
    ports: ['router:WAN', 'router:LAN'],
  },
  switch: {
    name: 'Switch',
    role: 'Connects wired devices within the local network. All five ports have the same role.',
    ports: ['switch:1', 'switch:2', 'switch:3', 'switch:4', 'switch:5'],
  },
  ap: {
    name: 'Access point',
    role: 'Bridges wireless devices onto the wired network. Joining Wi-Fi alone does not guarantee internet access.',
    ports: ['ap:ETH'],
  },
  desktop: {
    name: 'Desktop',
    role: 'A wired client. It needs a local connection to the router and an upstream route to reach the internet.',
    ports: ['desktop:ETH'],
  },
  phone: {
    name: 'Phone',
    role: 'A wireless client. Join Lab-WiFi to associate with the access point.',
    ports: [],
  },
}
export function initialState(): NetworkState {
  return { version: 1, slots: [null, null, null], cables: [], wifi: false, hints: 0 }
}
export function present(state: NetworkState, id: DeviceId): boolean {
  return id === 'isp' || id === 'desktop' || id === 'phone' || state.slots.includes(id)
}
export function portLabel(port: PortId): string {
  const [id, label] = port.split(':') as [DeviceId, string]
  return `${devices[id].name} ${label}`
}
export function connect(state: NetworkState, a: PortId, b: PortId): NetworkState {
  for (const port of [a, b]) {
    const id = port.split(':')[0] as DeviceId
    if (!present(state, id)) throw new Error('Choose an available Ethernet port.')
    if (state.cables.some((cable) => cable.includes(port)))
      throw new Error('This port is occupied. Remove its cable first.')
  }
  if (a.split(':')[0] === b.split(':')[0]) throw new Error('Choose a port on a different device.')
  return { ...state, cables: [...state.cables, [a, b]] }
}

export function restore(raw: unknown): NetworkState {
  if (typeof raw !== 'object' || raw === null) throw new Error('Invalid save')
  const value = raw as Record<string, unknown>
  if (value.version !== 1 || !Array.isArray(value.slots) || value.slots.length !== 3)
    throw new Error('Invalid save')
  const slots: unknown[] = value.slots
  if (slots.some((id) => id !== null && id !== 'router' && id !== 'switch' && id !== 'ap'))
    throw new Error('Invalid devices')
  const ids = slots.filter((id) => id !== null)
  if (new Set(ids).size !== ids.length) throw new Error('Invalid devices')
  let state: NetworkState = {
    version: 1,
    slots: slots as NetworkState['slots'],
    wifi: value.wifi === true && slots.includes('ap'),
    hints:
      typeof value.hints === 'number' && Number.isInteger(value.hints)
        ? Math.max(0, Math.min(3, value.hints))
        : 0,
    cables: [],
  }
  if (!Array.isArray(value.cables) || value.cables.length > 5) throw new Error('Invalid cables')
  const ports = deviceIds.flatMap((id) => devices[id].ports)
  for (const item of value.cables as unknown[]) {
    if (!Array.isArray(item) || item.length !== 2) throw new Error('Invalid cable')
    const cable: unknown[] = item
    if (cable.some((port) => typeof port !== 'string' || !ports.includes(port as PortId)))
      throw new Error('Invalid cable')
    const [a, b] = cable as Cable
    state = connect(state, a, b)
  }
  return state
}
