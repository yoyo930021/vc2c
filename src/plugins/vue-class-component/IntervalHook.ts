import { ASTConverter, ASTResultKind } from '../types'
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
          node.body!
        )]
      )) : node.body!

    return {
      tag: 'IntervalHook',
      kind: ASTResultKind.COMPOSITION,
      attrutibes: [needNamedImports[0]],
      imports: [{
        named: needNamedImports,
        external: (options.compatible) ? '@vue/composition-api' : 'vue'
      }],
      nodes: [
        copySyntheticComments(tsModule, outputNode, node)
      ] as ts.Statement[]
    }
  }

  return false
}
