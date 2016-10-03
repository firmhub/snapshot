import * as fs from 'fs'
import * as path from 'path'

import { compare } from './comparors/index'
import { getSnapshotPath } from './utils'

import {
  ESnapshotType,
  IComparison
} from './types'

type EMPTY = null
type CONTENTS = Buffer | EMPTY

class SnapshotMismatchError extends Error {
  format: ESnapshotType

  constructor (name: string, message: string, props: Object) {
    super(`Snapshot mismatch [${name}]: ${message}`)
    Object.assign(this, props)
    this.name = name
    this.message = message
    this.format = getSnapshotType(path.extname(name).replace('.', ''))
  }
}

export default function testFactory (name: string, resultFn: Function): () => Promise<void> {
  return function mochaTest () {
    const test = this.test
    test.snapshot = { name }

    const snapshotPath = getSnapshotPath(this.test)
    const snapshotExt = path.extname(name).replace('.', '')

    function createComparison ([expected, actual]: [any, any]) {
      if (actual === void 0) throw testResultWasUndefined()
      if (!actual && !expected) throw testResultAndSnapshotAreEmpty()
      if (!actual) throw new SnapshotMismatchError(name, 'Empty result', { expected })
      if (!expected) throw new SnapshotMismatchError(name, 'New snapshot', { actual })

      test.snapshot.expected = expected || ''
      test.snapshot.actual = actual || ''

      return compare(snapshotExt, test.snapshot.expected, test.snapshot.actual)
    }

    function analyseResult (comparison: IComparison | false) {
      if (comparison) throw new SnapshotMismatchError(name, comparison.toString(), comparison)
    }

    return Promise
      .all([read(snapshotPath), run(resultFn, this)])
      .then(createComparison)
      .then(analyseResult)
  }
}

function run (fn: Function, ctx: any) {
  if (!fn.length) return Promise.resolve(fn.call(ctx))

  return new Promise(function exec (resolve, reject) {
    fn.call(ctx, function callback (err: any, result: any) {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

function read (filepath: string): Promise<CONTENTS> {
  return new Promise<CONTENTS> ((resolve, reject) => {
    fs.readFile(filepath, (err, buf) => {
      // When file not found; set contents to Empty
      if (err && /ENOENT/.test(err.message)) return resolve(null)
      // Reject (read failure) on all other errors
      if (err) return reject(err)
      // Success
      return resolve(buf)
    })
  })
}

function getSnapshotType (ext: string): ESnapshotType {
  if (ext === 'png' || ext === 'jpg' || ext === 'png') return ESnapshotType.image
  return ESnapshotType.text
}

function testResultWasUndefined () {
  return new Error(`Result of snapshot test was undefined`)
}

function testResultAndSnapshotAreEmpty () {
  return new Error(`Test result and the snapshot on disk was empty; nothing to compare`)
}
