import { getSingleFileProgram } from "./parser";
import { convertAST } from "./convert";
import {
  InputVc2cOptions,
  getDefaultVc2cOptions,
  mergeVc2cOptions,
} from "./options";
import { format } from "./format";
import { parseVueSFCOrTsFile } from "./file";
import { setDebugMode } from "./debug";
import * as BuiltInPlugins from "./plugins/builtIn";

export async function convert(
  filePath: string,
  fileContent: string,
  inputOptions: InputVc2cOptions = {},
): Promise<string> {
  const options = mergeVc2cOptions(
    getDefaultVc2cOptions(inputOptions.typescript),
    inputOptions,
  );

  if (options.debug) {
    setDebugMode(true);
  }

  const { content } = parseVueSFCOrTsFile(filePath, fileContent, options);
  const { ast, program } = getSingleFileProgram(content, options);
  const result = convertAST(ast, options, program);

  return options.format ? format(result, options) : result;
}

export * from "./plugins/types";
export { BuiltInPlugins };
export * from "./utils";
export { getDefaultVc2cOptions, type Vc2cOptions } from "./options";
