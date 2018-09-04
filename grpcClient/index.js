'use strict'
const protoLoader = require('@grpc/proto-loader')
const grpc = require('grpc')
const get = require('lodash/get')

module.exports = async function getGrpcClient ({
  address,
  pathToProtoFile,
  servicePath,
  options = {},
  credentials = grpc.credentials.createInsecure()
}) {
  if (!servicePath || !servicePath.length) {
    throw new Error('servicePath option is required. servicePath = `package.ServiceName`')
  }
  const packageDefinition = await protoLoader.load(pathToProtoFile, options)
  const packageObject = grpc.loadPackageDefinition(packageDefinition)
  const Client = get(packageObject, servicePath)
  const client = new Client(address, credentials, options)
  return { client, definition: Client.service }
}
