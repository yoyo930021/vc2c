import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { isPrimitiveType, copySyntheticComments, removeComments } from '../../utils'

export const convertData: ASTConverter<ts.PropertyDeclaration> = (node, options, program) => {
  if (!node.initializer) {
    return false
  }
  const tsModule = options.typescript
  const dataName = node.name.getText()

  const checker = program.getTypeChecker()
  const isRef = isPrimitiveType(tsModule, checker.getTypeAtLocation(node.initializer))

  const tag = (isRef) ? 'Data-ref' : 'Data-reactive'
  const named = (isRef) ? ['ref'] : ['reactive']
  const callExpr = (isRef)
    ? tsModule.createCall(
      tsModule.createIdentifier('ref'),
      undefined,
      [removeComments(tsModule, node.initializer)]
    )
    : tsModule.createCall(
      tsModule.createIdentifier('reactive'),
      undefined,
      [removeComments(tsModule, node.initializer)]
    )

  return {
    tag,
    kind: ASTResultKind.COMPOSITION,
    imports: [{
      named,
      external: (options.compatible) ? '@vue/composition-api' : 'vue'
    }],
    reference: (isRef) ? ReferenceKind.VARIABLE_VALUE : ReferenceKind.VARIABLE,
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
