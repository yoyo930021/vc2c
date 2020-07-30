import { log } from './debug'
import { Vc2cOptions } from './options'
import { isVueFile, parseVueFile } from './utils'
import { isAbsolute, resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

export enum FileKind {
  VUE,
  TS
}

export type VueFileInfo = FileInfo

export interface VueSFCFileInfo extends FileInfo {
  fileContent: string
  start: number
  end: number
}

export interface FileInfo {
  fsPath: string
  kind: FileKind
  content: string
}

export function readVueSFCOrTsFile (filePath: string, options: Vc2cOptions): FileInfo {
  if (process.env.BROWSER) {
    throw new Error('unsupported')
  }
  const fileFsPath: string = (isAbsolute(filePath)) ? filePath : resolve(options.root, filePath)
  const fileContent = readFileSync(fileFsPath, { encoding: 'utf8' })
  if (isVueFile(fileFsPath)) {
    const scriptContent = parseVueFile(options.vueTemplateCompiler, fileContent).script
    if (scriptContent?.content != null) {
      log(`Read Vue file: ${fileFsPath}`)
      return {
        fsPath: fileFsPath,
        kind: FileKind.VUE,
        start: scriptContent?.start ?? 0,
        end: scriptContent?.end ?? 0,
        content: scriptContent?.content ?? '',
        fileContent
      } as VueSFCFileInfo
    }
    throw new Error('The Vue SFC don\'t have script element.')
  } else {
    log(`Read TS file: ${fileFsPath}`)
    return {
      fsPath: fileFsPath,
      kind: FileKind.TS,
      content: fileContent
    } as VueFileInfo
  }
}

export function writeFileInfo (fileInfo: VueFileInfo | VueSFCFileInfo, content: string) {
  if (process.env.BROWSER) {
    throw new Error('unsupported')
  }

  const { fsPath } = fileInfo
  if ('start' in fileInfo) {
    const { fileContent, start, end } = fileInfo as unknown as VueSFCFileInfo
    log(`Write Vue file: ${fsPath}`)
    const newFileContent = `${fileContent.slice(0, start)}\n${content}${fileContent.slice(end)}`
    writeFileSync(fsPath, newFileContent, { encoding: 'utf8' })
  } else {
    log(`Write TS file: ${fsPath}`)
    writeFileSync(fsPath, content, { encoding: 'utf8' })
  }
}

export function existsFileSync (path: string): boolean {
  if (process.env.BROWSER) {
    throw new Error('unsupported')
  }
  return existsSync(path)
}
