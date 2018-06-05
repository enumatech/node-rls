[![view on npm](http://img.shields.io/npm/v/node-rls.svg)](https://www.npmjs.org/package/node-rls)
[![Build Status](https://travis-ci.org/enumatech/node-rls.svg?branch=master)](https://travis-ci.org/enumatech/node-rls)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)

# `node-rls` - Request Local Storage for nodejs

`node-rls` Is a library for attaching metadata to a nodejs call stack.
It provides high-level key-value store style functions that are concurrency safe.

This can be extremely useful for logging where you want to attach metadata like request ids which you want to implicitly propagate to your logging function.

To accomplish this `node-rls` uses nodejs [async hooks](https://github.com/nodejs/node/blob/master/doc/api/async_hooks.md).
For more information see [node-continuation-local-storage](https://github.com/othiym23/node-continuation-local-storage) and [cls-hooked](https://github.com/jeff-lewis/cls-hooked).

## Installation
```shell
$ npm install node-rls
```

## Usage
``` javascript
const RLS = require('node-rls')

async function main () {
  await RLS.set('foo', 'bar')
  console.log(await RLS.get('foo'))
}

main().then(console.log).catch(err => {
  console.error(err)
  process.exit(1)
})
```
For more examples see the tests

## Using as an express middleware

In this example we attach a request id to incoming requests
```javascript
const RLSMiddleware = require('node-rls/middleware')
const RLS = require('node-rls')
const Express = require('express')
const UUID = require('uuid')

const app = Express()

// Initialize the context
app.use(RLSMiddleware.express)

// Attach the requestid to the request
app.use((req, res, next) => {
  const requestid = UUID.v4()
  RLS.set('requestid', requestid)
    .then(() => next())
  })

// Create an endpoint returning the request id
app.get('/', async function (req, res) {
  res.status(200).json({
    'requestid': await RLS.get('requestid')
  })
})
```

## API Reference

* [node-rls](#module_node-rls)
    * [.run(callback)](#module_node-rls.run) ⇒ <code>object</code>
    * [.get(key)](#module_node-rls.get) ⇒ <code>object</code>
    * [.set(key, value)](#module_node-rls.set) ⇒ <code>undefined</code>
    * [.delete(key)](#module_node-rls.delete) ⇒ <code>undefined</code>
    * [.update(obj)](#module_node-rls.update) ⇒ <code>undefined</code>
    * [.incr(key, count)](#module_node-rls.incr) ⇒ <code>undefined</code>
    * [.decr(key, count)](#module_node-rls.decr) ⇒ <code>undefined</code>

<a name="module_node-rls.run"></a>

### node-rls.run(callback) ⇒ <code>object</code>
Create a new context and run callback.

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  
**Returns**: <code>object</code> - Result from callback  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Async callback |

**Example**  
```js
// Any called function will have access to conext
// even async ones

function func () {
  return RLS.get('requestid')
}

RLS.run(async () => {
  const requestid = 'somerandomvalue'
  await RLS.set('requestid', requestid)

  assert.strictEqual(await func(), requestid)
})
```
<a name="module_node-rls.get"></a>

### node-rls.get(key) ⇒ <code>object</code>
Get object from storage.

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  
**Returns**: <code>object</code> - Stored object  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Storage key |

<a name="module_node-rls.set"></a>

### node-rls.set(key, value) ⇒ <code>undefined</code>
Set storage object

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  
**Returns**: <code>undefined</code> - Returns nothing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Storage key |
| value | <code>object</code> | Storage key |

<a name="module_node-rls.delete"></a>

### node-rls.delete(key) ⇒ <code>undefined</code>
Delete storage object

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  
**Returns**: <code>undefined</code> - Returns nothing  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Storage key |

<a name="module_node-rls.update"></a>

### node-rls.update(obj) ⇒ <code>undefined</code>
Update storage from a map

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  
**Returns**: <code>undefined</code> - No return value  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | KV mapping object |

**Example**  
```js
// Update storage with all values from object
const obj = {foo: 'bar', someKey: 'someValue'}
await update(obj)
console.log(await get('foo'))  // Prints bar
```
<a name="module_node-rls.incr"></a>

### node-rls.incr(key, count) ⇒ <code>undefined</code>
Atomically increment a counter

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>object</code> | Storage key |
| count | <code>object</code> | Increment by count |

<a name="module_node-rls.decr"></a>

### node-rls.decr(key, count) ⇒ <code>undefined</code>
Atomically decrement a counter

**Kind**: static method of [<code>node-rls</code>](#module_node-rls)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>object</code> | Storage key |
| count | <code>object</code> | Decrement by count |

