export type ID = string

//prettier-ignore
export type kind =
  | 'store'
  | 'event'
  | 'effect'
  | 'domain'

export type StateRef = {
  id: ID
  current: any
  type?: 'list' | 'shape'
  before?: any[]
  after?: any[]
}

export type Config = {
  loc?: {
    file: string
    column: number
    line: number
  }
  sid?: string
  named?: string
  name?: string | Config
  ɔ?: Config
  config?: Config
  parent?: any
  strict?: boolean
  handler?: Function
}

export type Node = {
  id: ID
  next: Array<Node>
  seq: Array<Cmd>
  scope: {[key: string]: any}
  reg: {[id: string]: StateRef}
  meta: {[tag: string]: any}
  family: {
    type: 'regular' | 'crosslink' | 'domain'
    links: Node[]
    owners: Node[]
  }
}

export type NodeUnit = {graphite: Node} | Node

export interface Unit {
  graphite: Node
}

export type Subscriber<A> = {
  next?: (value: A) => void
}

export type Subscription = {
  /*::[[call]](): void,*/
  unsubscribe(): void
}

//prettier-ignore
export type Cmd =
  | Check
  | Run
  | Filter
  | Compute
  | Barrier
  | Mov

export type Mov = {
  id: ID
  type: 'mov'
  data: {
    from: 'value' | 'store' | 'stack' | 'a' | 'b'
    to: 'stack' | 'a' | 'b'
    store: any
    target: any
  }
  hasRef: boolean
}
export type Check = {
  id: ID
  type: 'check'
  data:
    | {
        type: 'defined'
      }
    | {
        type: 'changed'
        store: StateRef
      }
  hasRef: boolean
}

export type Barrier = {
  id: ID
  type: 'barrier'
  data: {
    barrierID: ID
    priority: 'barrier' | 'sampler'
  }
  hasRef: false
}

export type Run = {
  id: ID
  type: 'run'
  data: {
    fn: (data: any, scope: {[key: string]: any}, reg: {a: any}) => any
  }
  hasRef: false
}

export type Filter = {
  id: ID
  type: 'filter'
  data: {
    fn: (data: any, scope: {[key: string]: any}, reg: {a: any}) => boolean
  }
  hasRef: false
}
export type Compute = {
  id: ID
  type: 'compute'
  data: {
    fn: (data: any, scope: {[key: string]: any}, reg: {a: any}) => any
  }
  hasRef: false
}
