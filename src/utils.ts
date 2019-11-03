import * as vueTemplateParser from 'vue-template-compiler'
import * as ts from 'typescript'
import { ASTResult, ASTResultKind, ReferenceKind } from './plugins/types'
export function isVueFile (path: string) {
  return path.endsWith('.vue')
}
export function parseVueFile (vueTemplateParserModule: typeof vueTemplateParser, content: string) {
  return vueTemplateParserModule.parseComponent(content)
}

export function getNodeFromExportNode (tsModule: typeof ts, exportExpr: ts.Node) {
  switch (exportExpr.kind) {
    case tsModule.SyntaxKind.ClassDeclaration:
      return exportExpr as ts.ClassDeclaration
  }
  return undefined
}

export function getDefaultExportNode (tsModule: typeof ts, sourceFile: ts.SourceFile) {
  const exportStmts = sourceFile.statements.filter(
    st => st.kind === tsModule.SyntaxKind.ClassDeclaration
  )
  if (exportStmts.length === 0) {
    return undefined
  }
  const exportNode = (exportStmts[0] as ts.ClassDeclaration)

  return getNodeFromExportNode(tsModule, exportNode)
}

export function getDecoratorNames (node: ts.Node) {
  if (node.decorators) {
    return node.decorators.map((el) => {
      if (ts.isCallExpression(el.expression)) {
        return el.expression.expression.getText()
      } else {
        return el.expression.getText()
      }
    })
  }

  return []
}

export function isInternalHook (methodName: string) {
  const $internalHooks = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeDestroy',
    'destroyed',
    'beforeUpdate',
    'updated',
    'activated',
    'deactivated',
    'render',
    'errorCaptured', // 2.5
    'serverPrefetch' // 2.6
  ]
  return $internalHooks.includes(methodName)
}

export function isPrimitiveType (tsModule: typeof ts, returnType: ts.Type) {
  return !!(returnType.flags & tsModule.TypeFlags.NumberLike) ||
    !!(returnType.flags & tsModule.TypeFlags.StringLike) ||
    !!(returnType.flags & tsModule.TypeFlags.BooleanLike) ||
    !!(returnType.flags & tsModule.TypeFlags.Null) ||
    !!(returnType.flags & tsModule.TypeFlags.Undefined)
}

export function copySyntheticComments<T extends ts.Node> (tsModule: typeof ts, node: T, copyNode: ts.Node): T {
  const leadingComments = tsModule.getLeadingCommentRanges(copyNode.getSourceFile().getFullText(), copyNode.pos) || []
  const trailingComments = tsModule.getTrailingCommentRanges(copyNode.getSourceFile().getFullText(), copyNode.end) || []

  const getCommentText = (comment: ts.CommentRange) => {
    return copyNode.getSourceFile().getFullText().slice(comment.pos, comment.end)
      .replace(/\/\//g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/ {2}\* ?/g, '* ')
      .replace(/ \*\//g, '*/')
      .replace(/ {2}$/g, '')
  }

  let result = node
  for (const comment of leadingComments) {
    const text = getCommentText(comment)
    result = tsModule.addSyntheticLeadingComment(result, comment.kind, text, comment.hasTrailingNewLine)
  }

  for (const comment of trailingComments) {
    const text = getCommentText(comment)
    result = tsModule.addSyntheticTrailingComment(result, comment.kind, text, comment.hasTrailingNewLine)
  }

  return node
}

export function removeComments<T extends ts.Node> (tsModule: typeof ts, node: T) {
  if (tsModule.isStringLiteral(node)) {
    return tsModule.createStringLiteral(node.text)
  }
  return node
}

export function addTodoComment<T extends ts.Node> (tsModule: typeof ts, node: T, text: string, multiline: boolean) {
  return tsModule.addSyntheticLeadingComment(
    node,
    (multiline) ? ts.SyntaxKind.MultiLineCommentTrivia : ts.SyntaxKind.SingleLineCommentTrivia,
    ` TODO: ${text}`
  )
}

export function convertNodeToASTResult<T extends ts.Node> (tsModule: typeof ts, node: T): ASTResult<T> {
  return {
    imports: [],
    kind: ASTResultKind.OBJECT,
    reference: ReferenceKind.NONE,
    attrutibes: [],
    tag: 'IheritObjProperty',
    nodes: [
      addTodoComment(tsModule, node, 'Can\'t convert this object property.', false)
    ]
  }
}

// ts.createIdentifier() cannot call getText function, it's a hack.
export function createIdentifier (tsModule: typeof ts, text: string) {
  const temp = tsModule.createIdentifier(text)
  temp.getText = () => text
  return temp
}
