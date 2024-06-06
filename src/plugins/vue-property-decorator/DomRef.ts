import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments, getDecorators } from "../../utils";

const refDecoratorName = "Ref";

export const convertDomRef: ASTConverter<ts.PropertyDeclaration> = (
  node,
  options,
) => {
  const tsModule = options.typescript;
  const decorators = getDecorators(tsModule, node);

  if (!decorators) {
    return false;
  }

  const decorator = decorators.find(
    (el) =>
      (el.expression as ts.CallExpression).expression.getText() ===
      refDecoratorName,
  );
  if (decorator) {
    const refName = node.name.getText();

    return {
      tag: "DomRef",
      kind: ASTResultKind.COMPOSITION,
      imports: [
        {
          named: ["ref"],
          external: options.compatible ? "@vue/composition-api" : "vue",
        },
      ],
      reference: ReferenceKind.VARIABLE_NON_NULL_VALUE,
      attributes: [refName],
      nodes: [
        copySyntheticComments(
          tsModule,
          tsModule.factory.createVariableStatement(
            undefined,
            tsModule.factory.createVariableDeclarationList(
              [
                tsModule.factory.createVariableDeclaration(
                  tsModule.factory.createIdentifier(refName),
                  undefined,
                  undefined,
                  tsModule.factory.createCallExpression(
                    tsModule.factory.createIdentifier("ref"),
                    node.type ? [node.type] : [],
                    [tsModule.factory.createNull()],
                  ),
                ),
              ],
              tsModule.NodeFlags.Const,
            ),
          ),
          node,
        ),
      ],
    };
  }

  return false;
};
