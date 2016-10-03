import typescript from 'rollup-plugin-typescript'

export default {
  entry: 'src/browser.ts',
  dest: 'dist/browser.bundle.js',

  plugins: [
    typescript({ typescript: require('typescript') })
  ]
}
