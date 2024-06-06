import {
  ASTConverter,
  ASTResultKind,
  ASTTransform,
  ASTResultToObject,
  ReferenceKind,
} from "../types";
import type ts from "typescript";
import { copySyntheticComments, isPrimitiveType } from "../../utils";

const propDecoratorName = "Prop";

export const convertProp: ASTConverter<ts.PropertyDeclaration> = (
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
      propDecoratorName,
  );
  if (decorator) {
    const decoratorArguments = (decorator.expression as ts.CallExpression)
      .arguments;
    if (decoratorArguments.length > 0) {
      const propName = node.name.getText();
      const obj = decoratorArguments[0] as ts.ObjectLiteralExpression;
      const propArguments =
        node.type && isPrimitiveType(tsModule, node.type)
          ? obj
          : tsModule.factory.createObjectLiteralExpression(
              obj.properties.map((p) => {
                if (
                  tsModule.isPropertyAssignment(p) &&
                  p.name.getText() === "type"
                ) {
                  return tsModule.factory.createPropertyAssignment(
                    tsModule.factory.createIdentifier("type"),
                    tsModule.factory.createAsExpression(
                      tsModule.factory.createIdentifier(
                        p.initializer.getText(),
                      ),
                      tsModule.factory.createTypeReferenceNode(
                        "PropType",
                        node.type ? [node.type] : [],
                      ),
                    ),
                  );
                }
                return p;
              }),
            );

      return {
        tag: "Prop",
        kind: ASTResultKind.OBJECT,
        imports: [
          {
            named: ["type PropType"],
            external: options.compatible ? "@vue/composition-api" : "vue",
          },
        ],
        reference: ReferenceKind.PROPS,
        attributes: [propName],
        nodes: [
          copySyntheticComments(
            tsModule,
            tsModule.factory.createPropertyAssignment(
              tsModule.factory.createIdentifier(propName),
              propArguments,
            ),
            node,
          ),
        ],
      };
    }
  }

  return false;
};

export const mergeProps: ASTTransform = (astResults, options) => {
  const tsModule = options.typescript;
  const propTags = ["Prop", "Model"];

  const propASTResults = astResults.filter((el) => propTags.includes(el.tag));
  const otherASTResults = astResults.filter((el) => !propTags.includes(el.tag));
  const modelASTResult = astResults.find((el) => el.tag === "Model");

  const mergeASTResult: ASTResultToObject = {
    tag: "Prop",
    kind: ASTResultKind.OBJECT,
    imports: [
      {
        named: ["type PropType"],
        external: options.compatible ? "@vue/composition-api" : "vue",
      },
    ],
    reference: ReferenceKind.PROPS,
    attributes: propASTResults
      .map((el) => el.attributes)
      .reduce((array, el) => array.concat(el), []),
    nodes: [
      tsModule.factory.createPropertyAssignment(
        tsModule.factory.createIdentifier("props"),
        tsModule.factory.createObjectLiteralExpression(
          [
            ...propASTResults
              .map((el) => (el.tag === "Prop" ? el.nodes : [el.nodes[1]]))
              .reduce(
                (array, el) => array.concat(el),
                [] as ts.ObjectLiteralElementLike[],
              ),
          ] as ts.ObjectLiteralElementLike[],
          true,
        ),
      ),
    ],
  };

  return [
    ...(modelASTResult
      ? [
          {
            ...modelASTResult,
            nodes: modelASTResult.nodes.slice(0, 1) as ts.PropertyAssignment[],
          },
        ]
      : []),
    mergeASTResult,
    ...otherASTResults,
  ];
};
