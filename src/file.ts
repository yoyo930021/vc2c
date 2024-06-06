import { isVueFile, parseVueFile } from "./utils";
import { Vc2cOptions } from "./options";
import { log } from "./debug";

export enum FileKind {
  VUE,
  TS,
}

export type FileInfo =
  | {
      fsPath: string;
      kind: FileKind;
      content: string;
    }
  | {
      fsPath: string;
      kind: FileKind;
      fileContent: string;
      start: number;
      end: number;
      content: string;
    };

export function parseVueSFCOrTsFile(
  filePath: string,
  fileContent: string,
  options: Vc2cOptions,
): FileInfo {
  if (isVueFile(filePath)) {
    const scriptContent = parseVueFile(
      options.vueTemplateCompiler,
      fileContent,
    ).script;
    if (scriptContent) {
      log(`Readed Vue file: ${filePath}`);
      return {
        fsPath: filePath,
        kind: FileKind.VUE,
        start: scriptContent.start,
        end: scriptContent.end,
        content: scriptContent.content,
        fileContent,
      };
    }
    throw new Error("The Vue SFC don't have sciprt element.");
  } else {
    log(`Readed TS file: ${filePath}`);
    return {
      fsPath: filePath,
      kind: FileKind.TS,
      content: fileContent,
    };
  }
}
