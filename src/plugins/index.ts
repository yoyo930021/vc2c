import * as ts from 'typescript'
import { Vc2cOptions } from '../options'
import { ASTConvertPlugins, ASTResult, ASTConverter, ASTResultKind } from './types'
import { copySyntheticComments, addTodoComment, convertNodeToASTResult } from '../utils'
import { log } from '../debug'
import { convertObjName } from './vue-class-component/object/ComponentName'
import { convertObjProps } from './vue-class-component/object/Prop'
import { convertObjData } from './vue-class-component/object/Data'
import { convertName, mergeName } from './vue-class-component/ComponentName'
import { convertModel } from './vue-property-decorator/Model'
import { convertProp, mergeProps } from './vue-property-decorator/Prop'
import { convertDomRef } from './vue-property-decorator/DomRef'
import { convertData } from './vue-class-component/Data'
import { convertGetter, convertSetter, mergeComputed } from './vue-class-component/Computed'
import { convertIntervalHook } from './vue-class-component/IntervalHook'
import { convertWatch } from './vue-property-decorator/Watch'
import { convertEmitMethod } from './vue-property-decorator/Emit'
import { convertMethod } from './vue-class-component/Method'
import { removeThisAndSort } from './removeThisAndSort'
import { convertRender } from './vue-class-component/Render'
import { convertInject } from './vue-property-decorator/Inject'
import { convertProvide } from './vue-property-decorator/Provide'

export function getDefaultPlugins (tsModule: typeof ts): ASTConvertPlugins {
  return {
    [tsModule.SyntaxKind.Decorator]: {
      [tsModule.SyntaxKind.PropertyAssignment]: [
        convertObjName,
        convertObjProps
      ],
      [tsModule.SyntaxKind.MethodDeclaration]: [
        convertObjData,
        convertIntervalHook
      ]
    },
    [tsModule.SyntaxKind.Identifier]: [
      convertName
    ],
    [tsModule.SyntaxKind.HeritageClause]: [
      // TODO: extends Minix
    ],
    [tsModule.SyntaxKind.PropertyDeclaration]: [
      convertModel,
      convertProp,
      convertDomRef,
      convertProvide,
      convertInject,
      convertData
    ],
    [tsModule.SyntaxKind.GetAccessor]: [
      convertGetter
    ],
    [tsModule.SyntaxKind.SetAccessor]: [
      convertSetter
    ],
    [tsModule.SyntaxKind.MethodDeclaration]: [
      convertRender,
      convertIntervalHook,
      convertWatch,
      convertEmitMethod,
      convertMethod
    ],
    after: [
      mergeName,
      mergeProps,
      mergeComputed,
      removeThisAndSort
    ]
  }
}

export function getDecoratorArgumentExpr (node: ts.Node) {
  if (ts.isCallExpression(node)) {
    if (node.arguments.length > 0) {
      return node.arguments[0] as ts.ObjectLiteralExpression
    }
  }

  return undefined
}

export function getASTResults (
  node: ts.ClassDeclaration,
  options: Vc2cOptions,
  program: ts.Program
) {
  const tsModule = options.typesciprt
  const converterPlugins = options.plugins

  let astResults: ASTResult<ts.Node>[] = []
  node.forEachChild((child) => {
    if (tsModule.isDecorator(child)) {
      const objExpr = getDecoratorArgumentExpr(child.expression)
      if (objExpr) {
        objExpr.forEachChild((property) => {
          if (property.kind in converterPlugins[tsModule.SyntaxKind.Decorator]) {
            const objConverters = (converterPlugins[tsModule.SyntaxKind.Decorator] as unknown as { [index: number]: Array<ASTConverter<ts.Node>> })[property.kind]
            let converted = false
            for (const converter of objConverters) {
              const result = converter(property, options, program)
              if (result) {
                astResults.push(result)
                converted = true
                break
              }
            }
            if (!converted) {
              astResults.push(convertNodeToASTResult(tsModule, property))
            }
          }
        })
      }
    } else {
      if (child.kind in converterPlugins) {
        const converters = (converterPlugins as unknown as { [index: number]: Array<ASTConverter<ts.Node>> })[child.kind]
        for (const converter of converters) {
          const result = converter(child, options, program)
          if (result) {
            astResults.push(result)
            break
          }
        }
      }
    }
  })

  for (const fn of converterPlugins.after) {
    astResults = fn(astResults, options, program)
  }

  return astResults
}

export function convertASTResultToSetupFn (astResults: ASTResult<ts.Node>[], options: Vc2cOptions) {
  const tsModule = options.typesciprt

  const returnStatement = addTodoComment(
    tsModule,
    tsModule.createReturn(
      tsModule.createObjectLiteral([
        ...astResults
          .filter((el) => el.kind === ASTResultKind.COMPOSITION)
          .reduce((array, el) => array.concat(el.attrutibes), [] as string[])
          .map((el) => tsModule.createShorthandPropertyAssignment(
            tsModule.createIdentifier(el),
            undefined
          ))
      ])
    ),
    'Please remove unused return variable',
    false
  )

  return tsModule.createMethod(
    undefined,
    undefined,
    undefined,
    tsModule.createIdentifier('setup'),
    undefined,
    undefined,
    [
      tsModule.createParameter(
        undefined,
        undefined,
        undefined,
        tsModule.createIdentifier(options.setupPropsKey),
        undefined,
        undefined,
        undefined
      ),
      tsModule.createParameter(
        undefined,
        undefined,
        undefined,
        tsModule.createIdentifier(options.setupContextKey),
        undefined,
        undefined,
        undefined
      )
    ],
    undefined,
    tsModule.createBlock(
      [
        ...astResults
          .filter((el) => el.kind === ASTResultKind.COMPOSITION)
          .map((el) => el.nodes)
          .reduce((array, el) => array.concat(el), []) as ts.Statement[],
        returnStatement
      ],
      true
    )
  )
}

export function convertASTResultToImport (astResults: ASTResult<ts.Node>[], options: Vc2cOptions) {
  interface Clause { named: Set<string>, default?: string }

  const tsModule = options.typesciprt
  const importMap: Map<string, Clause> = new Map()
  for (const result of astResults) {
    for (const importInfo of result.imports) {
      const key: string = ('external' in importInfo) ? importInfo.external : importInfo.path
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const temp: Clause = (importMap.has(key)) ? importMap.get(key)! : { named: new Set() }
      if ((!('default' in temp)) && 'default' in importInfo) {
        temp.default = importInfo.default
      }
      for (const named of importInfo.named || []) {
        temp.named.add(named)
      }
      importMap.set(key, temp)
    }
  }

  if (options.compatible && importMap.has('@vue/composition-api')) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const temp = importMap.get('@vue/composition-api')!
    temp.named.add('createComponent')
    importMap.set('@vue/composition-api', temp)
  }

  return Array.from(importMap).map((el) => {
    const [key, clause] = el
    return tsModule.createImportDeclaration(
      undefined,
      undefined,
      tsModule.createImportClause(
        (clause.default) ? tsModule.createIdentifier(clause.default) : undefined,
        tsModule.createNamedImports([...clause.named]
          .map((named) => tsModule.createImportSpecifier(
            undefined,
            tsModule.createIdentifier(named)
          ))
        )
      ),
      tsModule.createStringLiteral(key)
    )
  })
}

export function runPlugins (
  node: ts.ClassDeclaration,
  options: Vc2cOptions,
  program: ts.Program
): ts.Statement[] {
  const tsModule = options.typesciprt
  log('Start Run ASTPlugins')
  const results = getASTResults(node, options, program)
  log('Finished ASTPlugins')

  log('Make setup function')
  const setupFn = convertASTResultToSetupFn(results, options)
  log('Make default export object')
  const exportDefaultExpr = (options.compatible)
    ? tsModule.createCall(
      tsModule.createIdentifier('createComponent'),
      undefined,
      [tsModule.createObjectLiteral(
        [
          ...results
            .filter((el) => el.kind === ASTResultKind.OBJECT)
            .map((el) => el.nodes)
            .reduce((array, el) => array.concat(el), []) as ts.PropertyAssignment[],
          setupFn
        ],
        true
      )]
    )
    : tsModule.createObjectLiteral(
      [
        ...results
          .filter((el) => el.kind === ASTResultKind.OBJECT)
          .map((el) => el.nodes)
          .reduce((array, el) => array.concat(el), []) as ts.PropertyAssignment[],
        setupFn
      ],
      true
    )

  const exportAssignment = copySyntheticComments(
    tsModule,
    tsModule.createExportAssignment(
      undefined,
      undefined,
      undefined,
      exportDefaultExpr
    ),
    node
  )

  log('Make ImportDeclaration')
  const importDeclaration = convertASTResultToImport(results, options)

  return [
    ...importDeclaration,
    exportAssignment
  ]
}
