import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { isInternalHook, copySyntheticComments } from '../../utils'

export const convertIntervalHook: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  const intervalHookName = node.name.getText()

  if (isInternalHook(intervalHookName)) {
    const tsModule = options.typesciprt
    const removeIntervalHooks = ['created', 'beforeCreate']
    const needNamedImports = [`on${intervalHookName.slice(0, 1).toUpperCase()}${intervalHookName.slice(1)}`]
    if (removeIntervalHooks.includes(intervalHookName)) {
      needNamedImports.splice(0, 1)
    }

    const outputNode = (needNamedImports.length > 0)
      ? tsModule.createExpressionStatement(tsModule.createCall(
        tsModule.createIdentifier(needNamedImports[0]),
        undefined,
        [tsModule.createArrowFunction(
          undefined,
          undefined,
          [],
          undefined,
          tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
          node.body ?? tsModule.createBlock([])
        )]
      )) : node.body?.statements

    if (!outputNode) {
      return false
    }

    const nodes: ts.Statement[] = (needNamedImports.length > 0)
      ? [copySyntheticComments(tsModule, outputNode as ts.Statement, node)]
      : (outputNode as ts.NodeArray<ts.Statement>).map((el, index) => {
        if (index === 0) {
          return copySyntheticComments(tsModule, el, node)
        }
        return el
      })

    return {
      tag: 'IntervalHook',
      kind: ASTResultKind.COMPOSITION,
      attrutibes: (needNamedImports.length > 0) ? needNamedImports : [],
      imports: [{
        named: needNamedImports,
        external: (options.compatible) ? '@vue/composition-api' : 'vue'
      }],
      reference: ReferenceKind.NONE,
      nodes
    }
  }

  return false
}
