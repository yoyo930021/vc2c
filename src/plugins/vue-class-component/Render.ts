import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import * as ts from 'typescript'

export const convertRender: ASTConverter<ts.MethodDeclaration> = (node) => {
  if (node.name.getText() !== 'render') {
    return false
  }
  return {
    tag: 'Render',
    kind: ASTResultKind.OBJECT,
    imports: [],
    reference: ReferenceKind.NONE,
    attrutibes: [],
    nodes: [
      node
    ]
  }
}
