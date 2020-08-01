import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { copySyntheticComments } from '../../utils'

const refDecoratorName = 'Ref'

export const convertDomRef: ASTConverter<ts.PropertyDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === refDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const refName = node.name.getText()

    return {
      tag: 'DomRef',
      kind: ASTResultKind.COMPOSITION,
      imports: [{
        named: ['ref'],
        external: (options.compatible) ? '@vue/composition-api' : 'vue'
      }],
      reference: ReferenceKind.VARIABLE_NON_NULL_VALUE,
      attributes: [refName],
      nodes: [
        copySyntheticComments(
          tsModule,
          tsModule.createVariableStatement(
            undefined,
            tsModule.createVariableDeclarationList([
              tsModule.createVariableDeclaration(
                tsModule.createIdentifier(refName),
                undefined,
                tsModule.createCall(
                  tsModule.createIdentifier('ref'),
                  node.type ? [node.type] : [],
                  [tsModule.createNull()]
                )
              )
            ],
            tsModule.NodeFlags.Const)
          ),
          node
        )
      ]
    }
  }

  return false
}
