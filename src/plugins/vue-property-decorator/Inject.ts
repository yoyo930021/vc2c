import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments, getDecorators } from "../../utils";

const injectDecoratorName = "Inject";

export const convertInject: ASTConverter<ts.PropertyDeclaration> = (
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
      tsModule.isCallExpression(el.expression) &&
      el.expression.expression.getText() === injectDecoratorName,
  );

  if (decorator) {
    const decoratorArguments = (decorator.expression as ts.CallExpression)
      .arguments;
    let injectKeyExpr: ts.Expression = tsModule.factory.createStringLiteral(
      node.name.getText(),
    );
    let defaultValueExpr: ts.Expression | undefined;
    if (decoratorArguments.length > 0) {
      const injectArgument = decoratorArguments[0];
      if (tsModule.isObjectLiteralExpression(injectArgument)) {
        const fromProperty = injectArgument.properties.find(
          (el) => el.name?.getText() === "from",
        );
        if (fromProperty && tsModule.isPropertyAssignment(fromProperty)) {
          injectKeyExpr = fromProperty.initializer;
        }
        const defaultProperty = injectArgument.properties.find(
          (el) => el.name?.getText() === "default",
        );
        if (defaultProperty && tsModule.isPropertyAssignment(defaultProperty)) {
          defaultValueExpr = defaultProperty.initializer;
        }
      } else {
        injectKeyExpr = injectArgument;
      }
    }

    return {
      tag: "Inject",
      kind: ASTResultKind.COMPOSITION,
      imports: [
        {
          named: ["inject"],
          external: options.compatible ? "@vue/composition-api" : "vue",
        },
      ],
      reference: ReferenceKind.VARIABLE,
      attributes: [node.name.getText()],
      nodes: [
        copySyntheticComments(
          tsModule,
          tsModule.factory.createVariableStatement(
            undefined,
            tsModule.factory.createVariableDeclarationList(
              [
                tsModule.factory.createVariableDeclaration(
                  tsModule.factory.createIdentifier(node.name.getText()),
                  undefined,
                  undefined,
                  tsModule.factory.createCallExpression(
                    tsModule.factory.createIdentifier("inject"),
                    node.type
                      ? [
                          tsModule.factory.createKeywordTypeNode(
                            node.type.kind as ts.KeywordTypeSyntaxKind,
                          ),
                        ]
                      : undefined,
                    [
                      injectKeyExpr,
                      ...(defaultValueExpr ? [defaultValueExpr] : []),
                    ],
                  ),
                ),
              ],
              tsModule.NodeFlags.Const,
            ),
          ),
          node,
        ),
      ] as ts.Statement[],
    };
  }

  return false;
};
