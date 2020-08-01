import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { copySyntheticComments } from '../../utils'

const modelDecoratorName = 'Model'

export const convertModel: ASTConverter<ts.PropertyDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === modelDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    if (decoratorArguments.length > 1) {
      const eventName = (decoratorArguments[0] as ts.StringLiteral).text
      const propArguments = decoratorArguments[1]

      return {
        tag: 'Model',
        kind: ASTResultKind.OBJECT,
        imports: [],
        reference: ReferenceKind.NONE,
        attributes: [node.name.getText()],
        nodes: [
          copySyntheticComments(
            tsModule,
            tsModule.createPropertyAssignment(
              tsModule.createIdentifier('model'),
              tsModule.createObjectLiteral(
                [tsModule.createPropertyAssignment(
                  tsModule.createIdentifier('prop'),
                  tsModule.createStringLiteral(node.name.getText())
                ), tsModule.createPropertyAssignment(
                  tsModule.createIdentifier('event'),
                  tsModule.createStringLiteral(eventName)
                )],
                true
              )
            ),
            node
          ),
          tsModule.createPropertyAssignment(
            tsModule.createIdentifier(node.name.getText()),
            propArguments
          )
        ] as ts.PropertyAssignment[]
      }
    }
  }

  return false
}
