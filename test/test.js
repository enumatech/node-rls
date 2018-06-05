/* eslint-env mocha */

const expect = require('chai').expect
const RLS = require('../index.js')

describe('Test getters/setters', () => {
  it('Can set/get', async () => RLS.run(async () => {
    await RLS.set('aoeu', 'bar')
    expect(await RLS.get('aoeu')).equal('bar')
  }))

  it('Can get/set concurrently', async () => RLS.run(async () => {
    const n = 200
    for (let i = 0; i <= n; i++) {
      RLS.set('ctr', i)
    }
    expect(await RLS.get('ctr')).equal(n)
  }))

  it('Can update', async () => RLS.run(async () => {
    const obj = {
      'foo': 'bar',
      'baz': 'foo'
    }

    await RLS.update(obj)
    expect(await RLS.get('foo')).equal('bar')
    expect(await RLS.get('baz')).equal('foo')
  }))

  it('Can delete', async () => RLS.run(async () => {
    await RLS.set('foo', 'bar')
    await RLS.delete('foo')
    expect(await RLS.get('foo')).equal(undefined)
  }))

  context('Increment & decrement', () => {
    it('Cannot increment if value was NaN', async () => RLS.run(async () => {
      await RLS.set('ctr', 'aoeu')

      try {
        await RLS.incr('ctr', 1)
        // Throw dummy error to always reach catch block
        throw new Error('Dummy error')
      } catch (err) {
        expect(err.message).equal("Counter is not a number, was 'string'")
      }
    }))

    it('Cannot decrement if value was NaN', async () => RLS.run(async () => {
      await RLS.set('ctr', 'aoeu')

      try {
        await RLS.decr('ctr')
        // Throw dummy error to always reach catch block
        throw new Error('Dummy error')
      } catch (err) {
        expect(err.message).equal("Counter is not a number, was 'string'")
      }
    }))

    it('Can decrement', async () => RLS.run(async () => {
      const n = 200
      let promises = []

      RLS.set('ctr', n)
      for (let i = n; i > 0; i--) {
        promises.push(RLS.decr('ctr'))
      }

      await Promise.all(promises)

      expect(await RLS.get('ctr')).equal(0)
    }))

    it('Can increment', async () => RLS.run(async () => {
      const n = 200
      let promises = []

      for (let i = 0; i <= n; i++) {
        promises.push(RLS.incr('ctr'))
      }

      await Promise.all(promises)

      expect(await RLS.get('ctr')).equal(n + 1)
    }))
  })
})
