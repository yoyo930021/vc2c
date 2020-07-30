import { getSingleFileProgram } from './parser'
import { convertAST } from './convert'
import { InputVc2cOptions, getDefaultVc2cOptions, mergeVc2cOptions } from './options'
import { format } from './format'
import path from 'path'
import { readVueSFCOrTsFile, existsFileSync } from './file'
import { setDebugMode } from './debug'
import * as BuiltInPlugins from './plugins/builtIn'

export function convert (content: string, inputOptions: InputVc2cOptions): string {
  const options = mergeVc2cOptions(getDefaultVc2cOptions(inputOptions.typescript), inputOptions)
  const { ast, program } = getSingleFileProgram(content, options)

  return format(convertAST(ast, options, program), options)
}

export function convertFile (filePath: string, root: string, config: string) {
  if (process.env.BROWSER) {
    throw new Error('unsupported')
  }
  root = (typeof root === 'string')
    ? (
      path.isAbsolute(root) ? root : path.resolve(process.cwd(), root)
    )
    : process.cwd()
  config = (typeof config === 'string') ? config : '.vc2c.js'
  if (config.endsWith('.ts')) {
    require('ts-node/register')
  }
  const inputOptions: InputVc2cOptions = existsFileSync(path.resolve(root, config))
    ? require(path.resolve(root, config))
    : {}
  const options = mergeVc2cOptions(getDefaultVc2cOptions(inputOptions.typescript), inputOptions)
  options.root = root

  if (options.debug) {
    setDebugMode(true)
  }

  const file = readVueSFCOrTsFile(filePath, options)
  return {
    file,
    result: convert(file.content, options)
  }
}

export * from './plugins/types'
export { BuiltInPlugins }
export * from './utils'
export { getDefaultVc2cOptions, Vc2cOptions } from './options'
