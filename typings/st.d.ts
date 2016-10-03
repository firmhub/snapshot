declare module "st" {
  interface Options {
    path: string
    cache?: boolean
  }

  function server (options: Options): (req: Object, res: Object) => void
  export = server
}
