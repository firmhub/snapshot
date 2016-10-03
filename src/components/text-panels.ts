/* globals Diff2Html */
import Panel from './panel'
import { IPanelMap, IFailureResult } from '../types'

type PanelMode = 'line-by-line' | 'side-by-side'

interface diffToHTMLOptions {
  mode?: PanelMode
  type?: 'old' | 'new' | 'deleted'
}

interface TextPanelVNode {
  attrs: { result: IFailureResult, onClick: () => void }
  state: { mode: PanelMode }
}

function diffToHTML (str: string, opts: diffToHTMLOptions = {}) {
  const withHeader = [
    `diff`,
    `${opts.type || 'old'} file mode 000000`,
    `--- snapshot`,
    `+++ snapshot`,
    str
  ].join('\n')

  const htmlString = Diff2Html.getPrettyHtml(withHeader, {
    outputFormat: opts.mode === 'side-by-side' ? 'side-by-side' : 'line-by-line'
  })

  return m.trust(htmlString)
}

const TextPanels = {
  added ({ attrs }: TextPanelVNode) {
    return m(Panel, Object.assign({}, attrs, {
      variant: 'success',
      body: diffToHTML('@@ -1 +1 @@\n+' + attrs.result.actual.replace('\n', '\n+'), { type: 'new' })
    }))
  },

  removed ({ attrs }: TextPanelVNode) {
    return m(Panel, Object.assign({}, attrs, {
      variant: 'danger',
      body: diffToHTML('@@ -1 +1 @@\n-' + attrs.result.expected.replace('\n', '\n-'), { type: 'deleted' })
    }))
  },

  changed ({ attrs, state }: TextPanelVNode) {
    const result: IFailureResult = attrs.result

    const show = (mode: 'side-by-side' | 'line-by-line') => ({
      className: state.mode === mode ? 'active' : '',
      onclick () { state.mode = mode }
    })

    return m(Panel, Object.assign({}, attrs, {
      variant: 'default',
      body: diffToHTML(result.diff, { type: 'old', mode: state.mode }),
      buttons: m('nav.btn-group.btn-group-sm', [
        m('button.btn.btn-default', show('side-by-side'), 'Side-by-side'),
        m('button.btn.btn-default', show('line-by-line'), 'Line-by-line')
      ])
    }))
  }
}

function addHooks (src: any, hooks: Mithril.Hooks): IPanelMap {
  return Object.keys(src).reduce(function (dest: any, key: string) {
    dest[key] = Object.assign({ view: src[key] }, hooks)
    return dest
  }, {})
}

export default addHooks(TextPanels, {
  oninit ({ state }: TextPanelVNode) { state.mode = 'line-by-line' }
})
