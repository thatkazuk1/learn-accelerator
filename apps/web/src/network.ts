import graphlib from '@dagrejs/graphlib'
import { evaluateNetwork } from '@homelab/core'
import type { ClientId, Connectivity, NetworkState, NodeId } from '@homelab/core'

export function evaluate(state: NetworkState, client: ClientId): Connectivity {
  const graph = new graphlib.Graph({ directed: false })
  return evaluateNetwork(state, client, {
    addNode(node) {
      graph.setNode(node)
    },
    link(a, b) {
      graph.setEdge(a, b)
    },
    component(node) {
      const component = graphlib.alg.components(graph).find((nodes) => nodes.includes(node))
      if (!component) throw new Error(`Missing graph node: ${node}`)
      return component as NodeId[]
    },
    edgeCount(nodes) {
      return graph
        .edges()
        .filter((edge) => nodes.includes(edge.v as NodeId) && nodes.includes(edge.w as NodeId))
        .length
    },
    path(from, to) {
      const paths = graphlib.alg.dijkstra(
        graph,
        from,
        () => 1,
        (node) => {
          const edges = graph.nodeEdges(node)
          if (!edges) throw new Error(`Missing graph node: ${node}`)
          return edges
        },
      )
      const route: NodeId[] = [to]
      let node = to
      while (node !== from) {
        const predecessor = paths[node]?.predecessor
        if (!predecessor) throw new Error(`No graph path from ${from} to ${to}`)
        node = predecessor as NodeId
        route.unshift(node)
      }
      return route
    },
  })
}
