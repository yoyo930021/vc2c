import { ASTConverter, ASTResultKind, ASTTransform, ASTResultToObject, ReferenceKind } from '../types'
import ts from 'typescript'
import { copySyntheticComments } from '../../utils'

const propDecoratorName = 'Prop'

export const convertProp: ASTConverter<ts.PropertyDeclaration> = (node, options) => {
  if (!node.decorators) {
    return false
  }
  const decorator = node.decorators.find((el) => (el.expression as ts.CallExpression).expression.getText() === propDecoratorName)
  if (decorator) {
    const tsModule = options.typescript
    const decoratorArguments = (decorator.expression as ts.CallExpression).arguments
    if (decoratorArguments.length > 0) {
      const propName = node.name.getText()
      const propArguments = decoratorArguments[0]

      return {
        tag: 'Prop',
        kind: ASTResultKind.OBJECT,
        imports: [],
        reference: ReferenceKind.PROPS,
        attrutibes: [propName],
        nodes: [
          copySyntheticComments(
            tsModule,
            tsModule.createPropertyAssignment(
              tsModule.createIdentifier(propName),
              propArguments
            ),
            node
          )
        ]
      }
    }
  }

  return false
}
export const mergeProps: ASTTransform = (astResults, options) => {
  const tsModule = options.typescript
  const propTags = ['Prop', 'Model']

  const propASTResults = astResults.filter((el) => propTags.includes(el.tag))
  const otherASTResults = astResults.filter((el) => !propTags.includes(el.tag))
  const modelASTResult = astResults.find((el) => el.tag === 'Model')

  const mergeASTResult: ASTResultToObject = {
    tag: 'Prop',
    kind: ASTResultKind.OBJECT,
    imports: [],
    reference: ReferenceKind.PROPS,
    attrutibes: propASTResults.map((el) => el.attrutibes).reduce((array, el) => array.concat(el), []),
    nodes: [
      tsModule.createPropertyAssignment(
        tsModule.createIdentifier('props'),
        tsModule.createObjectLiteral(
          [
            ...propASTResults.map((el) => (el.tag === 'Prop') ? el.nodes : [el.nodes[1]])
              .reduce((array, el) => array.concat(el), [] as ts.ObjectLiteralElementLike[])
          ] as ts.ObjectLiteralElementLike[],
          true
        )
      )
    ]
  }

  return [
    ...(modelASTResult) ? [{
      ...modelASTResult,
      nodes: modelASTResult.nodes.slice(0, 1) as ts.PropertyAssignment[]
    }] : [],
    mergeASTResult,
    ...otherASTResults
  ]
}
