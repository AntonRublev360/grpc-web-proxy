'use strict'
const createServer = require('./server')
const log = require('./mocks/logMock')
const supertest = require('supertest')

describe('server', () => {
  let server
  const config = {
    name: 'grpc-web-ui-test',
    port: 0
  }

  beforeAll(async () => {
    jest.clearAllMocks()
    server = await createServer({
      config,
      dev: false,
      log
    })
  })

  afterAll(() => {
    server.close()
  })

  it('starts up', () => {
    return supertest(server)
      .get('/')
      .expect(200)
  })
})
