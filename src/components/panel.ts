const Panel: Mithril.Component = {
  view ({ attrs }) {
    const result = attrs.result

    const acceptButton = {
      className: attrs.vairant === 'default' ? 'btn-primary' : `btn-${attrs.variant}`,
      onclick: attrs.onAccept
    }

    return m(`section.panel.panel-${attrs.variant}`, [
      m('header.panel-heading', [
        m('h1.panel-title', result.title || result.key),
        attrs.buttons || null,
        m('div.save-button.btn-group.btn-group-sm', [
          m(`button.btn`, acceptButton, 'Accept')
        ])
      ]),
      m('details.panel-body', attrs.body),
      m('footer.panel-footer', [
        m('div', [m('span.text-muted', 'Test:'), result.testFile]),
        m('div', [m('span.text-muted', 'Snapshot:'), result.key])
      ])
    ])
  }
}

export default Panel
