import { Vc2cOptions } from './options'
import path from 'path'
import { log } from './debug'
import * as prettier from 'prettier/standalone'
import prettierTypescriptParser from 'prettier/parser-typescript'
import { existsFileSync } from './file'

export function format (content: string, options: Vc2cOptions): string {
  const isNode = typeof window === 'undefined'
  if (process.env.BROWSER || !isNode) {
    return prettier.format(content, {
      plugins: [prettierTypescriptParser],
      parser: 'typescript',
      semi: false,
      singleQuote: true
    })
  }
  const eslintConfigPath = path.resolve(options.root, options.eslintConfigFile)
  const prettierEslintOpions = (existsFileSync(eslintConfigPath))
    ? {
      text: content,
      filePath: eslintConfigPath,
      prettierOptions: {
        parser: 'typescript'
      },
      fallbackPrettierOptions: {
        parser: 'typescript'
      }
    }
    : {
      text: content,
      filePath: '',
      eslintConfig: {
        parser: require.resolve('@typescript-eslint/parser'),
        parserOptions: {
          sourceType: 'module',
          ecmaFeatures: {
            jsx: false
          }
        },
        rules: {
          semi: ['error', 'never'],
          'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'export' },
            { blankLine: 'always', prev: 'const', next: '*' },
            { blankLine: 'always', prev: '*', next: 'const' }
          ]
        }
      },
      prettierOptions: {
        parser: 'typescript',
        Semicolons: false,
        singleQuote: true
      },
      fallbackPrettierOptions: {
        parser: 'typescript',
        singleQuote: true,
        Semicolons: false
      }
    }

  log('Format result code.....')
  const prettierEslint = require('prettier-eslint')
  return prettierEslint(prettierEslintOpions)
}
