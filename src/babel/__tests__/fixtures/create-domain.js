import {createDomain} from 'effector'

const domain = createDomain()
const foo = createDomain('bar')

const {sid} = createDomain()
const {name} = createDomain('foo')
const {shortName} = createDomain({name: 'foo'})

createDomain()

createDomain()

{
  const incorrect = createDomain()
  function createDomain() {}
}

{
  const createDomain = () => {}
  if (true) {
    const incorrect = createDomain()
  }
}
