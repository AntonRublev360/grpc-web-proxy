const { createLogger } = require('bunyan')
const config = require('./config')
const startServer = require('./server')
const dev = process.env.NODE_ENV !== 'production'
const log = createLogger(config.log)

startServer({ config, dev, log })
  .catch((e) => {
    process.exit(1)
  })
