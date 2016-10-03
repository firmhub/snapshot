/* globals m, io */
import { ESnapshotType, IFailureResult, IPanelMap } from './types'
import TextPanels from './components/text-panels'
import ImagePanels from './components/image-panels'

;(function style (txt) {
  const css = document.createTextNode(txt)
  const tag = document.createElement('style')
  tag.type = 'text/css'
  tag.appendChild(css)
  document.querySelector('head').appendChild(tag)
})(`

.d2h-file-wrapper {
  border: none;
  border-radius: 0;
  margin-bottom: 0;
}

.d2h-file-diff {
  overflow-x: auto;
}

.d2h-file-header {
  display: none;
}

.snapshot-result.no-diff .d2h-file-diff {
  display: none;
}

.panel-body {
  padding: 0;
}

.panel-footer {
  background-color: transparent;
  border-top: 1px solid #eee;
}

.panel-heading {
  display: flex;
  position: relative;
  align-items: center;
}

.panel-heading .panel-title {
  flex: 1;
}

.panel-heading .btn-group {
}

.save-button {
  margin-left: 1rem;
}

`);

function getPanelType (panels: IPanelMap, result: IFailureResult) {
  if (!result.expected) return panels.added
  if (!result.actual) return panels.removed
  return panels.changed
}

function getPanel (result: IFailureResult): Mithril.Component {
  if (result.format === ESnapshotType.image) return getPanelType(ImagePanels, result)
  return getPanelType(TextPanels, result)
}

/* Helpers */

function kitchenSink (): IFailureResult[] {
  const result = (props: Object): IFailureResult => Object.assign({
    format: ESnapshotType.text,
    key: '',
    actual: ``,
    expected: '',
    diff: '',
    snapshotFile: '',
    title: '',
    fullTitle: '',
    testFile: ''
  }, props)

  return [
    result({
      key: 'text-added',
      actual: `Line one\nLine two`,
    }),
    result({
      key: 'text-removed',
      expected: `Line one\nLine two`
    }),
    result({
      key: 'text-changed',
      actual: `Line one\nLine two`,
      expected: 'Line one',
      diff: '@@ -1 +1 @@\n Line one\n+Line two'
    }),
    result({
      format: ESnapshotType.image,
      key: 'image-added',
      actual: `/test/fixtures/People.jpg`
    }),
    result({
      format: ESnapshotType.image,
      key: 'image-removed',
      expected: `/test/fixtures/People.jpg`
    }),
    result({
      format: ESnapshotType.image,
      key: 'image-changed',
      actual: `/test/fixtures/People.jpg`,
      expected: `/test/fixtures/People2.jpg`,
      diff: `/test/fixtures/PeopleDiff.png`
    }),
  ]
}

function queueRedraw (fn?: Function) {
  return function redraw () {
    if (fn) fn.apply(this, arguments)
    m.redraw()
  }
}

/* Render */

const results = m.prop<IFailureResult[]>([])

const App: Mithril.Component = {
  view () {
    return results().map(result => {
      return m(getPanel(result), {
        result,
        onAccept: () =>  socket.emit('accept', result.key)
      })
    })
  }
}

m.mount(document.querySelector('#app'), App)

declare const io : { (): SocketIO.Socket }
const socket = io()
socket.on('init', queueRedraw((failures: IFailureResult[]) => results(failures)))
socket.on('start', queueRedraw(() => results([])))
socket.on('fail', queueRedraw((failure: IFailureResult) => results(results().concat(failure))))
socket.on('end', queueRedraw())
