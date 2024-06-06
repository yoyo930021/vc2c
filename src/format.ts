import { Vc2cOptions } from "./options";
import path from "node:path";
import fs from "node:fs";
import { log } from "./debug";
import prettier from "prettier/standalone";
import tsParser from "prettier/plugins/typescript";
import estree from "prettier/plugins/estree";

/* v8 ignore start */
export async function format(content: string, options: Vc2cOptions) {
  const isNode = typeof window === "undefined";
  if (!isNode) {
    return prettier.format(content, {
      parser: "typescript",
      plugins: [tsParser, estree],
      semi: true,
      singleQuote: true,
    });
  }

  const eslintConfigPath = path.resolve(options.root, options.eslintConfigFile);
  const prettierFormat = await import("prettier-eslint").then((m) => m.default);
  const prettierEslintOptions = fs.existsSync(eslintConfigPath)
    ? {
        text: content,
        filePath: eslintConfigPath,
        prettierOptions: {
          parser: "typescript",
        },
        fallbackPrettierOptions: {
          parser: "typescript",
        },
      }
    : {
        text: content,
        eslintConfig: {
          parser: require.resolve("@typescript-eslint/parser"),
          parserOptions: {
            sourceType: "module",
            ecmaFeatures: {
              jsx: false,
            },
          },
          rules: {
            semi: ["error", "never"],
            "padding-line-between-statements": [
              "error",
              { blankLine: "always", prev: "*", next: "export" },
              { blankLine: "always", prev: "const", next: "*" },
              { blankLine: "always", prev: "*", next: "const" },
            ],
          },
        },
        prettierOptions: {
          parser: "typescript",
          Semicolons: false,
          singleQuote: true,
        },
        fallbackPrettierOptions: {
          parser: "typescript",
          singleQuote: true,
          Semicolons: false,
        },
      };

  log("Format result code.....");
  return prettierFormat(prettierEslintOptions);
}
/* v8 ignore stop */
