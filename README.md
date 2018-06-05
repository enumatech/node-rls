[![Build Status](https://travis-ci.org/enumatech/node-rls.svg?branch=master)](https://travis-ci.org/enumatech/node-rls)

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

## Documentation
You can build the documentation using jsdoc
``` shell
$ make
```
