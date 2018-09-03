'use strict'
const getGrpcClient = require('./index')
const path = require('path')
const createTestGrpcServer = require('../test/grpcServer')

describe('grpcClient', () => {
  describe('constructor', () => {
    describe('with basic service definition', () => {
      let testServer, address, grpcClient
      const servicePath = 'SimpleTestService'
      const pathToProtoFile = path.join(__dirname, '../test/testProtoFiles/simpleTest.proto')

      beforeAll(async () => {
        testServer = await createTestGrpcServer({
          pathToProtoFile,
          servicePath
        })
        address = `0.0.0.0:${testServer.port}`
      })

      afterAll((done) => {
        testServer.server.stop((err) => {
          done(err)
        })
      })

      describe('if servicePath is not provided', () => {
        let err

        beforeAll(async () => {
          try {
            await getGrpcClient({ address, pathToProtoFile })
          } catch (error) {
            err = error
          }
        })

        it('throws error', () => {
          expect(err).toBeDefined()
        })
      })

      describe('with correct options', () => {
        beforeAll(async () => {
          const options = {
            address,
            pathToProtoFile,
            servicePath
          }
          grpcClient = await getGrpcClient(options)
        })

        afterAll(() => {
          grpcClient.client.close()
        })

        it('loads client from proto file path', () => {
          expect(grpcClient.client).toBeDefined()
          expect(grpcClient.client).toHaveProperty('getTestMessage')
        })

        it('executes grpc procedure calls', (done) => {
          const request = {
            message: 'test'
          }
          grpcClient.client.getTestMessage(request, (err, result) => {
            expect(result).toEqual(request)
            done(err)
          })
        })
      })
    })

    describe('proto file path with package and imports', () => {
      let testServer, address, grpcClient
      const servicePath = 'test.v0.TestService'
      const pathToProtoFile = path.join(__dirname, '../test/testProtoFiles/test.proto')

      beforeAll(async () => {
        testServer = await createTestGrpcServer({
          pathToProtoFile,
          servicePath
        })
        address = `0.0.0.0:${testServer.port}`
      })

      afterAll((done) => {
        testServer.server.stop((err) => {
          done(err)
        })
      })

      beforeAll(async () => {
        const options = {
          address,
          pathToProtoFile,
          servicePath
        }
        grpcClient = await getGrpcClient(options)
      })

      afterAll(() => {
        grpcClient.client.close()
      })

      it('loads client', async () => {
        expect(grpcClient.client).toBeDefined()
        expect(grpcClient.client).toHaveProperty('getTestMessage')
      })

      it('executes grpc procedure calls', (done) => {
        const request = {
          message: {
            title: 'test',
            details: 'test details'
          }
        }
        grpcClient.client.getTestMessage(request, (err, result) => {
          expect(result).toEqual(request)
          done(err)
        })
      })
    })
  })
})
