declare module "difflib" {
  type lines = string[]
  type isoDateString = string

  interface options {
    fromFile?: string
    toFile?: string
    fromfiledate?: isoDateString
    tofiledate?: isoDateString
    lineterm?: string
  }

  export function unifiedDiff (expected: lines, actual: lines, options?: options): lines
}
