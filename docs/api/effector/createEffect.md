---
id: createEffect
title: createEffect
hide_title: true
---

# `createEffect(handler?)`

Creates an [effect](Effect.md) with given handler

#### Arguments

1. `handler` (_Function_): function to handle effect calls, also can be set with [`use(handler)`](#use)

#### Returns

[_Effect_](Effect.md): New effect

:::note
You must provide a handler either in [createEffect](createEffect.md) or in [`.use`](Effect.md#usehandler) method later, otherwise effect will throw with "no handler used in _%effect name%_" error
:::

:::note
You are not supposed to [`Forward`](forward.md) to parts of _Effect_ (even though it consists of _Events_ and _Stores_), since it's a complete entity on its own. This behavior will not be supported
:::

:::note since
effector 21.3.0
:::

#### Examples

##### Create effect with handler

```js
import {createEffect} from 'effector'

const fetchUserReposFx = createEffect(async ({name}) => {
  const url = `https://api.github.com/users/${name}/repos`
  const req = await fetch(url)
  return req.json()
})

fetchUserReposFx.done.watch(({params, result}) => {
  console.log(result)
})

await fetchUserReposFx({name: 'zerobias'})
```

[Try it](https://share.effector.dev/7K23rdej)

##### Change state on effect completion

```js
import {createStore, createEffect} from 'effector'

const fetchUserReposFx = createEffect(async ({name}) => {
  const url = `https://api.github.com/users/${name}/repos`
  const req = await fetch(url)
  return req.json()
})

const repos = createStore([]).on(fetchUserReposFx.doneData, (_, repos) => repos)

await fetchUserReposFx({name: 'zerobias'})
```

[Try it](https://share.effector.dev/niIXnoC4)

##### Set handler to effect after creating

```js
import {createEffect} from 'effector'

const fetchUserReposFx = createEffect()

fetchUserReposFx.use(async ({name}) => {
  const url = `https://api.github.com/users/${name}/repos`
  const req = await fetch(url)
  return req.json()
})

await fetchUserReposFx({name: 'zerobias'})
```

[Try it](https://share.effector.dev/e1QPH9Uq)

##### Watch effect status

```js
import {createEffect} from 'effector'

const fetchUserReposFx = createEffect(async ({name}) => {
  const url = `https://api.github.com/users/${name}/repos`
  const req = await fetch(url)
  return req.json()
})

fetchUserReposFx.pending.watch(pending => {
  console.log(`effect is pending?: ${pending ? 'yes' : 'no'}`)
})

fetchUserReposFx.done.watch(({params, result}) => {
  console.log(params) // {name: 'zerobias'}
  console.log(result) // resolved value
})

fetchUserReposFx.fail.watch(({params, error}) => {
  console.error(params) // {name: 'zerobias'}
  console.error(error) // rejected value
})

fetchUserReposFx.finally.watch(({params, status, result, error}) => {
  console.log(params) // {name: 'zerobias'}
  console.log(`handler status: ${status}`)

  if (error) {
    console.log('handler rejected', error)
  } else {
    console.log('handler resolved', result)
  }
})

await fetchUserReposFx({name: 'zerobias'})
```

[Try it](https://share.effector.dev/LeurvtYA)

# `createEffect({ handler, name? })`

Creates an [effect](Effect.md)

#### Arguments

1. `params`? (_Params_): Setup effect
   - `handler` (_Function_): function to handle effect calls, also can be set with [`use(handler)`](#use)
   - `name`? (_string_): Optional effect name

#### Returns

[_Effect_](Effect.md): New effect

#### Examples

##### Create named effect

```js
import {createEffect} from 'effector'

const fetchUserReposFx = createEffect({
  name: 'fetch user repositories',
  async handler({name}) {
    const url = `https://api.github.com/users/${name}/repos`
    const req = await fetch(url)
    return req.json()
  },
})

await fetchUserReposFx({name: 'zerobias'})
```

[Try it](https://share.effector.dev/GynSzKee)
