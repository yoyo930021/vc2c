import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { copySyntheticComments } from '../../utils'

export const convertMethod: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  const tsModule = options.typescript
  const methodName = node.name.getText()

  const result = options.useFunctionDeclaration
    ? convertMethodAsFunctionDeclaration(tsModule, node)
    : convertMethodAsArrowFunction(tsModule, node)

  return {
    tag: 'Method',
    kind: ASTResultKind.COMPOSITION,
    imports: [],
    reference: ReferenceKind.VARIABLE,
    attributes: [methodName],
    nodes: [
      copySyntheticComments(
        tsModule,
        result,
        node
      )
    ] as ts.Statement[]
  }
}

const convertMethodAsFunctionDeclaration = (tsModule: typeof ts, node: ts.MethodDeclaration): ts.FunctionDeclaration => {
  return tsModule.createFunctionDeclaration(
    undefined,
    undefined,
    node.asteriskToken,
    node.name.getText(),
    node.typeParameters,
    node.parameters,
    node.type,
    node.body ?? tsModule.createBlock([])
  )
}

const convertMethodAsArrowFunction = (tsModule: typeof ts, node: ts.MethodDeclaration): ts.VariableStatement => {
  const methodName = node.name.getText()
  const outputMethod = tsModule.createArrowFunction(
    undefined,
    node.typeParameters,
    node.parameters,
    node.type,
    tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
    node.body ?? tsModule.createBlock([])
  )

  return tsModule.createVariableStatement(
    undefined,
    tsModule.createVariableDeclarationList([
      tsModule.createVariableDeclaration(
        tsModule.createIdentifier(methodName),
        undefined,
        outputMethod
      )
    ],
    tsModule.NodeFlags.Const)
  )
}
