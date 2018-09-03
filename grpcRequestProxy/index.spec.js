'use strict'
const getGrpcRequestProxy = require('./index')
const path = require('path')
const createTestGrpcServer = require('../test/grpcServer')
const getGrpcClient = require('../grpcClient/index')

describe('grpcRequestProxy', () => {
  let testServer, address, reqForConnect
  const servicePath = 'SimpleTestService'
  const pathToProtoFile = path.join(__dirname, '../test/testProtoFiles/simpleTest.proto')
  const grpcRequestProxy = getGrpcRequestProxy(getGrpcClient)
  const res = {
    json: jest.fn()
  }
  const next = jest.fn()

  beforeAll(async () => {
    testServer = await createTestGrpcServer({
      pathToProtoFile,
      servicePath
    })
    address = `0.0.0.0:${testServer.port}`
    reqForConnect = {
      body: {
        address,
        pathToProtoFile,
        servicePath
      }
    }
  })

  afterAll((done) => {
    testServer.server.stop(done)
  })

  describe('connect', () => {
    it('creates grpcClient and returns its description and methods', async () => {
      await grpcRequestProxy.connect(reqForConnect, res, next)
      expect(res.json).toHaveBeenCalledWith({
        address,
        pathToProtoFile,
        servicePath,
        methods: [
          { name: 'getTestMessage' },
          { name: 'throwError' }
        ]
      })
    })
  })

  describe('handle', () => {
    const params = {
      message: 'test message'
    }
    const req = {
      body: {
        methodName: 'getTestMessage',
        params
      }
    }

    beforeEach(async () => {
      await grpcRequestProxy.connect(reqForConnect, res, next)
    })

    it('executes unary calls', async () => {
      await grpcRequestProxy.handle(req, res, next)
      expect(res.json).toHaveBeenCalledWith({
        result: params
      })
    })

    it('returns errors if not connected', async () => {
      await grpcRequestProxy.disconnect({}, res, next)
      await grpcRequestProxy.handle(req, res, next)
      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })

    it('returns errors from unary calls', async () => {
      const req = {
        body: {
          methodName: 'throwError',
          params
        }
      }
      await grpcRequestProxy.handle(req, res, next)
      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })

    xit('executes stream calls', () => {})

    xit('returns errors from stream calls', () => {})
  })
})
