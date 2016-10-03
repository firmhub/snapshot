import { IComparison } from '../types'

import { default as text } from './text'
import { default as json } from './json'
import { default as html } from './html'
import { default as image } from './image'

export function compare (ext: string, a: string, b: string, opts?: any): Promise<IComparison | false> {
  switch (ext) {
    case 'html': case 'htm': return Promise.resolve(html(a, b))
    case 'jpeg': case 'jpg': case 'png': return image(a, b, opts)
    case 'json': return Promise.resolve(json(a, b))
    default: return Promise.resolve(text(a, b))
  }
}
