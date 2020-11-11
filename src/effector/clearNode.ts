import {Graph, Graphite} from './index.h'
import {getGraph, getOwners, getLinks, getSubscribers} from './getter'
import {is} from './is'
import {removeItem} from './collection'

const removeFromNode = (currentNode: Graph, targetNode: Graph) => {
  removeItem(currentNode.next, targetNode)
  removeItem(getOwners(currentNode), targetNode)
  removeItem(getLinks(currentNode), targetNode)
}
const clearNodeNormalized = (
  targetNode: Graph,
  deep: boolean,
  isDomainUnit: boolean,
) => {
  targetNode.next.length = 0
  targetNode.seq.length = 0
  //@ts-ignore
  targetNode.scope = null
  let currentNode
  let list = getLinks(targetNode)
  while ((currentNode = list.pop())) {
    removeFromNode(currentNode, targetNode)
    if (
      deep ||
      (isDomainUnit && !targetNode.meta.sample) ||
      currentNode.family.type === 'crosslink'
    ) {
      clearNodeNormalized(
        currentNode,
        deep,
        currentNode.meta.op !== 'on' && isDomainUnit,
      )
    }
  }
  list = getOwners(targetNode)
  while ((currentNode = list.pop())) {
    removeFromNode(currentNode, targetNode)
    if (isDomainUnit && currentNode.family.type === 'crosslink') {
      clearNodeNormalized(
        currentNode,
        deep,
        currentNode.meta.op !== 'on' && isDomainUnit,
      )
    }
  }
}
const clearMap = (map: any) => map.clear()
export const clearNode = (
  graphite: Graphite,
  {
    deep,
  }: {
    deep?: boolean
  } = {},
) => {
  let isDomainUnit = false
  //@ts-ignore
  if (graphite.ownerSet) graphite.ownerSet.delete(graphite)
  if (is.store(graphite)) {
    clearMap(getSubscribers(graphite))
  } else if (is.domain(graphite)) {
    isDomainUnit = true
    //@ts-ignore
    const history = graphite.history
    clearMap(history.events)
    clearMap(history.effects)
    clearMap(history.stores)
    clearMap(history.domains)
  }
  clearNodeNormalized(getGraph(graphite), !!deep, isDomainUnit)
}
