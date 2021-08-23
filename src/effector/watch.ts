import {step} from './typedef'
import {callStack} from './caller'
import {createNode} from './createNode'
import {Subscription, NodeUnit} from './index.h'
import {createSubscription} from './subscription'
import {throwError} from './throw'
import {isFunction} from './is'

export const watchUnit = (
  unit: NodeUnit,
  handler: (payload: any) => any,
): Subscription => {
  if (!isFunction(handler)) throwError('.watch argument should be a function')
  return createSubscription(
    createNode({
      scope: {fn: handler},
      node: [step.run({fn: callStack})],
      parent: unit,
      meta: {op: 'watch'},
      family: {owners: unit},
      regional: true,
    }),
  )
}
