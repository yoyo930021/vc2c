import { ASTConverter, ASTResultKind, ReferenceKind } from "../../types";
import type ts from "typescript";

export const convertObjData: ASTConverter<ts.MethodDeclaration> = (
  node,
  options,
) => {
  if (node.name.getText() === "data") {
    const tsModule = options.typescript;
    const returnStatement = node.body?.statements.find((el) =>
      tsModule.isReturnStatement(el),
    ) as ts.ReturnStatement | undefined;
    if (!returnStatement || !returnStatement.expression) return false;
    const attrutibes = (
      returnStatement.expression as ts.ObjectLiteralExpression
    ).properties.map((el) => el.name?.getText() ?? "");
    const arrowFn = tsModule.factory.createArrowFunction(
      node.modifiers?.filter(tsModule.isModifier),
      [],
      [],
      undefined,
      tsModule.factory.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
      tsModule.factory.createBlock(
        node.body?.statements.map((el) => {
          if (tsModule.isReturnStatement(el)) {
            return tsModule.factory.createReturnStatement(
              tsModule.factory.createCallExpression(
                tsModule.factory.createIdentifier("toRefs"),
                undefined,
                [
                  tsModule.factory.createCallExpression(
                    tsModule.factory.createIdentifier("reactive"),
                    undefined,
                    returnStatement.expression
                      ? [returnStatement.expression]
                      : [],
                  ),
                ],
              ),
            );
          }
          return el;
        }) ?? [],
        true,
      ),
    );

    return {
      tag: "Data-ref",
      kind: ASTResultKind.COMPOSITION,
      imports: [
        {
          named: ["reactive", "toRefs"],
          external: options.compatible ? "@vue/composition-api" : "vue",
        },
      ],
      reference: ReferenceKind.VARIABLE_VALUE,
      attributes: attrutibes,
      nodes: [
        tsModule.factory.createVariableStatement(
          undefined,
          tsModule.factory.createVariableDeclarationList(
            [
              tsModule.factory.createVariableDeclaration(
                tsModule.factory.createObjectBindingPattern(
                  attrutibes.map((el) =>
                    tsModule.factory.createBindingElement(
                      undefined,
                      undefined,
                      tsModule.factory.createIdentifier(el),
                      undefined,
                    ),
                  ),
                ),
                undefined,
                undefined,
                tsModule.factory.createCallExpression(
                  tsModule.factory.createParenthesizedExpression(arrowFn),
                  [],
                  [],
                ),
              ),
            ],
            tsModule.NodeFlags.Const,
          ),
        ),
      ] as ts.Statement[],
    };
  }

  return false;
};
