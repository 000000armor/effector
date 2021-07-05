import {BrowserObject} from 'webdriverio'
import {createStore, createEvent, combine} from 'effector'
import {using, h, spec, text, list, rec, remap} from 'forest'
import {Leaf} from '../index.h'

// let addGlobals: Function
declare const act: (cb?: () => any) => Promise<void>
declare const initBrowser: () => Promise<void>
declare const el: HTMLElement
// let execFun: <T>(cb: (() => Promise<T> | T) | string) => Promise<T>
// let readHTML: () => string
declare const browser: BrowserObject
declare const exec: (cb: () => any) => Promise<string[]>
declare const execFunc: <T>(cb: () => Promise<T>) => Promise<T>

beforeEach(async () => {
  await initBrowser()
}, 10e3)

test('rec visible support', async () => {
  const [s1, s2, s3] = await exec(async () => {
    const toggleNestedRows = createEvent()
    const nestedRowsVisible = createStore(true).on(
      toggleNestedRows,
      visible => !visible,
    )
    type Item = {
      value: string
      child: Item[]
    }
    type FlatItem = {
      value: string
      child: string[]
    }
    const items = createStore([
      {
        value: 'a',
        child: [
          {
            value: 'a_a',
            child: [],
          },
          {
            value: 'a_b',
            child: [
              {
                value: 'a_b_a',
                child: [],
              },
            ],
          },
        ],
      },
      {
        value: 'b',
        child: [
          {
            value: 'b_a',
            child: [],
          },
          {
            value: 'b_b',
            child: [],
          },
        ],
      },
    ])
    const flatItems = items.map(list => {
      const result = [] as FlatItem[]
      list.forEach(processValue)
      function processValue({value, child}: Item) {
        result.push({value, child: child.map(({value}) => value)})
        child.forEach(processValue)
      }
      return result
    })
    const topLevelFlatItems = flatItems.map(list =>
      list
        .filter(({value}) => value.length === 1)
        .map(item => ({item, level: 0})),
    )
    let rootLeaf: Leaf
    //@ts-ignore
    using(el, {
      fn() {
        const Row = rec<{item: FlatItem; level: number}>(({store}) => {
          const [level, item] = remap(store, ['level', 'item'] as const)
          const visible = combine(
            level,
            nestedRowsVisible,
            (level, visible) => {
              if (level === 0) return true
              return visible
            },
          )
          const childs = combine(
            flatItems,
            item,
            level,
            (list, {child}, level) =>
              list
                .filter(({value}) => child.includes(value))
                .map(item => ({item, level: level + 1})),
          )
          h('div', {
            // style: {marginLeft: '1em'},
            visible,
            fn() {
              spec({text: [remap(item, 'value'), ' ', level]})

              list(childs, ({store}) => {
                Row({store})
              })
            },
          })
        })
        list(topLevelFlatItems, ({store}) => {
          Row({store})
        })
      },
      onRoot({leaf}: {leaf: Leaf}) {
        rootLeaf = leaf
      },
    })
    await act()
    //@ts-ignore
    // printLeaf(rootLeaf)
    await act(() => {
      toggleNestedRows()
    })
    await act(() => {
      toggleNestedRows()
    })
    //@ts-ignore
    // printLeaf(rootLeaf)
  })
  expect(s1).toMatchInlineSnapshot(`
    "
    <div>
      a 0
      <div>a_a 1</div>
      <div>
        a_b 1
        <div>a_b_a 2</div>
      </div>
    </div>
    <div>
      b 0
      <div>b_a 1</div>
      <div>b_b 1</div>
    </div>
    "
  `)
  expect(s2).toMatchInlineSnapshot(`
    "
    <div>a 0</div>
    <div>b 0</div>
    "
  `)
  expect(s3).toBe(s1)
})

test('rec style update support', async () => {
  const [s1, s2, s3] = await exec(async () => {
    const toggleNestedRows = createEvent()
    const nestedRowsVisible = createStore(true).on(
      toggleNestedRows,
      visible => !visible,
    )
    type Item = {
      value: string
      child: Item[]
    }
    type FlatItem = {
      value: string
      child: string[]
    }
    const items = createStore([
      {
        value: 'a',
        child: [
          {
            value: 'a_a',
            child: [],
          },
          {
            value: 'a_b',
            child: [
              {
                value: 'a_b_a',
                child: [],
              },
            ],
          },
        ],
      },
      {
        value: 'b',
        child: [
          {
            value: 'b_a',
            child: [],
          },
          {
            value: 'b_b',
            child: [],
          },
        ],
      },
    ])
    const flatItems = items.map(list => {
      const result = [] as FlatItem[]
      list.forEach(processValue)
      function processValue({value, child}: Item) {
        result.push({value, child: child.map(({value}) => value)})
        child.forEach(processValue)
      }
      return result
    })
    const topLevelFlatItems = flatItems.map(list =>
      list
        .filter(({value}) => value.length === 1)
        .map(item => ({item, level: 0})),
    )
    let rootLeaf: Leaf
    //@ts-ignore
    using(el, {
      fn() {
        const Row = rec<{item: FlatItem; level: number}>(({store}) => {
          const [level, item] = remap(store, ['level', 'item'] as const)
          const visible = combine(
            level,
            nestedRowsVisible,
            (level, visible): string => {
              if (level === 0) return 'yes'
              return visible ? 'yes' : 'no'
            },
          )
          h('div', {
            style: {marginLeft: level.map(value => `${value}em`)},
            data: {visible},
            fn() {
              const value = remap(item, 'value')
              const status = visible.map(
                vis => (vis === 'yes' ? 'visible' : 'hidden') as string,
              )
              text`${value} ${level} ${status}`
            },
          })
          const childs = combine(
            flatItems,
            store,
            (list, {item: {child}, level}) =>
              list
                .filter(({value}) => child.includes(value))
                .map(item => ({item, level: level + 1})),
          )
          list(childs, ({store}) => {
            Row({store})
          })
        })
        list(topLevelFlatItems, ({store}) => {
          Row({store})
        })
      },
      onRoot({leaf}: {leaf: Leaf}) {
        rootLeaf = leaf
      },
    })
    await act()
    //@ts-ignore
    // printLeaf(rootLeaf)
    await act(() => {
      toggleNestedRows()
    })
    await act(() => {
      toggleNestedRows()
    })
    //@ts-ignore
    // printLeaf(rootLeaf)
  })
  expect(s1).toMatchInlineSnapshot(`
"
<div data-visible='yes' style='margin-left: 0em'>
  a 0 visible
</div>
<div data-visible='yes' style='margin-left: 1em'>
  a_a 1 visible
</div>
<div data-visible='yes' style='margin-left: 1em'>
  a_b 1 visible
</div>
<div data-visible='yes' style='margin-left: 2em'>
  a_b_a 2 visible
</div>
<div data-visible='yes' style='margin-left: 0em'>
  b 0 visible
</div>
<div data-visible='yes' style='margin-left: 1em'>
  b_a 1 visible
</div>
<div data-visible='yes' style='margin-left: 1em'>
  b_b 1 visible
</div>
"
`)
  expect(s2).toMatchInlineSnapshot(`
"
<div data-visible='yes' style='margin-left: 0em'>
  a 0 visible
</div>
<div data-visible='no' style='margin-left: 1em'>
  a_a 1 hidden
</div>
<div data-visible='no' style='margin-left: 1em'>
  a_b 1 hidden
</div>
<div data-visible='no' style='margin-left: 2em'>
  a_b_a 2 hidden
</div>
<div data-visible='yes' style='margin-left: 0em'>
  b 0 visible
</div>
<div data-visible='no' style='margin-left: 1em'>
  b_a 1 hidden
</div>
<div data-visible='no' style='margin-left: 1em'>
  b_b 1 hidden
</div>
"
`)
  expect(s3).toBe(s1)
})

function printLeaf(leaf: Leaf) {
  const rows = [] as string[]
  parse(leaf, {level: 0})
  function parse(leaf: Leaf, {level}: {level: number}) {
    const {data} = leaf
    const tab = ' '.repeat(level * 2)
    rows.push(`${tab}id: ${leaf.spawn.fullID}`)
    rows.push(`${tab}type: ${data.type}`)
    switch (data.type) {
      case 'using': {
        break
      }
      case 'element': {
        const {value, index} = data.block
        rows.push(`${tab}index: ${index}`)
        rows.push(`${tab}text: ${value.textContent}`)
        break
      }
      case 'list': {
        break
      }
      case 'list item': {
        break
      }
      case 'route': {
        break
      }
      case 'rec item': {
        break
      }
      case 'rec': {
        break
      }
    }
    let hasChilds = false
    iterateChildLeafs(leaf, child => {
      parse(child, {level: level + 1})
      rows.push(`${tab}  --`)
      hasChilds = true
    })
    if (hasChilds) {
      rows.pop()
    }
  }
  console.log(rows.join(`\n`))
  function iterateChildLeafs(leaf: Leaf, cb: (child: Leaf) => void) {
    const {spawn: page} = leaf
    for (const key in page.childSpawns) {
      const childs = page.childSpawns[key]
      for (let i = 0; i < childs.length; i++) {
        const childSpawn = childs[i]
        //@ts-ignore
        cb(childSpawn.leaf)
      }
    }
  }
}

test('top level rec suppot', async () => {
  //prettier-ignore
  type Item = {id: number; title: string; child: Item[]};
  const [s1] = await exec(async () => {
    const Article = rec<Item>(({store}) => {
      const [title, child] = remap(store, ['title', 'child'] as const)
      h('div', () => {
        h('header', {text: title})
        list({
          source: child,
          key: 'id',
          fn({store}) {
            Article({store})
          },
        })
      })
    })
    const item = createStore<Item>({
      id: 0,
      title: 'root',
      child: [
        {
          id: 1,
          title: 'a',
          child: [],
        },
        {
          id: 2,
          title: 'b',
          child: [
            {
              id: 3,
              title: 'c',
              child: [],
            },
          ],
        },
      ],
    })
    using(el, () => {
      h('section', () => {
        Article({store: item})
      })
    })
    await act()
  })
  expect(s1).toMatchInlineSnapshot(`
    "
    <section>
      <div>
        <header>root</header>
        <div><header>a</header></div>
        <div>
          <header>b</header>
          <div><header>c</header></div>
        </div>
      </div>
    </section>
    "
  `)
})
