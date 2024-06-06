import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments, createIdentifier } from "../../utils";

const watchDecoratorName = "Watch";

export const convertWatch: ASTConverter<ts.MethodDeclaration> = (
  node,
  options,
) => {
  const tsModule = options.typescript;
  const decorators = node.modifiers?.filter(tsModule.isDecorator);

  if (!decorators) {
    return false;
  }

  const decorator = decorators.find(
    (el) =>
      (el.expression as ts.CallExpression).expression.getText() ===
      watchDecoratorName,
  );

  if (decorator) {
    const decoratorArguments = (decorator.expression as ts.CallExpression)
      .arguments;
    if (decoratorArguments.length > 0) {
      const keyName = (decoratorArguments[0] as ts.StringLiteral).text;
      const watchArguments = decoratorArguments[1];
      const method = tsModule.factory.createFunctionDeclaration(
        undefined,
        undefined,
        node.name.getText(),
        node.typeParameters,
        node.parameters,
        node.type,
        node.body ?? tsModule.factory.createBlock([], false),
      );
      const watchOptions: ts.PropertyAssignment[] = [];
      if (
        watchArguments &&
        tsModule.isObjectLiteralExpression(watchArguments)
      ) {
        watchArguments.properties.forEach((el) => {
          if (!tsModule.isPropertyAssignment(el)) return;
          watchOptions.push(el);
        });
      }

      return {
        tag: "Watch",
        kind: ASTResultKind.COMPOSITION,
        imports: [
          {
            named: ["watch"],
            external: options.compatible ? "@vue/composition-api" : "vue",
          },
        ],
        reference: ReferenceKind.VARIABLE,
        attributes: [],
        nodes: [
          tsModule.factory.createExpressionStatement(
            copySyntheticComments(
              tsModule,
              tsModule.factory.createCallExpression(
                tsModule.factory.createIdentifier("watch"),
                undefined,
                [
                  createIdentifier(tsModule, keyName),
                  tsModule.factory.createIdentifier(node.name.getText()),
                  ...(watchOptions.length
                    ? [
                        tsModule.factory.createObjectLiteralExpression(
                          watchOptions,
                        ),
                      ]
                    : []),
                ],
              ),
              node,
            ),
          ),
          copySyntheticComments(tsModule, method, node),
        ] as ts.Statement[],
      };
    }
  }

  return false;
};
