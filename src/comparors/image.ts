import * as jimp from 'jimp'
import { IComparison } from '../types'
import { coerceToBuffer } from '../utils'

interface IImageComparisonOptions {
  threshold?: number
}

function fmtPercent (n: number) {
  return `${Math.floor(n * 100)}%`
}

export default function compareImages (a: string, b: string, opts: IImageComparisonOptions = {}): Promise<IComparison | false> {
  const imageSources = [readImage(a), readImage(b)]

  return Promise.all(imageSources).then(function compare (images) {
    const expectedImage: jimp.Image = images[0]
    const actualImage: jimp.Image = images[1]
    const result = jimp.diff(expectedImage, actualImage)
    const distance = jimp.distance(expectedImage, actualImage)
    const threshold = opts.threshold || 0.05

    if (result.percent < threshold && distance < threshold) return Promise.resolve(false)

    const base64Data = [
      getBase64Data(expectedImage),
      getBase64Data(actualImage),
      getBase64Data(result.image)
    ]

    return Promise.all(base64Data).then(function compare ([expected, actual, diff]) {
      return {
        expected,
        actual,
        diff,
        toString () {
          return `${fmtPercent(result.percent)} difference; ${fmtPercent(distance)} perceptual distance`
        }
      }
    })
  })
}

export function readImage (x: string): Promise<jimp.Image> {
  if (typeof x === 'string' && x.slice(0, 10) === 'data:image') {
    return jimp.read(coerceToBuffer(x))
  } else {
    return jimp.read(x)
  }
}

function getBase64Data (image: jimp.Image): Promise<string> {
  return new Promise<string> (function exec (resolve, reject) {
    image.getBase64(image._originalMime || jimp.MIME_PNG, function cb (err, data) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}
