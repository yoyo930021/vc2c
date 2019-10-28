import { ASTConverter, ASTResultKind, ASTTransform, ReferenceKind } from '../types'
import * as ts from 'typescript'

export const convertName: ASTConverter<ts.Identifier> = (node, options) => {
  const tsModule = options.typesciprt
  return {
    tag: 'Class-Name',
    kind: ASTResultKind.OBJECT,
    imports: [],
    reference: ReferenceKind.NONE,
    attrutibes: [],
    nodes: [
      tsModule.createPropertyAssignment(
        tsModule.createIdentifier('name'),
        tsModule.createStringLiteral(node.getText())
      )
    ]
  }
}

export const mergeName: ASTTransform = (astResults) => {
  const nameTags = ['Class-Name', 'Obj-Name']

  const nameASTResults = astResults.filter((el) => nameTags.includes(el.tag))
  const otherASTResults = astResults.filter((el) => !nameTags.includes(el.tag))

  const resultNameASTResults = (nameASTResults.length === 1)
    ? {
      tag: 'Name',
      kind: ASTResultKind.OBJECT,
      imports: [],
      reference: ReferenceKind.NONE,
      attrutibes: [],
      nodes: nameASTResults[0].nodes as ts.PropertyAssignment[]
    }
    : {
      tag: 'Name',
      kind: ASTResultKind.OBJECT,
      imports: [],
      reference: ReferenceKind.NONE,
      attrutibes: [],
      nodes: nameASTResults.find((el) => el.tag === 'Obj-Name')!.nodes as ts.PropertyAssignment[]
    }

  return [
    resultNameASTResults,
    ...otherASTResults
  ]
}
