import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'
import { copySyntheticComments } from '../../utils'

const emitDecoratorName = 'Emit'

// Code copied from Vue/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g
const hyphenate = (str: string) => str.replace(hyphenateRE, '-$1').toLowerCase()

export const convertEmitMethod: ASTConverter<ts.MethodDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === emitDecoratorName)
  if (decorator) {
    const tsModule = options.typesciprt
    const methodName = node.name.getText()

    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    const eventName = decoratorArguments.length > 0 && ts.isStringLiteral(decoratorArguments[0]) ? (decoratorArguments[0] as ts.StringLiteral).text : undefined

    const createEmit = (event: string, expressions: ts.Expression[]) => tsModule.createExpressionStatement(tsModule.createCall(
      tsModule.createPropertyAccess(
        tsModule.createIdentifier('context'),
        tsModule.createIdentifier('emit'),
      ),
      undefined,
      [
        tsModule.createStringLiteral(hyphenate(methodName)),
        ...expressions
      ]
    ))

    const valueIdentifier = (node.parameters.length > 0) ? tsModule.createIdentifier(node.parameters[0].name.getText()) : undefined

    let haveResult = false
    const transformer: () => ts.TransformerFactory<ts.Statement> = () => {
      return (context) => {
        const deepVisitor: ts.Visitor = (node) => {
          if (tsModule.isReturnStatement(node)) {
            haveResult = true
            return createEmit(eventName || hyphenate(methodName), [node.expression!].concat((valueIdentifier) ? [valueIdentifier] : []))
          }
          return tsModule.visitEachChild(node, deepVisitor, context)
        }

        return (node) => tsModule.visitNode(node, deepVisitor)
      }
    }

    const originalBodyStatements = (node.body) ? node.body.statements : tsModule.createNodeArray([])
    let bodyStatements = tsModule.transform(
      originalBodyStatements.map((el) => el),
      [transformer()],
      { module: tsModule.ModuleKind.ESNext }
    ).transformed
    if (!haveResult) {
      bodyStatements = [
        ...originalBodyStatements,
        createEmit(eventName || hyphenate(methodName), (valueIdentifier) ? [valueIdentifier] : [])
      ]
    }

    const outputMethod = tsModule.createArrowFunction(
      node.modifiers,
      node.typeParameters,
      node.parameters,
      node.type,
      tsModule.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
      tsModule.createBlock(
        bodyStatements,
        true
      )
    )

    return {
      tag: 'Emit',
      kind: ASTResultKind.COMPOSITION,
      imports: [],
      reference: ReferenceKind.VARIABLE,
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

  return false
}
