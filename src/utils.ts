import { ISnapshotTest } from './types'
import * as path from 'path'

export function getSnapshotPath (test: ISnapshotTest) {
  const testDir: String = path.dirname(test.file)
  return path.join(testDir, 'snapshots', test.snapshot.name)
}

export function coerceToBuffer (data: string): Buffer {
  const base64Prefix = /^data:image.+?base64,\s?/
  if (base64Prefix.test(data)) {
    return new Buffer(data.replace(base64Prefix, ''), 'base64')
  } else {
    return new Buffer(data, 'utf-8')
  }
}
