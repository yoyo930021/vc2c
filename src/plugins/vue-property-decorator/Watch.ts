import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { copySyntheticComments, createIdentifier } from '../../utils'

const watchDecoratorName = 'Watch'

export const convertWatch: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === watchDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    if (decoratorArguments.length > 1) {
      const keyName = (decoratorArguments[0] as ts.StringLiteral).text
      const watchArguments = decoratorArguments[1]
      const method = tsModule.createArrowFunction(
        node.modifiers,
        node.typeParameters,
        node.parameters,
        node.type,
        tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
        node.body ?? tsModule.createBlock([], false)
      )
      const watchOptions: ts.PropertyAssignment[] = []
      if (tsModule.isObjectLiteralExpression(watchArguments)) {
        watchArguments.properties.forEach((el) => {
          if (!tsModule.isPropertyAssignment(el)) return
          watchOptions.push(el)
        })
      }

      return {
        tag: 'Watch',
        kind: ASTResultKind.COMPOSITION,
        imports: [{
          named: ['watch'],
          external: (options.compatible) ? '@vue/composition-api' : 'vue'
        }],
        reference: ReferenceKind.VARIABLE,
        attributes: [keyName],
        nodes: [
          tsModule.createExpressionStatement(
            copySyntheticComments(
              tsModule,
              tsModule.createCall(
                tsModule.createIdentifier('watch'),
                undefined,
                [
                  tsModule.createPropertyAccess(
                    tsModule.createThis(),
                    createIdentifier(tsModule, keyName)
                  ),
                  method,
                  tsModule.createObjectLiteral(watchOptions)
                ]
              ),
              node
            )
          )
        ] as ts.Statement[]
      }
    }
  }

  return false
}
