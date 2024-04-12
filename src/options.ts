import ts from 'typescript'
import { ASTConvertPlugins } from './plugins/types'
import { getDefaultPlugins } from './plugins'
import * as vueTemplateCompiler from 'vue-template-compiler'

export interface Vc2cOptions {
  root: string
  debug: boolean
  compatible: boolean
  setupPropsKey: string
  setupContextKey: string
  useFunctionDeclaration: boolean
  typescript: typeof ts
  vueTemplateCompiler: typeof vueTemplateCompiler
  eslintConfigFile: string
  plugins: ASTConvertPlugins
}

export type InputVc2cOptions = Partial<Vc2cOptions>

export function getDefaultVc2cOptions (tsModule: typeof ts = ts): Vc2cOptions {
  return {
    root: process.cwd(),
    debug: false,
    compatible: false,
    setupPropsKey: 'props',
    setupContextKey: 'context',
    useFunctionDeclaration: false,
    typescript: tsModule,
    vueTemplateCompiler: vueTemplateCompiler,
    eslintConfigFile: '.eslintrc.js',
    plugins: getDefaultPlugins(tsModule)
  }
}

export function mergeVc2cOptions (original: Vc2cOptions, merged: InputVc2cOptions): Vc2cOptions {
  return {
    ...original,
    ...merged
  }
}
