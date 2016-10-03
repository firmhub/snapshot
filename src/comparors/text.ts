import { unifiedDiff } from 'difflib'

const metadataLines = 2
const bogusMetadata = {
  fromfile: 'Snapshot',
  tofile: 'Current',
  fromfiledate: '2005-01-26 23:30:50',
  tofiledate: '2010-04-02 10:20:52',
  lineterm: ''
}

export default function compareText (a: any, b: any) {
  const expected = coerceToString(a)
  const actual = coerceToString(b)

  const changes = unifiedDiff(expected.split('\n'), actual.split('\n'), bogusMetadata).slice(metadataLines)

  const count = changes.reduce(function (count, change) {
    if (change[0] === '+') count.added++
    if (change[0] === '-') count.removed++
    return count
  }, { added: 0, removed: 0 })

  if (!count.added && !count.removed) return null

  return {
    expected,
    actual,
    diff: changes.join('\n'),
    toString () {
      return `${count.added} additions; ${count.removed} removals`
    }
  }
}

export function coerceToString (x: any): string {
  if (!x) return ''
  if (typeof x === 'string') return x
  if (x.toString) return x.toString()
  return String(x)
}

export function isMultiline (str: string) {
  return /\n\r/.test(str)
}
