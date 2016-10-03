declare interface VNode {
  attrs: any
  state: any
}

declare namespace Mithril {
  interface Hooks {
    oninit?: (vnode: VNode) => void
  }

  interface Component extends Hooks {
    view: (vnode: VNode) => VNode | VNode[]
  }

  type Children = Array<VNode> | VNode | string
}

declare interface m {
  (tag: string | Mithril.Component, attrs?: Object, children?: Mithril.Children): VNode
  mount (element: Element, component: Mithril.Component): void
  prop <a> (value?: a): (update?: a) => a
  redraw (): void
  trust (html: string): VNode
}

declare const m: m
