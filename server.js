const compression = require('compression')
const express = require('express')
// const favicon = require('serve-favicon')
const helmet = require('helmet')
const next = require('next')

module.exports = async function startServer ({ config, dev, log }) {
  log.info(`${config.name} is starting on port: ${config.port}`)
  try {
    const nextApp = next({ dev })
    await nextApp.prepare()
    const server = await initExpressServer({ config, log, nextApp })
    log.info(`${config.name} has started on port: ${config.port}`)
    return server
  } catch (err) {
    log.error(`${config.name} failed to start on port: ${config.port}`, err)
    throw err
  }
}

async function initExpressServer ({ config, log, nextApp }) {
  const expressApp = express()
  // expressApp.set('env', config.env)
  // expressApp.set('host', config.host)
  expressApp.set('port', config.port)
  configureMiddleware({ expressApp, log, config })
  configureRoutes({ expressApp, nextApp, config, log })
  const server = await listen(expressApp, config.port)
  return server
}

function listen (expressApp, port) {
  return new Promise((resolve, reject) => {
    const server = expressApp.listen(port, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(server)
      }
    })
  })
}

function configureMiddleware ({ expressApp, log, config }) {
  expressApp.use(helmet())
  // expressApp.use(loggerMiddleware(config, logger))
  // expressApp.use(favicon('./public/default_favicon.png'))
  expressApp.use(compression())
}

function configureRoutes ({ expressApp, nextApp }) {
  const nextJsRequestHandler = nextApp.getRequestHandler()
  expressApp.use(nextJsRequestHandler)
}
