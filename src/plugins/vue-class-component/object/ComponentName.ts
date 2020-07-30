import { ASTConverter, ASTResultKind, ReferenceKind } from '../../types'
import ts from 'typescript'

export const convertObjName: ASTConverter<ts.PropertyAssignment> = (node) => {
  if (node.name.getText() === 'name') {
    return {
      tag: 'Obj-Name',
      kind: ASTResultKind.OBJECT,
      imports: [],
      reference: ReferenceKind.NONE,
      attrutibes: [],
      nodes: [
        node
      ] as ts.PropertyAssignment[]
    }
  }

  return false
}
