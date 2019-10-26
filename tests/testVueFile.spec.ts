import { convertFile } from '../src'
import path from 'path'
import { FileKind } from '../src/file'

describe('testVueFile', () => {
  const filePath = 'fixture/Input.vue'

  it('compatible', () => {
    const { file, result } = convertFile(filePath, __dirname, 'config/.compatible.vc2c.js')
    expect(file.fsPath.includes(path.basename(filePath))).toBeTruthy()
    expect(path.isAbsolute(file.fsPath)).toBeTruthy()
    expect(file.kind).toBe(FileKind.VUE)
    expect(file).toHaveProperty('start')
    expect(file).toHaveProperty('end')
    expect(result).not.toEqual(/<script>/g)
    expect(result).toMatchSnapshot()
  })

  it('no compatible', () => {
    const { file, result } = convertFile(filePath, __dirname, 'config/.nocompatible.vc2c.js')
    expect(file.fsPath.includes(path.basename(filePath))).toBeTruthy()
    expect(path.isAbsolute(file.fsPath)).toBeTruthy()
    expect(file.kind).toBe(FileKind.VUE)
    expect(file).toHaveProperty('start')
    expect(file).toHaveProperty('end')
    expect(result).not.toEqual(/<script>/g)
    expect(result).toMatchSnapshot()
  })
})
