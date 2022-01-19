import {createDomain} from 'effector'

const domain = createDomain()
const foo = domain.domain()
const bar = domain.domain('baz')

const fooAlias = domain.createDomain()
const barAlias = domain.createDomain('bazAlias')

const {sid} = domain.createDomain()
const {name} = domain.createDomain('foo')
const {shortName} = domain.createDomain({name: 'foo'})

domain.createDomain()

domain.createDomain()
