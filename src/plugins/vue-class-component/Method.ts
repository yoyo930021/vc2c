import { ASTConverter, ASTResultKind, ReferenceKind } from "../types";
import type ts from "typescript";
import { copySyntheticComments } from "../../utils";

export const convertMethod: ASTConverter<ts.MethodDeclaration> = (
  node,
  options,
) => {
  const tsModule = options.typescript;
  const methodName = node.name.getText();

  const result = options.useFunctionDeclaration
    ? convertMethodAsFunctionDeclaration(tsModule, node)
    : convertMethodAsArrowFunction(tsModule, node);

  return {
    tag: "Method",
    kind: ASTResultKind.COMPOSITION,
    imports: [],
    reference: ReferenceKind.VARIABLE,
    attributes: [methodName],
    nodes: [copySyntheticComments(tsModule, result, node)] as ts.Statement[],
  };
};

const convertMethodAsFunctionDeclaration = (
  tsModule: typeof ts,
  node: ts.MethodDeclaration,
): ts.FunctionDeclaration => {
  return tsModule.factory.createFunctionDeclaration(
    undefined,
    node.asteriskToken,
    node.name.getText(),
    node.typeParameters,
    node.parameters,
    node.type,
    node.body ?? tsModule.factory.createBlock([]),
  );
};

const convertMethodAsArrowFunction = (
  tsModule: typeof ts,
  node: ts.MethodDeclaration,
): ts.VariableStatement => {
  const methodName = node.name.getText();
  const outputMethod = tsModule.factory.createArrowFunction(
    undefined,
    node.typeParameters,
    node.parameters,
    node.type,
    tsModule.factory.createToken(tsModule.SyntaxKind.EqualsGreaterThanToken),
    node.body ?? tsModule.factory.createBlock([]),
  );

  return tsModule.factory.createVariableStatement(
    undefined,
    tsModule.factory.createVariableDeclarationList(
      [
        tsModule.factory.createVariableDeclaration(
          tsModule.factory.createIdentifier(methodName),
          undefined,
          undefined,
          outputMethod,
        ),
      ],
      tsModule.NodeFlags.Const,
    ),
  );
};
