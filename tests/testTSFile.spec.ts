import { convertFile } from '../src'
import { FileKind } from '../src/file'
import path from 'path'

describe('testTSFile', () => {
  const filePath = 'fixture/Input.ts'

  it('compatible', () => {
    const { file, result } = convertFile(filePath, __dirname, 'config/.compatible.vc2c.js')
    expect(file.fsPath.includes(filePath)).toBeTruthy()
    expect(path.isAbsolute(file.fsPath)).toBeTruthy()
    expect(file.kind).toBe(FileKind.TS)
    expect(file).not.toHaveProperty('start')
    expect(file).not.toHaveProperty('end')
    expect(result).toMatchSnapshot()
  })

  it('no compatible', () => {
    const { file, result } = convertFile(filePath, __dirname, 'config/.nocompatible.vc2c.js')
    expect(file.fsPath.includes(filePath)).toBeTruthy()
    expect(path.isAbsolute(file.fsPath)).toBeTruthy()
    expect(file.kind).toBe(FileKind.TS)
    expect(file).not.toHaveProperty('start')
    expect(file).not.toHaveProperty('end')
    expect(result).toMatchSnapshot()
  })
})
