import { ASTConverter, ASTResultKind } from '../types'
import * as ts from 'typescript'
import { copySyntheticComments } from '../../utils'

export const convertMethod: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  const tsModule = options.typesciprt
  const methodName = node.name.getText()

  const outputMethod = tsModule.createArrowFunction(
    node.modifiers,
    node.typeParameters,
    node.parameters,
    node.type,
    tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
    node.body!
  )

  return {
    tag: 'Method',
    kind: ASTResultKind.COMPOSITION,
    imports: [],
    attrutibes: [methodName],
    nodes: [
      copySyntheticComments(
        tsModule,
        tsModule.createVariableStatement(
          undefined,
          tsModule.createVariableDeclarationList([
            tsModule.createVariableDeclaration(
              tsModule.createIdentifier(methodName),
              undefined,
              outputMethod
            )
          ],
          tsModule.NodeFlags.Const),
        ),
        node
      )
    ] as ts.Statement[]
  }
}
