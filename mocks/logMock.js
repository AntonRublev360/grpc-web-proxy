'use strict'
const levels = {
  FATAL: 'fatal',
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace'
}
module.exports = Object.values(levels).reduce(addMock, {})

function addMock (logMock, level) {
  logMock[level] = jest.fn()
  return logMock
}
