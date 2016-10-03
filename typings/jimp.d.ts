declare module "jimp" {
  export class Image {
    _originalMime: string
    getBase64 (mime: string, callback: (err: any, data: string) => void): void
  }

  interface Diff {
    percent: number
    image: Image
  }

  export const MIME_PNG: string
  export function read (source: string | Buffer): Promise<Image>
  export function diff (expected: Image, actual: Image): Diff
  export function distance (expected: Image, actual: Image): number
}
