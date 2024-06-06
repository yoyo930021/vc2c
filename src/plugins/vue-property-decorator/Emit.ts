import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments, getDecorators } from "../../utils";

const emitDecoratorName = "Emit";

// Code copied from Vue/src/shared/util.js
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str: string) =>
  str.replace(hyphenateRE, "-$1").toLowerCase();

export const convertEmitMethod: ASTConverter<ts.MethodDeclaration> = (
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
      emitDecoratorName,
  );
  if (decorator) {
    const methodName = node.name.getText();

    const decoratorArguments = (decorator.expression as ts.CallExpression)
      .arguments;
    const eventName =
      decoratorArguments.length > 0 &&
      tsModule.isStringLiteral(decoratorArguments[0])
        ? decoratorArguments[0].text
        : undefined;

    const createEmit = (event: string, expressions: ts.Expression[]) =>
      tsModule.factory.createExpressionStatement(
        tsModule.factory.createCallExpression(
          tsModule.factory.createPropertyAccessExpression(
            tsModule.factory.createIdentifier("context"),
            tsModule.factory.createIdentifier("emit"),
          ),
          undefined,
          [tsModule.factory.createStringLiteral(event), ...expressions],
        ),
      );

    const valueIdentifier =
      node.parameters.length > 0
        ? tsModule.factory.createIdentifier(node.parameters[0].name.getText())
        : undefined;

    let haveResult = false;
    const transformer = (): ts.TransformerFactory<ts.Statement> => {
      return (context) => {
        const deepVisitor: ts.Visitor = (node) => {
          if (tsModule.isReturnStatement(node)) {
            haveResult = true;

            return createEmit(
              eventName || hyphenate(methodName),
              (node.expression ? [node.expression] : []).concat(
                valueIdentifier ? [valueIdentifier] : [],
              ),
            );
          }
          return tsModule.visitEachChild(node, deepVisitor, context);
        };

        return (node) => tsModule.visitNode(node, deepVisitor) as ts.Statement;
      };
    };

    const originalBodyStatements = node.body
      ? node.body.statements
      : tsModule.factory.createNodeArray([]);
    let bodyStatements = tsModule.transform(
      originalBodyStatements.map((el) => el),
      [transformer()],
      { module: tsModule.ModuleKind.ESNext },
    ).transformed;
    if (!haveResult) {
      bodyStatements = [
        ...originalBodyStatements,
        createEmit(
          eventName || hyphenate(methodName),
          valueIdentifier ? [valueIdentifier] : [],
        ),
      ];
    }

    const outputMethod = options.useFunctionDeclaration
      ? tsModule.factory.createFunctionDeclaration(
          undefined,
          node.asteriskToken,
          methodName,
          node.typeParameters,
          node.parameters,
          node.type,
          tsModule.factory.createBlock(bodyStatements, true),
        )
      : tsModule.factory.createVariableStatement(
          undefined,
          tsModule.factory.createVariableDeclarationList(
            [
              tsModule.factory.createVariableDeclaration(
                tsModule.factory.createIdentifier(methodName),
                undefined,
                undefined,
                tsModule.factory.createArrowFunction(
                  undefined,
                  node.typeParameters,
                  node.parameters,
                  node.type,
                  tsModule.factory.createToken(
                    tsModule.SyntaxKind.EqualsGreaterThanToken,
                  ),
                  tsModule.factory.createBlock(bodyStatements, true),
                ),
              ),
            ],
            tsModule.NodeFlags.Const,
          ),
        );

    return {
      tag: "Emit",
      kind: ASTResultKind.COMPOSITION,
      imports: [],
      reference: ReferenceKind.VARIABLE,
      attributes: [methodName],
      nodes: [
        copySyntheticComments(tsModule, outputMethod, node),
      ] as ts.Statement[],
    };
  }

  return false;
};
