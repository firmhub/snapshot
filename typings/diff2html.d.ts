interface Configuration {
  outputFormat?: 'line-by-line' | 'side-by-side'
  matching?: 'none' | 'lines' | 'words'
}

interface Diff2Html {
  getPrettyHtml(input: any, opts?: Configuration): string
}

declare const Diff2Html: Diff2Html
