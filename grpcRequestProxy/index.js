'use strict'

function getGrpcRequestProxy (getGrpcClient) {
  let connection

  async function connect (req, res, next) {
    try {
      disconnectIfConnected()
      const {
        address,
        credentials,
        options,
        pathToProtoFile,
        servicePath
      } = req.body
      const grpcClient = await getGrpcClient({
        address,
        credentials,
        options,
        pathToProtoFile,
        servicePath
      })
      connection = {
        client: grpcClient.client,
        description: {
          address,
          methods: getMethodsDescriptions(grpcClient.definition),
          pathToProtoFile,
          servicePath
        }
      }
      res.json(connection.description)
    } catch (err) {
      next(err)
    }
  }

  function disconnectIfConnected () {
    if (connection) {
      connection.client.close()
      connection = null
    }
  }

  function disconnect (req, res, next) {
    try {
      disconnectIfConnected()
      res.send(200)
    } catch (err) {
      next(err)
    }
  }

  async function getInfo (req, res, next) {
    if (!connection) {
      return next(getNotConnectedError())
    }
    res.json(connection.description)
  }

  async function handle (req, res, next) {
    const { methodName, params } = req.body
    if (!connection) {
      return next(getNotConnectedError())
    }
    try {
      const result = await makeUnaryCall(connection.client, methodName, params)
      res.json({ result })
    } catch (err) {
      next(err)
    }
  }

  return {
    connect,
    disconnect,
    handle,
    getInfo
  }
}

function getMethodsDescriptions (definition) {
  const getMethodDescription = (name) => ({ name: definition[name].originalName })
  return Object.keys(definition).map(getMethodDescription)
}

async function makeUnaryCall (client, method, params) {
  return new Promise((resolve, reject) => {
    client[method](params, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function getNotConnectedError () {
  return new Error('Not connected. POST /connect to connect to a grpc service')
}

module.exports = getGrpcRequestProxy
