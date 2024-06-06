import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments, getDecorators } from "../../utils";

const modelDecoratorName = "Model";

export const convertModel: ASTConverter<ts.PropertyDeclaration> = (
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
      modelDecoratorName,
  );

  if (decorator) {
    const decoratorArguments = (decorator.expression as ts.CallExpression)
      .arguments;
    if (decoratorArguments.length > 1) {
      const eventName = (decoratorArguments[0] as ts.StringLiteral).text;
      const propArguments = decoratorArguments[1];

      return {
        tag: "Model",
        kind: ASTResultKind.OBJECT,
        imports: [],
        reference: ReferenceKind.NONE,
        attributes: [node.name.getText()],
        nodes: [
          copySyntheticComments(
            tsModule,
            tsModule.factory.createPropertyAssignment(
              tsModule.factory.createIdentifier("model"),
              tsModule.factory.createObjectLiteralExpression(
                [
                  tsModule.factory.createPropertyAssignment(
                    tsModule.factory.createIdentifier("prop"),
                    tsModule.factory.createStringLiteral(node.name.getText()),
                  ),
                  tsModule.factory.createPropertyAssignment(
                    tsModule.factory.createIdentifier("event"),
                    tsModule.factory.createStringLiteral(eventName),
                  ),
                ],
                true,
              ),
            ),
            node,
          ),
          tsModule.factory.createPropertyAssignment(
            tsModule.factory.createIdentifier(node.name.getText()),
            propArguments,
          ),
        ] as ts.PropertyAssignment[],
      };
    }
  }

  return false;
};
