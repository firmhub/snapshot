import Communicator from './communicator'
import * as mocha from 'mocha'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
import * as socket from 'socket.io'
import st = require('st')

function createServer (template: string) {
  const serveStatic = st({
    path: path.resolve(__dirname, '../'),
    cache: false
  })

  return http.createServer(function basicServer (req, res) {
    if (req.method !== 'GET') return res.end()
    if (req.url !== '/') return serveStatic(req, res)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    fs.createReadStream(template).pipe(res)
  })
}

/*
 * Exports
 * - Run snapshot server in watch mode
 * - Normal spec reporter otherwise
 */

const watchMode = process.argv.indexOf('-w') > -1 || process.argv.indexOf('--watch') > -1

if (!watchMode) {
  module.exports = mocha.reporters.Spec
} else {
  const port = 3000
  const indexHtml = path.resolve(__dirname, '../index.html')
  const server = createServer(indexHtml)
  const io = socket(server)
  const communicator = Communicator(io, port)

  module.exports = function SnapshotReporter (runner: Mocha.IRunner) {
    const spec = new mocha.reporters.Spec(runner)
    communicator.listenTo(runner)
    return spec
  }

  server.listen(port)
  process.on('exit', () => server.close())
}
