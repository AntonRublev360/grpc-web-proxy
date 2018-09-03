'use strict'
const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')
const get = require('lodash/get')
const options = {}

module.exports = async function startTestServer ({
  pathToProtoFile,
  servicePath
}) {
  const packageDefinition = await protoLoader.load(pathToProtoFile, options)
  const packageObject = grpc.loadPackageDefinition(packageDefinition)
  const server = new grpc.Server()
  const serviceDefinition = get(packageObject, servicePath)
  server.addProtoService(serviceDefinition.service, {
    getTestMessage,
    throwError
  })
  const port = server.bind('0.0.0.0:0', grpc.ServerCredentials.createInsecure())
  server.start()
  return {
    port,
    server
  }
}

function getTestMessage (call, callback) {
  callback(null, call.request)
}

function throwError (call, callback) {
  callback(new Error('test error'))
}
