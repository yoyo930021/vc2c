import type ts from "typescript";
import { Vc2cOptions } from "./options";

export const defaultCompilerOptions: ts.CompilerOptions = {
  allowNonTsExtensions: true,
  allowJs: true,
  checkJs: true,
  noEmit: true,
};

export function getSingleFileProgram(
  content: string,
  options: Vc2cOptions,
): { ast: ts.SourceFile; program: ts.Program } {
  const fileName = "ast.ts";
  const tsModule = options.typescript;

  const compilerHost: ts.CompilerHost = {
    fileExists(filePath: string) {
      return filePath.includes(fileName);
    },
    getCanonicalFileName() {
      return fileName;
    },
    getCurrentDirectory() {
      return "";
    },
    getDirectories() {
      return [];
    },
    getDefaultLibFileName() {
      return "lib.d.ts";
    },
    getNewLine() {
      return "\n";
    },
    getSourceFile(filename: string) {
      return tsModule.createSourceFile(
        filename,
        content,
        tsModule.ScriptTarget.Latest,
        true,
      );
    },
    readFile() {
      return undefined;
    },
    useCaseSensitiveFileNames() {
      return true;
    },
    writeFile() {
      return null;
    },
  };

  const program = tsModule.createProgram(
    [fileName],
    {
      noResolve: true,
      target: tsModule.ScriptTarget.Latest,
      ...defaultCompilerOptions,
    },
    compilerHost,
  );

  const ast = program.getSourceFile(fileName);
  if (!ast) {
    throw new Error("Can't convert code to TypeScript AST.");
  }

  return { ast, program };
}
