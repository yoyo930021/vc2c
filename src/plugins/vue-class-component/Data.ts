import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { isPrimitiveType, copySyntheticComments } from '../../utils'

export const convertData: ASTConverter<ts.PropertyDeclaration> = (node, options, program) => {
  if (!node.initializer) {
    return false
  }
  const tsModule = options.typesciprt
  const dataName = node.name.getText()

  const checker = program.getTypeChecker()
  const isRef = isPrimitiveType(tsModule, checker.getTypeAtLocation(node.initializer))

  const tag = (isRef) ? 'Data-ref' : 'Data-reactive'
  const named = (isRef) ? ['ref'] : ['reactive']
  const callExpr = (isRef)
    ? tsModule.createCall(
      tsModule.createIdentifier('ref'),
      undefined,
      [tsModule.createStringLiteral((node.initializer as ts.StringLiteral).text)]
    )
    : tsModule.createCall(
      tsModule.createIdentifier('reactive'),
      undefined,
      [tsModule.createStringLiteral((node.initializer as ts.StringLiteral).text)]
    )

  return {
    tag,
    kind: ASTResultKind.COMPOSITION,
    imports: [{
      named,
      external: (options.compatible) ? '@vue/composition-api' : 'vue'
    }],
    reference: (isRef) ? ReferenceKind.VARIABLE_VALUE : ReferenceKind.VARIABLE,
    attrutibes: [dataName],
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
          tsModule.NodeFlags.Const),
        ),
        node
      )
    ] as ts.Statement[]
  }
}
