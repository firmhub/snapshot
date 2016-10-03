import * as fs from 'fs'
import * as path from 'path'
import * as mkdirp from 'mkdirp'

import { getSnapshotPath, coerceToBuffer } from './utils'

import {
   ISnapshotTest,
   IFailure,
   IFailureResult,
} from './types'

function serialize (test: ISnapshotTest, ex: IFailure) : IFailureResult {
  return {
    snapshotFile: getSnapshotPath(test),
    key: getSnapshotPath(test),
    format: ex.format,
    expected: ex.expected,
    actual: ex.actual,
    diff: ex.diff,
    title: test.title,
    fullTitle: test.fullTitle(),
    testFile: test.file,
  }
}

function findIndexOfKey (arr: IFailureResult[], key: String) {
  for (let i = 0, n = arr.length; i < n; i++) {
    if (arr[i].key === key) return i
  }
  return -1
}

interface Communicator {
  listenTo (runner: Mocha.IRunner): void
}

interface Runner extends Mocha.IRunner {}
interface Runner extends NodeJS.EventEmitter {}

export default function ResultCommunicator (io: SocketIO.Server, port: number): Communicator {
  let failures: IFailureResult[] = []

  io.on('connection', function (socket: SocketIO.Socket) {
    socket.on('accept', acceptSnapshot)
    io.emit('init', failures)
  })

  function acceptSnapshot (id: string) {
    const index = findIndexOfKey(failures, id)
    const matchFound = index > -1
    if (!matchFound) return

    const failure = failures[index]

    // Create the directory if it does not exist
    mkdirp(path.dirname(id), (err: any) => {
      if (err) return io.emit('cannotAccept', { id, error: err, message: err.message })
      // Write the result to file
      fs.writeFile(id, coerceToBuffer(failure.actual), (err) => {
        if (err) return io.emit('cannotAccept', { id, error: err, message: err.message })
        return io.emit('accepted', { id })
      })
    })
  }

  return {
    listenTo (runner: Runner) {
      runner.on('start', function () {
        failures = []
        io.emit('start')
      })

      runner.on('fail', function (test: ISnapshotTest, ex: IFailure) {
        if (test.snapshot) {
          const failure = serialize(test, ex)
          failures.push(failure)
          io.emit('fail', failure)
        }
      })

      runner.on('end', function () {
        io.emit('end', failures.length)
        if (failures.length) {
          console.log(`View ${failures.length} snapshot failures at http://localhost:${port}`)
        }
      })
    }
  }
}

