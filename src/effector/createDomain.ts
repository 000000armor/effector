import {Store, Event, Effect, Domain} from './unit.h'
import {own} from './own'
import {createNode} from './createNode'
import {Config} from './index.h'
import {
  createEvent,
  createStore,
  createNamedEvent,
  initUnit,
} from './createUnit'
import {createEffect} from './createEffect'
import {forward} from './forward'
import {addToRegion} from './region'
import {forIn} from './collection'
import {getParent} from './getter'
import {DOMAIN} from './tag'
import {launch} from './kernel'

const createHook = (trigger: Event<any>, acc: Set<any>, node: any) => {
  trigger.create = payload => {
    launch(trigger, payload)
    return payload
  }
  trigger.watch(data => {
    own(node, [data])
    acc.add(data)
    if (!data.ownerSet) data.ownerSet = acc
    if (!getParent(data)) data.parent = node
  })
  own(node, [trigger])
  return (hook: (data: any) => any) => {
    acc.forEach(hook)
    return trigger.watch(hook)
  }
}

export function createDomain(nameOrConfig: any, maybeConfig?: any): Domain {
  const domains: Set<Domain> = new Set()
  const stores: Set<Store<any>> = new Set()
  const effects: Set<Effect<any, any, any>> = new Set()
  const events: Set<Event<any>> = new Set()

  const node = createNode({
    family: {type: DOMAIN},
  })

  const result: any = {
    history: {
      domains,
      stores,
      effects,
      events,
    },
    graphite: node,
  }

  node.meta = initUnit(DOMAIN, result, maybeConfig, nameOrConfig)
  const [event, effect, store, domain] = [
    'onEvent',
    'onEffect',
    'onStore',
    'onDomain',
  ].map(createNamedEvent)

  result.hooks = {
    event,
    effect,
    store,
    domain,
  }
  result.onCreateEvent = createHook(event, events, result)
  result.onCreateEffect = createHook(effect, effects, result)
  result.onCreateStore = createHook(store, stores, result)
  result.onCreateDomain = createHook(domain, domains, result)

  result.createEvent = result.event = (nameOrConfig: any, config?: Config) =>
    event(
      createEvent(nameOrConfig, {
        parent: result,
        config,
      }),
    )
  result.createEffect = result.effect = (nameOrConfig: any, config?: Config) =>
    effect(
      createEffect(nameOrConfig, {
        parent: result,
        config,
      }),
    )
  result.createDomain = result.domain = (nameOrConfig: any, config?: Config) =>
    createDomain({
      name: nameOrConfig,
      parent: result,
      config,
    })
  result.createStore = result.store = (state: any, config?: Config) =>
    store(
      createStore(state, {
        parent: result,
        config,
      }),
    )
  addToRegion(result)
  const parent = getParent(result)
  if (parent) {
    forIn(result.hooks, (from, key) => {
      forward({from, to: parent.hooks[key]})
    })
    parent.hooks.domain(result)
  }
  return result
}
