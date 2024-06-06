import { Vc2cOptions } from "../options";
import type ts from "typescript";

export enum ASTResultKind {
  OBJECT,
  COMPOSITION,
}

export enum ReferenceKind {
  PROPS,
  VARIABLE_VALUE,
  VARIABLE_NON_NULL_VALUE,
  VARIABLE,
  CONTEXT,
  NONE,
}

export type ImportModule =
  | {
      default?: string;
      named?: string[];
      path: string;
    }
  | {
      default?: string;
      named?: string[];
      external: string;
    };

export interface ASTResultBase {
  imports: ImportModule[];
  kind: ASTResultKind;
  reference: ReferenceKind;
  attributes: string[];
  tag: string;
}

export interface ASTResultToObject<N = ts.PropertyAssignment>
  extends ASTResultBase {
  kind: ASTResultKind.OBJECT;
  nodes: N[];
}

export interface ASTResultToComposition<N = ts.Statement>
  extends ASTResultBase {
  kind: ASTResultKind.COMPOSITION;
  nodes: N[];
}

export type ASTResult<N> = ASTResultToObject<N> | ASTResultToComposition<N>;

export type ASTConverter<T extends ts.Node> = (
  node: T,
  options: Vc2cOptions,
  program: ts.Program,
) => ASTResult<ts.Node> | false;

export type ASTTransform = (
  astResults: Array<ASTResult<ts.Node>>,
  options: Vc2cOptions,
  program: ts.Program,
) => Array<ASTResult<ts.Node>>;

export interface ASTConvertPlugins {
  [ts.SyntaxKind.Decorator]: {
    [ts.SyntaxKind.PropertyAssignment]: Array<
      ASTConverter<ts.PropertyAssignment>
    >;
    [ts.SyntaxKind.MethodDeclaration]: Array<
      ASTConverter<ts.MethodDeclaration>
    >;
  };
  [ts.SyntaxKind.Identifier]: Array<ASTConverter<ts.Identifier>>;
  [ts.SyntaxKind.HeritageClause]: Array<ASTConverter<ts.HeritageClause>>;
  [ts.SyntaxKind.PropertyDeclaration]: Array<
    ASTConverter<ts.PropertyDeclaration>
  >;
  [ts.SyntaxKind.GetAccessor]: Array<ASTConverter<ts.GetAccessorDeclaration>>;
  [ts.SyntaxKind.SetAccessor]: Array<ASTConverter<ts.SetAccessorDeclaration>>;
  [ts.SyntaxKind.MethodDeclaration]: Array<ASTConverter<ts.MethodDeclaration>>;
  after: Array<ASTTransform>;
}
