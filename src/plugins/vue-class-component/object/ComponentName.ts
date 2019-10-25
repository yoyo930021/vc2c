import { ASTConverter, ASTResultKind } from '../../types'
import * as ts from 'typescript'

export const convertObjName: ASTConverter<ts.PropertyAssignment> = (node) => {
  if (node.name.getText() === 'name') {
    return {
      tag: 'Obj-Name',
      kind: ASTResultKind.OBJECT,
      imports: [],
      attrutibes: [],
      nodes: [
        node
      ] as ts.PropertyAssignment[]
    }
  }

  return false
}
