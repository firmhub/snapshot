import Panel from './panel'
import { IPanelMap, IFailureResult } from '../types'

type PanelMode = 'actual' | 'diff' | 'expected'

interface ImagePanelVNode {
  attrs: { result: IFailureResult, onClick: () => void }
  state: { mode: PanelMode }
}

function getImageSource (result: IFailureResult, mode: PanelMode) {
  switch (mode) {
    case 'actual': return result.actual
    case 'expected': return result.expected
    case 'diff': return result.diff
  }
}

const ImagePanels = {
  added ({ attrs }: ImagePanelVNode) {
    return m(Panel, Object.assign({}, attrs, {
      variant: 'success',
      body: m('img', {
        style: { maxWidth: '100%', margin: '0 auto' },
        src: attrs.result.actual
      })
    }))
  },

  removed ({ attrs }: ImagePanelVNode) {
    return m(Panel, Object.assign({}, attrs, {
      variant: 'danger',
      body: m('img', {
        style: { maxWidth: '100%', margin: '0 auto' },
        src: attrs.result.expected
      })
    }))
  },

  changed ({ attrs, state }: ImagePanelVNode) {
    const show = (mode: PanelMode) => ({
      className: state.mode === mode ? 'active' : '',
      onclick () { state.mode = mode }
    })

    return m(Panel, Object.assign({}, attrs, {
      variant: 'default',
      body: m('img', {
        style: { maxWidth: '100%', margin: '0 auto' },
        src: getImageSource(attrs.result, state.mode)
      }),
      buttons: m('nav.btn-group.btn-group-sm', [
        m('button.btn.btn-default', show('expected'), 'Snapshot'),
        m('button.btn.btn-default', show('diff'), 'Differences'),
        m('button.btn.btn-default', show('actual'), 'Actual')
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

export default addHooks(ImagePanels, {
  oninit ({ state }: ImagePanelVNode) { state.mode = 'diff' }
})