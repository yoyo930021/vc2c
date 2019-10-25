import { ASTTransform, ASTResult } from './types'
import * as ts from 'typescript'

export const removeThisAndSort: ASTTransform = (astResults, options) => {
  const tsModule = options.typesciprt
  const getVariables = (tags: string[]) => astResults
    .filter((el) => tags.includes(el.tag))
    .map((el) => el.attrutibes)
    .reduce((array, el) => array.concat(el), [])

  const refVariables = getVariables(['Data-ref', 'Computed'])
  const domeRefVariables = getVariables(['DomRef'])
  const propVariables = getVariables(['Prop'])
  const variables = getVariables(['Method', 'Emit', 'Data-reactive'])

  let dependents: string[] = []

  const transformer: () => ts.TransformerFactory<ts.Node> = () => {
    return (context) => {
      const removeThisVisitor: ts.Visitor = (node) => {
        if (tsModule.isPropertyAccessExpression(node)) {
          if (node.expression.kind === tsModule.SyntaxKind.ThisKeyword) {
            const propertyName = node.name.getText()
            if (refVariables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createPropertyAccess(
                tsModule.createIdentifier(propertyName),
                tsModule.createIdentifier('value')
              )
            } else if (domeRefVariables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createNonNullExpression(
                tsModule.createPropertyAccess(
                  tsModule.createIdentifier(propertyName),
                  tsModule.createIdentifier('value')
                )
              )
            } else if (propVariables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createPropertyAccess(
                tsModule.createIdentifier(options.setupPropsKey),
                tsModule.createIdentifier(propertyName)
              )
            } else if (variables.includes(propertyName)) {
              dependents.push(propertyName)
              return tsModule.createIdentifier(propertyName)
            } else {
              return tsModule.createPropertyAccess(
                tsModule.createIdentifier(options.setupContextKey),
                tsModule.createIdentifier(propertyName)
              )
            }
          }
          return tsModule.visitEachChild(node, removeThisVisitor, context)
        }
        return tsModule.visitEachChild(node, removeThisVisitor, context)
      }

      return (node) => tsModule.visitNode(node, removeThisVisitor)
    }
  }

  const transformResults = astResults.map((astResult) => {
    dependents = []
    const nodes = tsModule.transform(
      astResult.nodes,
      [transformer()],
      { module: tsModule.ModuleKind.ESNext }
    ).transformed

    const nodeDependents = dependents.slice()

    return {
      ...astResult,
      nodes,
      nodeDependents
    }
  })

  const astResultNoDependents = transformResults.filter((el) => el.nodeDependents.length === 0)
  let otherASTResults = transformResults.filter((el) => el.nodeDependents.length !== 0)
  let result: ASTResult<ts.Node>[] = [...astResultNoDependents]
  const resultHaveDependents = astResultNoDependents.map((el) => el.attrutibes).reduce((array, el) => array.concat(el), [])
  do {
    let hasPush = false
    otherASTResults = otherASTResults.filter((el) => {
      if (el.nodeDependents.every((dependent) => resultHaveDependents.includes(dependent))) {
        result.push(el)
        hasPush = true
        return false
      } else {
        return true
      }
    })
    if (!hasPush) {
      result = result.concat(otherASTResults)
      break
    }
  } while (result.length < astResults.length)

  return result
}
