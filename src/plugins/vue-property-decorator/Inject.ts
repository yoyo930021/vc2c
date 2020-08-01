import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { copySyntheticComments } from '../../utils'

const injectDecoratorName = 'Inject'

export const convertInject: ASTConverter<ts.PropertyDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === injectDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    let injectKeyExpr: ts.Expression = tsModule.createStringLiteral(node.name.getText())
    let defaultValueExpr: ts.Expression | undefined
    if (decoratorArguments.length > 0) {
      const injectArgument = decoratorArguments[0]
      if (tsModule.isObjectLiteralExpression(injectArgument)) {
        const fromProperty = injectArgument.properties.find((el) => el.name?.getText() === 'from')
        if (fromProperty && tsModule.isPropertyAssignment(fromProperty)) {
          injectKeyExpr = fromProperty.initializer
        }
        const defaultProperty = injectArgument.properties.find((el) => el.name?.getText() === 'default')
        if (defaultProperty && tsModule.isPropertyAssignment(defaultProperty)) {
          defaultValueExpr = defaultProperty.initializer
        }
      } else {
        injectKeyExpr = injectArgument
      }
    }

    return {
      tag: 'Inject',
      kind: ASTResultKind.COMPOSITION,
      imports: [{
        named: ['inject'],
        external: (options.compatible) ? '@vue/composition-api' : 'vue'
      }],
      reference: ReferenceKind.VARIABLE,
      attributes: [node.name.getText()],
      nodes: [
        copySyntheticComments(
          tsModule,
          tsModule.createVariableStatement(
            undefined,
            tsModule.createVariableDeclarationList(
              [tsModule.createVariableDeclaration(
                tsModule.createIdentifier(node.name.getText()),
                undefined,
                tsModule.createCall(
                  tsModule.createIdentifier('inject'),
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (node.type) ? [tsModule.createKeywordTypeNode(node.type.kind as any)] : undefined,
                  [
                    injectKeyExpr,
                    ...(defaultValueExpr) ? [defaultValueExpr] : []
                  ]
                )
              )],
              tsModule.NodeFlags.Const
            )
          ),
          node
        )
      ] as ts.Statement[]
    }
  }

  return false
}
