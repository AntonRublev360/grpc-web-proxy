'use strict'
const getGrpcRequestProxy = require('./index')
const path = require('path')

describe('grpcRequestProxy', () => {
  const mockGrpcClient = {
    client: {
      close: jest.fn(),
      getTestMessage: jest.fn(),
      throwError: jest.fn()
    },
    definition: {
      getTestMessage: { originalName: 'getTestMessage' },
      throwError: { originalName: 'throwError' }
    }
  }
  const mockGetGrpcClient = jest.fn()
  const grpcRequestProxy = getGrpcRequestProxy(mockGetGrpcClient)
  const reqForConnect = {
    body: {
      address: '0.0.0.0:0',
      pathToProtoFile: path.join(__dirname, '../test/testProtoFiles/simpleTest.proto'),
      servicePath: 'SimpleTestService'
    }
  }
  const res = {
    json: jest.fn(),
    send: jest.fn()
  }
  const next = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('connect', () => {
    it('creates grpcClient', async () => {
      mockGetGrpcClient.mockResolvedValue(mockGrpcClient)
      await grpcRequestProxy.connect(reqForConnect, res, next)
      expect(mockGetGrpcClient).toHaveBeenCalledWith(reqForConnect.body)
    })

    it('returns grpcClient description and methods', async () => {
      mockGetGrpcClient.mockResolvedValue(mockGrpcClient)
      await grpcRequestProxy.connect(reqForConnect, res, next)
      expect(res.json).toHaveBeenCalledWith({
        address: reqForConnect.body.address,
        pathToProtoFile: reqForConnect.body.pathToProtoFile,
        servicePath: reqForConnect.body.servicePath,
        methods: [
          { name: 'getTestMessage' },
          { name: 'throwError' }
        ]
      })
    })

    it('closes existing connection if exists', async () => {
      mockGetGrpcClient.mockResolvedValue(mockGrpcClient)
      await grpcRequestProxy.connect(reqForConnect, res, next)
      mockGrpcClient.client.close.mockClear()
      await grpcRequestProxy.connect(reqForConnect, res, next)
      expect(mockGrpcClient.client.close).toHaveBeenCalled()
    })

    it('calls next with error on error', async () => {
      await grpcRequestProxy.connect({}, res, next)
      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('disconnect', () => {
    beforeEach(async () => {
      mockGetGrpcClient.mockResolvedValue(mockGrpcClient)
      await grpcRequestProxy.connect(reqForConnect, res, next)
    })

    it('closes grpcClient', async () => {
      await grpcRequestProxy.disconnect({}, res, next)
      expect(mockGrpcClient.client.close).toHaveBeenCalled()
    })

    it('responds with 200', async () => {
      await grpcRequestProxy.disconnect({}, res, next)
      expect(res.send).toHaveBeenCalledWith(200)
    })

    it('does not throw error if connection is already closed', async () => {
      await grpcRequestProxy.disconnect({}, res, next)
      mockGrpcClient.client.close.mockClear()
      await grpcRequestProxy.disconnect({}, res, next)
      expect(mockGrpcClient.client.close).not.toHaveBeenCalled()
    })

    it('calls next with error on error', async () => {
      mockGrpcClient.client.close.mockImplementationOnce(() => {
        throw new Error('test error')
      })
      await grpcRequestProxy.disconnect({}, res, next)
      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  describe('getInfo', () => {
    beforeEach(async () => {
      mockGetGrpcClient.mockResolvedValue(mockGrpcClient)
      await grpcRequestProxy.connect(reqForConnect, res, next)
    })

    it('returns connected grpcClient description and methods', async () => {
      await grpcRequestProxy.getInfo({}, res, next)
      expect(res.json).toHaveBeenCalledWith({
        address: reqForConnect.body.address,
        pathToProtoFile: reqForConnect.body.pathToProtoFile,
        servicePath: reqForConnect.body.servicePath,
        methods: [
          { name: 'getTestMessage' },
          { name: 'throwError' }
        ]
      })
    })

    it('calls next with error on error', async () => {
      await grpcRequestProxy.disconnect({}, res, next)
      next.mockClear()
      await grpcRequestProxy.getInfo({}, res, next)
      expect(next).toHaveBeenCalledWith(expect.any(Error))
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
      mockGetGrpcClient.mockResolvedValue(mockGrpcClient)
      await grpcRequestProxy.connect(reqForConnect, res, next)
      mockGrpcClient.client.getTestMessage.mockImplementation((call, cb) => cb(null, params))
      mockGrpcClient.client.throwError.mockImplementation((call, cb) => cb(new Error('expected error')))
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
