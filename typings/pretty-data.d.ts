declare module "pretty-data" {
  export namespace pd {
    export function json (data: Object) : string
    export function xml (data: string) : string
  }
}
