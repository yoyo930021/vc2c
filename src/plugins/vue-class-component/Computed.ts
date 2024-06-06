import {
  ASTConverter,
  ASTResultKind,
  ASTTransform,
  ASTResult,
  ReferenceKind,
} from "../types";
import type ts from "typescript";
import { copySyntheticComments } from "../../utils";

export const convertGetter: ASTConverter<ts.GetAccessorDeclaration> = (
  node,
  options,
) => {
  const tsModule = options.typescript;
  const computedName = node.name.getText();

  return {
    tag: "Computed-getter",
    kind: ASTResultKind.COMPOSITION,
    imports: [
      {
        named: ["computed"],
        external: options.compatible ? "@vue/composition-api" : "vue",
      },
    ],
    reference: ReferenceKind.VARIABLE,
    attributes: [computedName],
    nodes: [
      copySyntheticComments(
        tsModule,
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
        node,
      ),
    ],
  };
};

export const convertSetter: ASTConverter<ts.SetAccessorDeclaration> = (
  node,
  options,
) => {
  const tsModule = options.typescript;
  const computedName = node.name.getText();

  return {
    tag: "Computed-setter",
    kind: ASTResultKind.COMPOSITION,
    imports: [
      {
        named: ["computed"],
        external: options.compatible ? "@vue/composition-api" : "vue",
      },
    ],
    reference: ReferenceKind.VARIABLE,
    attributes: [computedName],
    nodes: [
      copySyntheticComments(
        tsModule,
        tsModule.factory.createArrowFunction(
          undefined,
          node.typeParameters,
          node.parameters,
          undefined,
          tsModule.factory.createToken(
            tsModule.SyntaxKind.EqualsGreaterThanToken,
          ),
          node.body ?? tsModule.factory.createBlock([]),
        ),
        node,
      ),
    ],
  };
};

export const mergeComputed: ASTTransform = (astResults, options) => {
  const tsModule = options.typescript;
  const getterASTResults = astResults.filter(
    (el) => el.tag === "Computed-getter",
  );
  const setterASTResults = astResults.filter(
    (el) => el.tag === "Computed-setter",
  );
  const otherASTResults = astResults.filter(
    (el) => el.tag !== "Computed-getter" && el.tag !== "Computed-setter",
  );

  const computedASTResults: ASTResult<ts.Statement>[] = [];

  getterASTResults.forEach((getter) => {
    const getterName = getter.attributes[0];

    const setter = setterASTResults.find((el) =>
      el.attributes.includes(getterName),
    );

    const leadingComments = setter
      ? []
      : tsModule.getSyntheticLeadingComments(getter.nodes[0]);
    const trailingComments = setter
      ? []
      : tsModule.getSyntheticTrailingComments(getter.nodes[0]);

    const resultNode = tsModule.factory.createVariableStatement(
      undefined,
      tsModule.factory.createVariableDeclarationList(
        [
          tsModule.factory.createVariableDeclaration(
            tsModule.factory.createIdentifier(getterName),
            undefined,
            undefined,
            tsModule.factory.createCallExpression(
              tsModule.factory.createIdentifier("computed"),
              undefined,
              [
                setter
                  ? tsModule.factory.createObjectLiteralExpression(
                      [
                        tsModule.factory.createPropertyAssignment(
                          tsModule.factory.createIdentifier("get"),
                          getter.nodes[0] as ts.Expression,
                        ),
                        tsModule.factory.createPropertyAssignment(
                          tsModule.factory.createIdentifier("set"),
                          setter.nodes[0] as ts.Expression,
                        ),
                      ],
                      true,
                    )
                  : (tsModule.setSyntheticTrailingComments(
                      tsModule.setSyntheticLeadingComments(
                        getter.nodes[0],
                        undefined,
                      ),
                      undefined,
                    ) as ts.Expression),
              ],
            ),
          ),
        ],
        tsModule.NodeFlags.Const,
      ),
    );

    computedASTResults.push({
      tag: "Computed",
      kind: ASTResultKind.COMPOSITION,
      imports: [
        {
          named: ["computed"],
          external: options.compatible ? "@vue/composition-api" : "vue",
        },
      ],
      reference: ReferenceKind.VARIABLE_VALUE,
      attributes: [getterName],
      nodes: [
        setter
          ? resultNode
          : tsModule.setSyntheticTrailingComments(
              tsModule.setSyntheticLeadingComments(resultNode, leadingComments),
              trailingComments,
            ),
      ] as ts.Statement[],
    });
  });

  return [...computedASTResults, ...otherASTResults];
};
