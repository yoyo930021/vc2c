import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import {
  isInternalHook,
  copySyntheticComments,
  getMappedHook,
} from "../../utils";

export const convertIntervalHook: ASTConverter<ts.MethodDeclaration> = (
  node,
  options,
) => {
  const intervalHookName = node.name.getText();

  if (isInternalHook(intervalHookName)) {
    const tsModule = options.typescript;
    const namedImport = getMappedHook(intervalHookName);
    const needNamedImports = [];

    if (namedImport) {
      needNamedImports.push(namedImport);
    }

    const outputNode =
      needNamedImports.length > 0
        ? tsModule.factory.createExpressionStatement(
            tsModule.factory.createCallExpression(
              tsModule.factory.createIdentifier(needNamedImports[0]),
              undefined,
              [
                tsModule.factory.createArrowFunction(
                  undefined,
                  undefined,
                  [],
                  undefined,
                  tsModule.factory.createToken(
                    tsModule.SyntaxKind.EqualsGreaterThanToken,
                  ),
                  node.body ?? tsModule.factory.createBlock([]),
                ),
              ],
            ),
          )
        : node.body?.statements;

    if (!outputNode) {
      return false;
    }

    const nodes: ts.Statement[] =
      needNamedImports.length > 0
        ? [copySyntheticComments(tsModule, outputNode as ts.Statement, node)]
        : (outputNode as ts.NodeArray<ts.Statement>).map((el, index) => {
            if (index === 0) {
              return copySyntheticComments(tsModule, el, node);
            }
            return el;
          });

    return {
      tag: "IntervalHook",
      kind: ASTResultKind.COMPOSITION,
      attributes: needNamedImports.length > 0 ? needNamedImports : [],
      imports: [
        {
          named: needNamedImports,
          external: options.compatible ? "@vue/composition-api" : "vue",
        },
      ],
      reference: ReferenceKind.NONE,
      nodes,
    };
  }

  return false;
};
