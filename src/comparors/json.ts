import { pd } from 'pretty-data'

import compareText from './text'

function coerceToJson (x: any): Object {
  if (x instanceof Buffer) return JSON.parse(x.toString())
  if (typeof x === 'string') return JSON.parse(x)
  return x
}

export default function compareJSON (a: any, b: any) {
  const expected = pd.json(coerceToJson(a))
  const actual = pd.json(coerceToJson(b))
  return compareText(expected, actual)
}
