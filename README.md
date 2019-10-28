# vc2c
[![Actions Status](https://github.com/yoyo930021/vc2c/workflows/Node%20CI/badge.svg)](https://github.com/yoyo930021/vc2c/actions)
[![codecov](https://codecov.io/gh/yoyo930021/vc2c/branch/master/graph/badge.svg)](https://codecov.io/gh/yoyo930021/vc2c)
   
The vc2c project can convert vue class APIs to vue composition APIs in Vue.js components written in Typescript.  

## Introduction
![](https://github.com/yoyo930021/vc2c/blob/master/doc/flow.png)

ASTConvertPlugins is the most important part of this project, it can convert AST to composition APIs.  
Custom decorator in ASTConvertPlugins are supported, such as `@Subscription`.  
See [Writing a custom ASTConvert](#plugins) for more details.  

## Supports
The files to be converted must meet the criterias below:  
- Scripts must be written in Typescript. (JavaScript may be supported in the future.)  
- All syntax must be valid.  
- Node.js >= 8.x

### supported feature
- vue-class-component
  - Object
    - [x] `name`
    - [x] `props`
    - [x] `data`
    - [ ] `computed`
    - [ ] `methods`
    - [ ] `watch`
    - [x] intervalHook (ex: `mounted`)
    - [ ] `provide / inject`
    - [ ] `mixins`
    - [ ] `extends`
    - [x] `render`
  - Class
    - [x] `className`
    - [x] `computed`
    - [x] `data`
    - [x] intervalHook (ex: `mounted`)
    - [x] `render`
    - [x] `methods`
    - [ ] `Mixins`
- vue-property-decorator
  - [x] `@Prop`
  - [ ] `@PropSync`
  - [x] `@Model`
  - [x] `@Watch`
  - [ ] `@Provide / @Inject`
  - [ ] `@ProvideReactive / @InjectReactive`
  - [x] `@Emit`
  - [x] `@Ref`
- [x] replace `this` to `props`, `variable`, or `context`.
- [x] sort by dependency.


## Usage
The vc2c project has both CLI and API interface.

### CLI
```bash
# npm
npx vc2c single [cliOptions] <VueOrTSfilePath>

# yarn
yarn add vc2c
yarn vc2c single [cliOptions] <VueOrTSfilePath>

# volta
sudo volta install vc2c
vc2c single [cliOptions] <VueOrTSfilePath>
```

#### Options
```
-v, --view             Output file content on stdout, and no write file.
-o, --output           Output result file path.
-r, --root <root>      Set root path for calc file absolute path. Default:`process.cwd()`.
-c, --config <config>  Set vc2c config file path. Default: `'.vc2c.js'`.
-h, --help             Output usage information.
```

### API
```javascript
const { convert, convertFile } = require('vc2c')

// Get convert result script
const resultScript = convert(
  /* scriptContent */ fileContent, // cann't include vue file content, if vue file, only input script element content
  /* {Vc2cConfig} */ options
)

// Get FileInfo and scriptResult
const { file, result } = convertFile(
  /* VueOrTSfilePath */ filePath,
  /* rootPath */ cmdOptions.root,
  /* Vc2cConfigFilePath */ cmdOptions.config
)
```

### Vc2c Config
```typescript
{
  // root path for calc file absolute path, if in CLI, --root value will replace. default:`process.cwd()`
  root?: string
  // show debug message. default: `false`
  debug?: boolean,
  // if true, use @vue/composition-api. default: `false`
  compatible?: boolean
  // first setup function parameter name. default: `props`
  setupPropsKey?: string
  // second setup function parameter name. default: `context`
  setupContextKey?: string
  // Use custom version typescript. default: Typescript 3.6.4
  typesciprt?: typeof ts
  // Use custom version vue-template-compiler. default: vue-template-compiler 2.6.10
  vueTemplateCompiler?: typeof vueTemplateCompiler
  // Use custom eslint file path. if file not exists, use default vc2c eslint config.  default: `.eslintrc.js`
  eslintConfigFile?: string
  // Use custom ASTConvertPlugins for ASTConvert and ASTTransform
  plugins?: ASTConvertPlugins
}
```

## Plugins
### ASTConvertPlugins
```typescript
import * as ts from 'typescript'
// import { ASTConvertPlugins, ASTConverter, ASTTransform } from 'vc2c'
export interface ASTConvertPlugins {
  [ts.SyntaxKind.Decorator]: {
    // @Component decorator argument ASTConvert
    [ts.SyntaxKind.PropertyAssignment]: Array<ASTConverter<ts.PropertyAssignment>>
    [ts.SyntaxKind.MethodDeclaration]: Array<ASTConverter<ts.MethodDeclaration>>
  };
  // Class child AST will forEach ASTConverter until return ASTResult by AST SyntaxKind
  [ts.SyntaxKind.Identifier]: Array<ASTConverter<ts.Identifier>>
  [ts.SyntaxKind.HeritageClause]: Array<ASTConverter<ts.HeritageClause>>
  [ts.SyntaxKind.PropertyDeclaration]: Array<ASTConverter<ts.PropertyDeclaration>>
  [ts.SyntaxKind.GetAccessor]: Array<ASTConverter<ts.GetAccessorDeclaration>>
  [ts.SyntaxKind.SetAccessor]: Array<ASTConverter<ts.SetAccessorDeclaration>>
  [ts.SyntaxKind.MethodDeclaration]: Array<ASTConverter<ts.MethodDeclaration>>
  // When all ASTConvert finished, run ASTTransform.
  after: Array<ASTTransform>
}
```
### ASTConvertPlugins process
- Vue Class `@Component` decorator Object:
  - Vc2c will parse object properties of `@Component` argument by running `ASTConvert` functions in `plugins[ts.SyntaxKind.Decorator][property.kind as ts.SyntaxKind]` array.
  - When `ASTConvert` returns a `ASTResult`, vc2c will record the `ASTResult` and proceed to the next object property.
  - If `ASTConvert` returns `false`, vc2c will run the next `ASTConvert` function in the array.

- Vue Class:
  - Vc2c will parse `Class` AST childs by running `ASTConvert` functions in `plugins[AST.kind as ts.SyntaxKind]` array.
  - When `ASTConvert` returns a `ASTResult`, vc2c will record the `ASTResult` and proceed to the next object property.
  - If `ASTConvert` returns `false`, vc2c will run the next `ASTConvert` function in the array.

- Transform:
  - Vc2c will run all `ASTTransform` functions in `plugins.after` array after finishing the two steps above.
  - You can use it to merge or sort AST. ex: `computed`, `removeThis`.

### Tips
- You can use https://ts-ast-viewer.com/ to get Typescript ast.
- You can use built-in `ASTConvert` or `ASTTransform` in `ASTConvertPlugins`.
  ```typescript
  import { BuiltInPlugins } from 'vc2c'
  const astConvert: ASTConvert = BuiltInPlugins.convertProp
  ```
- You cas use built-in typescript AST utils.
  ```typescript
  import { getDecoratorNames, isInternalHook } from 'vc2c'
  ```
- `ASTConvert` functions must be placed in order by it's strictness in `ASTConvertPlugins`. Stricter function should be placed up front.

### ASTConvert Exmaple
- [`built-ins`](https://github.com/yoyo930021/vc2c/blob/master/src/plugins)

## Roadmap
- Add more TODO: comments on needed.
- Support more features.
- Convert project.
