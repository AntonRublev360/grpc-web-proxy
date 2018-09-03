'use strict'

function getGrpcRequestProxy (getGrpcClient) {
  let client

  async function connect (req, res, next) {
    const {
      address,
      credentials,
      options,
      pathToProtoFile,
      servicePath
    } = req.body
    client = await getGrpcClient({
      address,
      credentials,
      options,
      pathToProtoFile,
      servicePath
    })
    const methods = getMethodsDescriptions(client.definition)
    res.json({
      address,
      methods,
      pathToProtoFile,
      servicePath
    })
  }

  function disconnect (req, res, next) {
    client.client.close()
    client = null
  }

  async function handle (req, res, next) {
    const { methodName, params } = req.body
    if (!client) {
      next(new Error('Not connected. POST /connect to connect to a grpc service'))
    }
    try {
      const result = await makeUnaryCall(client.client, methodName, params)
      res.json({ result })
    } catch (err) {
      next(err)
    }
  }

  return {
    connect,
    disconnect,
    handle
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

module.exports = getGrpcRequestProxy
