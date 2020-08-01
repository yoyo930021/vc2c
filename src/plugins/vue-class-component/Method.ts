import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { copySyntheticComments } from '../../utils'

export const convertMethod: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  const tsModule = options.typescript
  const methodName = node.name.getText()

  const outputMethod = tsModule.createArrowFunction(
    node.modifiers,
    node.typeParameters,
    node.parameters,
    node.type,
    tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
    node.body ?? tsModule.createBlock([])
  )

  return {
    tag: 'Method',
    kind: ASTResultKind.COMPOSITION,
    imports: [],
    reference: ReferenceKind.VARIABLE,
    attributes: [methodName],
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
          tsModule.NodeFlags.Const)
        ),
        node
      )
    ] as ts.Statement[]
  }
}
