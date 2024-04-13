import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { copySyntheticComments, removeComments } from '../../utils'

export const convertData: ASTConverter<ts.PropertyDeclaration> = (node, options, program) => {
  if (!node.initializer) {
    return false
  }
  const tsModule = options.typescript
  const dataName = node.name.getText()

  const callExpr = tsModule.createCall(
    tsModule.createIdentifier('ref'),
    undefined,
    [removeComments(tsModule, node.initializer)]
  )

  return {
    tag: 'Data-ref',
    kind: ASTResultKind.COMPOSITION,
    imports: [{
      named: ['ref'],
      external: (options.compatible) ? '@vue/composition-api' : 'vue'
    }],
    reference: ReferenceKind.VARIABLE_VALUE,
    attributes: [dataName],
    nodes: [
      copySyntheticComments(
        tsModule,
        tsModule.createVariableStatement(
          undefined,
          tsModule.createVariableDeclarationList([
            tsModule.createVariableDeclaration(
              tsModule.createIdentifier(dataName),
              undefined,
              callExpr
            )
          ],
          tsModule.NodeFlags.Const)
        ),
        node
      )
    ] as ts.Statement[]
  }
}
