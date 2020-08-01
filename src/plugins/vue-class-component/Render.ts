import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'

export const convertRender: ASTConverter<ts.MethodDeclaration> = (node) => {
  if (node.name.getText() !== 'render') {
    return false
  }
  return {
    tag: 'Render',
    kind: ASTResultKind.OBJECT,
    imports: [],
    reference: ReferenceKind.NONE,
    attributes: [],
    nodes: [
      node
    ]
  }
}
