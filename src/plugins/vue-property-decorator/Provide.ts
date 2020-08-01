import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { copySyntheticComments } from '../../utils'

const provideDecoratorName = 'Provide'

export const convertProvide: ASTConverter<ts.PropertyDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === provideDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    const provideKeyExpr: ts.Expression = (decoratorArguments.length > 0) ? decoratorArguments[0] : tsModule.createStringLiteral(node.name.getText())

    return {
      tag: 'Provide',
      kind: ASTResultKind.COMPOSITION,
      imports: [{
        named: ['provide'],
        external: (options.compatible) ? '@vue/composition-api' : 'vue'
      }],
      reference: ReferenceKind.NONE,
      attributes: [],
      nodes: [
        copySyntheticComments(
          tsModule,
          tsModule.createExpressionStatement(tsModule.createCall(
            tsModule.createIdentifier('provide'),
            undefined,
            [
              provideKeyExpr,
              ...(node.initializer) ? [node.initializer] : []
            ]
          )),
          node
        )
      ] as ts.Statement[]
    }
  }

  return false
}
