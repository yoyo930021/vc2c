import path from 'path'
import fs from 'fs'
import { isVueFile, parseVueFile } from './utils'
import { Vc2cOptions } from './options'
import { log } from './debug'

export enum FileKind {
  VUE,
  TS
}

type FileInfo = {
  fsPath: string,
  kind: FileKind,
  content: string
} | {
  fsPath: string,
  kind: FileKind,
  fileContent: string
  start: number,
  end: number,
  content: string,
}

export function readVueSFCOrTsFile (filePath: string, options: Vc2cOptions): FileInfo {
  const fileFsPath = (path.isAbsolute(filePath)) ? filePath : path.resolve(options.root, filePath)
  const fileContent = fs.readFileSync(fileFsPath, { encoding: 'utf8' })
  if (isVueFile(fileFsPath)) {
    const scriptContent = parseVueFile(options.vueTemplateCompiler, fileContent).script
    if (scriptContent) {
      log(`Readed Vue file: ${fileFsPath}`)
      return {
        fsPath: fileFsPath,
        kind: FileKind.VUE,
        start: scriptContent.start,
        end: scriptContent.end,
        content: scriptContent.content,
        fileContent
      }
    }
    throw new Error('The Vue SFC don\'t have sciprt element.')
  } else {
    log(`Readed TS file: ${fileFsPath}`)
    return {
      fsPath: fileFsPath,
      kind: FileKind.TS,
      content: fileContent
    }
  }
}

export function writeFileInfo (fileInfo: FileInfo, content: string) {
  if ('start' in fileInfo) {
    log(`Write Vue file: ${fileInfo.fsPath}`)
    const fileContent = `${fileInfo.fileContent.slice(0, fileInfo.start)}\n${content}${fileInfo.fileContent.slice(fileInfo.end)}`
    fs.writeFileSync(fileInfo.fsPath, fileContent, { encoding: 'utf8' })
  } else {
    log(`Write TS file: ${fileInfo.fsPath}`)
    fs.writeFileSync(fileInfo.fsPath, content, { encoding: 'utf8' })
  }
}
