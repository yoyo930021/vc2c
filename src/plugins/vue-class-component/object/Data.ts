import { ASTConverter, ASTResultKind } from '../../types'
import * as ts from 'typescript'

export const convertObjData: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  if (node.name.getText() === 'data') {
    const tsModule = options.typesciprt
    const returnStatement = node.body!.statements.find((el) => tsModule.isReturnStatement(el)) as ts.ReturnStatement
    const attrutibes = (returnStatement.expression! as ts.ObjectLiteralExpression).properties.map((el) => el.name!.getText())
    const arrowFn = tsModule.createArrowFunction(
      node.modifiers,
      [],
      [],
      undefined,
      tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
      tsModule.createBlock(
        node.body!.statements.map((el) => {
          if (tsModule.isReturnStatement(el)) {
            return tsModule.createReturn(
              tsModule.createCall(
                tsModule.createIdentifier('toRefs'),
                undefined,
                [tsModule.createCall(
                  tsModule.createIdentifier('reactive'),
                  undefined,
                  [returnStatement.expression!]
                )]
              )
            )
          }
          return el
        }),
        true
      )
    )

    return {
      tag: 'Data-ref',
      kind: ASTResultKind.COMPOSITION,
      imports: [{
        named: ['reactive', 'toRefs'],
        external: (options.compatible) ? '@vue/composition-api' : 'vue'
      }],
      attrutibes,
      nodes: [
        tsModule.createVariableStatement(
          undefined,
          tsModule.createVariableDeclarationList(
            [tsModule.createVariableDeclaration(
              tsModule.createObjectBindingPattern(
                attrutibes.map((el) => tsModule.createBindingElement(
                  undefined,
                  undefined,
                  tsModule.createIdentifier(el),
                  undefined
                ))
              ),
              undefined,
              tsModule.createCall(
                tsModule.createParen(arrowFn),
                undefined,
                []
              )
            )]
            ,
            tsModule.NodeFlags.Const
          )
        )
      ] as ts.Statement[]
    }
  }

  return false
}
