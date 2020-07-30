import ts from 'typescript'
import { getDecoratorNames, getDefaultExportNode } from './utils'
import { runPlugins } from './plugins'
import { Vc2cOptions } from './options'
import { log } from './debug'

const vueClassModules = [
  'vue-class-component',
  'vue-property-decorator'
]

export function convertAST (sourceFile: ts.SourceFile, options: Vc2cOptions, program: ts.Program) {
  const tsModule = options.typescript

  log('check vue class libaray')
  const vueClassModuleImportStatement = sourceFile.statements
    .find((statement) => {
      if (tsModule.isImportDeclaration(statement)) {
        if (vueClassModules.includes((statement.moduleSpecifier as ts.StringLiteral).text)) {
          return true
        }
      }
      return false
    })
  if (!vueClassModuleImportStatement) {
    throw new Error('no vue class libaray in this file.')
  }

  log('check default export class')
  const defaultExportNode = getDefaultExportNode(options.typescript, sourceFile)
  if (!defaultExportNode) {
    throw new Error('no default export class')
  }

  const otherStatements = sourceFile.statements
    .map((el) => el)
    .filter((el) =>
      !((tsModule.isClassDeclaration(el) && getDecoratorNames(el).includes('Component')) ||
      (tsModule.isImportDeclaration(el) && vueClassModules.includes((el.moduleSpecifier as ts.StringLiteral).text)) ||
      (tsModule.isImportDeclaration(el) && (el.moduleSpecifier as ts.StringLiteral).text === 'vue'))
    )

  let resultStatements = [
    ...otherStatements,
    ...runPlugins(defaultExportNode, options, program)
  ]

  resultStatements = [
    ...resultStatements.filter((el) => tsModule.isImportDeclaration(el)),
    ...resultStatements.filter((el) => !tsModule.isImportDeclaration(el))
  ]

  log('output result code')
  const printer = tsModule.createPrinter()
  const result = printer.printFile(tsModule.updateSourceFileNode(sourceFile, resultStatements))

  return result
}
