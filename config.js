const { stdSerializers } = require('bunyan')
const name = 'grpc-web-ui'
module.exports = require('rc')(name, {
  log: {
    name,
    serializers: stdSerializers,
    level: 'info'
  },
  name,
  port: 8080
})
