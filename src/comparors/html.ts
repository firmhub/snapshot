import { pd } from 'pretty-data'
import { html } from 'js-beautify'

import compareText, { coerceToString } from './text'

function normalizeHTML (x: string) {
  return html(pd.xml(coerceToString(x)), {
    wrap_attributes: 'force',
    wrap_attributes_indent_size: 4
  })
}

export default function compareHTML (a: string, b: string) {
  const expected = normalizeHTML(a)
  const actual = normalizeHTML(b)
  return compareText(expected, actual)
}

