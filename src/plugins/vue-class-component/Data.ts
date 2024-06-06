import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments, removeComments } from "../../utils";

export const convertData: ASTConverter<ts.PropertyDeclaration> = (
  node,
  options,
) => {
  if (!node.initializer) {
    return false;
  }
  const tsModule = options.typescript;
  const dataName = node.name.getText();

  const callExpr = tsModule.factory.createCallExpression(
    tsModule.factory.createIdentifier("ref"),
    node.type ? [node.type] : undefined,
    [removeComments(tsModule, node.initializer)],
  );

  return {
    tag: "Data-ref",
    kind: ASTResultKind.COMPOSITION,
    imports: [
      {
        named: ["ref"],
        external: options.compatible ? "@vue/composition-api" : "vue",
      },
    ],
    reference: ReferenceKind.VARIABLE_VALUE,
    attributes: [dataName],
    nodes: [
      copySyntheticComments(
        tsModule,
        tsModule.factory.createVariableStatement(
          undefined,
          tsModule.factory.createVariableDeclarationList(
            [
              tsModule.factory.createVariableDeclaration(
                tsModule.factory.createIdentifier(dataName),
                undefined,
                undefined,
                callExpr,
              ),
            ],
            tsModule.NodeFlags.Const,
          ),
        ),
        node,
      ),
    ] as ts.Statement[],
  };
};
