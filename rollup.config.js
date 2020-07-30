import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

const pluginTypeScript = typescript({ useTsconfigDeclarationDir: true })
const pluginJson = json()
const pluginResolve = nodeResolve()
const pluginCommonJs = commonjs()

export default [
  {
    input: 'src/index.ts',
    output: { file: 'dist/bundle.cjs.js', format: 'cjs' },
    plugins: [pluginJson, pluginResolve, pluginCommonJs, pluginTypeScript]
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/bundle.esm.js', format: 'es' },
    plugins: [pluginJson, pluginResolve, pluginTypeScript]
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.cjs.js', format: 'cjs' },
    plugins: [pluginJson, pluginCommonJs, pluginTypeScript]
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.esm.js', format: 'es' },
    plugins: [pluginJson, pluginTypeScript]
  }
]
