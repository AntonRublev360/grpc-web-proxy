#!/usr/bin/env node
const { createLogger } = require('bunyan')
const config = require('./config')
const startServer = require('./server')
const dev = process.env.NODE_ENV !== 'production'
const log = createLogger(config.log)
const yargs = require('yargs')
  .alias('port', 'p')
  .argv

const updatedConfig = Object.assign({}, config, {
  port: yargs.port || config.port
})

startServer({
  config: updatedConfig,
  dev,
  log
})
  .catch((e) => {
    process.exit(1)
  })
