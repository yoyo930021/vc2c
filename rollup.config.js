import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import typescript from 'rollup-plugin-typescript2'

const pluginTypeScript = typescript({
  useTsconfigDeclarationDir: true,
  tsconfig: 'tsconfig.compile.json'
})
const pluginJson = json()
const pluginCommonJs = commonjs()

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    plugins: [pluginJson, pluginCommonJs, pluginTypeScript]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'es'
    },
    plugins: [pluginJson, pluginTypeScript]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.browser.mjs',
      format: 'es'
    },
    plugins: [replace({ 'process.env.BROWSER': 'true' }), pluginJson, pluginTypeScript]
  },
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.js',
      format: 'cjs'
    },
    plugins: [pluginJson, pluginCommonJs, pluginTypeScript]
  }
]
