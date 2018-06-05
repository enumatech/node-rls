/* eslint-env mocha */

const expect = require('chai').expect
const RLS = require('../index.js')
const RLSMiddleware = require('../middleware')

const Request = require('supertest')
const Express = require('express')
const UUID = require('uuid')

describe('Test middleware implementations', () => {
  it('Test express middleware', async () => {
    const app = Express()

    const requestid = UUID.v4()

    // Attach our middleware
    app.use(RLSMiddleware.express)

    // Attach the requestid to the request
    app.use((req, res, next) => {
      RLS.set('requestid', requestid).then(() => next())
    })

    // Echo endpoint
    app.get('/', async function (req, res) {
      res.status(200).json({
        'requestid': await RLS.get('requestid')
      })
    })

    let req = Request(app).get('/')
    req = req.set('Accept', 'application/json')

    const resp = await req
    expect(resp.status).equal(200)
    expect(resp.body.requestid).equal(requestid)
  })
})
