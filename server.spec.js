'use strict'
const createServer = require('./server')
const log = require('./mocks/logMock')
const supertest = require('supertest')
const path = require('path')
const createTestGrpcServer = require('./test/grpcServer')

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

  describe('grpc routes', () => {
    let testServer, connectBody, expectedConnectionResponse
    const servicePath = 'SimpleTestService'
    const pathToProtoFile = path.join(__dirname, './test/testProtoFiles/simpleTest.proto')

    beforeAll(async () => {
      testServer = await createTestGrpcServer({
        pathToProtoFile,
        servicePath
      })
      const address = `0.0.0.0:${testServer.port}`
      connectBody = {
        address,
        pathToProtoFile,
        servicePath
      }
      expectedConnectionResponse = {
        address,
        pathToProtoFile,
        servicePath,
        methods: [
          { name: 'getTestMessage' },
          { name: 'throwError' }
        ]
      }
    })

    afterAll((done) => {
      testServer.server.stop(done)
    })

    describe('POST /connect', () => {
      it('creates grpcClient and returns its description and methods', () => {
        return supertest(server)
          .post('/connect')
          .send(connectBody)
          .expect(200, expectedConnectionResponse)
      })
    })

    describe('POST /disconnect', () => {
      it('returns status 200', () => {
        return supertest(server)
          .post('/disconnect')
          .expect(200)
      })
    })

    describe('GET /connection', () => {
      it('returns connected grpcClient description and methods', async () => {
        await supertest(server)
          .post('/connect')
          .send(connectBody)
          .expect(200)
        return supertest(server)
          .get('/connection')
          .expect(200, expectedConnectionResponse)
      })
    })

    describe('POST /execute', () => {
      const params = {
        message: 'test message'
      }
      const body = {
        methodName: 'getTestMessage',
        params
      }

      beforeEach(() => {
        return supertest(server)
          .post('/connect')
          .send(connectBody)
          .expect(200)
      })

      afterEach(() => {
        return supertest(server)
          .post('/disconnect')
          .expect(200)
      })

      it('executes unary calls', () => {
        const expecterResult = {
          result: params
        }
        return supertest(server)
          .post('/execute')
          .send(body)
          .expect(200, expecterResult)
      })
    })
  })
})
