import type vueTemplateParser from "vue-template-compiler";
import type ts from "typescript";
import { ASTResult, ASTResultKind, ReferenceKind } from "./plugins/types";
export function isVueFile(path: string): boolean {
  return path.endsWith(".vue");
}
export function parseVueFile(
  vueTemplateParserModule: typeof vueTemplateParser,
  content: string,
): vueTemplateParser.SFCDescriptor {
  return vueTemplateParserModule.parseComponent(content);
}

export function getNodeFromExportNode(
  tsModule: typeof ts,
  exportExpr: ts.Node,
): ts.ClassDeclaration | undefined {
  switch (exportExpr.kind) {
    case tsModule.SyntaxKind.ClassDeclaration:
      return exportExpr as ts.ClassDeclaration;
  }
  return undefined;
}

export function getDefaultExportNode(
  tsModule: typeof ts,
  sourceFile: ts.SourceFile,
): ts.ClassDeclaration | undefined {
  const exportStmts = sourceFile.statements.filter(
    (st) => st.kind === tsModule.SyntaxKind.ClassDeclaration,
  );
  if (exportStmts.length === 0) {
    return undefined;
  }
  const exportNode = exportStmts[0] as ts.ClassDeclaration;

  return getNodeFromExportNode(tsModule, exportNode);
}

export function getDecorators(tsModule: typeof ts, node: ts.Node) {
  if (
    !tsModule.isPropertyDeclaration(node) &&
    !tsModule.isFunctionDeclaration(node) &&
    !tsModule.isClassDeclaration(node) &&
    !tsModule.isMethodDeclaration(node)
  ) {
    return undefined;
  }

  return node.modifiers?.filter(tsModule.isDecorator);
}

export function getDecoratorNames(
  tsModule: typeof ts,
  node: ts.Node,
): string[] {
  const decorators = getDecorators(tsModule, node);

  if (!decorators) {
    return [];
  }

  return decorators
    .filter((m): m is ts.Decorator => tsModule.isDecorator(m))
    .map((el) => {
      if (tsModule.isCallExpression(el.expression)) {
        return el.expression.expression.getText();
      } else {
        return el.expression.getText();
      }
    });
}

const $internalHooks = new Map<string, string | false>([
  ["beforeCreate", false],
  ["created", false],
  ["beforeMount", "onBeforeMount"],
  ["mounted", "onMounted"],
  ["beforeDestroy", "onBeforeUnmount"],
  ["destroyed", "onUnmounted"],
  ["beforeUpdate", "onBeforeUpdate"],
  ["updated", "onUpdated"],
  ["activated", "onActivated"],
  ["deactivated", "onDeactivated"],
  ["render", "onRender"],
  ["errorCaptured", "onErrorCaptured"], // 2.5
  ["serverPrefetch", "onServerPrefetch"], // 2.6
]);

export function isInternalHook(methodName: string): boolean {
  return $internalHooks.has(methodName);
}

export function getMappedHook(methodName: string): string | undefined | false {
  return $internalHooks.get(methodName);
}

export function isPrimitiveType(
  tsModule: typeof ts,
  type: ts.TypeNode | ts.Node,
): boolean {
  return (
    type.kind === tsModule.SyntaxKind.StringKeyword ||
    type.kind === tsModule.SyntaxKind.NumberKeyword ||
    type.kind === tsModule.SyntaxKind.NullKeyword ||
    type.kind === tsModule.SyntaxKind.UndefinedKeyword ||
    type.kind === tsModule.SyntaxKind.BooleanKeyword
  );
}

export function copySyntheticComments<T extends ts.Node>(
  tsModule: typeof ts,
  node: T,
  copyNode: ts.Node,
): T {
  const leadingComments =
    tsModule.getLeadingCommentRanges(
      copyNode.getSourceFile().getFullText(),
      copyNode.pos,
    ) || [];
  const trailingComments =
    tsModule.getTrailingCommentRanges(
      copyNode.getSourceFile().getFullText(),
      copyNode.end,
    ) || [];

  const getCommentText = (comment: ts.CommentRange) => {
    return copyNode
      .getSourceFile()
      .getFullText()
      .slice(comment.pos, comment.end)
      .replace(/\/\//g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
      .replace(/ {2}\* ?/g, "* ")
      .replace(/ \*\//g, "*/")
      .replace(/ {2}$/g, "");
  };

  let result = node;
  for (const comment of leadingComments) {
    const text = getCommentText(comment);
    result = tsModule.addSyntheticLeadingComment(
      result,
      comment.kind,
      text,
      comment.hasTrailingNewLine,
    );
  }

  for (const comment of trailingComments) {
    const text = getCommentText(comment);
    result = tsModule.addSyntheticTrailingComment(
      result,
      comment.kind,
      text,
      comment.hasTrailingNewLine,
    );
  }

  return node;
}

export function removeComments<T extends ts.Node>(
  tsModule: typeof ts,
  node: T,
): T | ts.StringLiteral {
  if (tsModule.isStringLiteral(node)) {
    return tsModule.factory.createStringLiteral(node.text);
  }
  return node;
}

export function addTodoComment<T extends ts.Node>(
  tsModule: typeof ts,
  node: T,
  text: string,
  multiline: boolean,
): T {
  return tsModule.addSyntheticLeadingComment(
    node,
    multiline
      ? tsModule.SyntaxKind.MultiLineCommentTrivia
      : tsModule.SyntaxKind.SingleLineCommentTrivia,
    ` TODO: ${text}`,
  );
}

export function convertNodeToASTResult<T extends ts.Node>(
  tsModule: typeof ts,
  node: T,
): ASTResult<T> {
  return {
    imports: [],
    kind: ASTResultKind.OBJECT,
    reference: ReferenceKind.NONE,
    attributes: [],
    tag: "IheritObjProperty",
    nodes: [
      addTodoComment(
        tsModule,
        node,
        "Can't convert this object property.",
        false,
      ),
    ],
  };
}

// ts.createIdentifier() cannot call getText function, it's a hack.
export function createIdentifier(
  tsModule: typeof ts,
  text: string,
): ts.Identifier {
  const temp = tsModule.factory.createIdentifier(text);
  temp.getText = () => text;
  return temp;
}
