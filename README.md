# vc2c
The vc2c project can convert vue class api to vue composition api in Vue.js components on Typescript.

## Introduction
![](https://github.com/yoyo930021/vc2c/blob/master/doc/flow.png)

ASTConvertPlugins is the most important part.   
It can convert ast to composition api, and it's customize.   
You can support custom decorator in ASTConvertPlugins, like `@Subscription`.

PS. [Write a custom ASTConvert and use it](#plugins)

## Support
The file need the following points.
- Typescript in script (maybe support javascript in the future)
- No Invaid syntax
### support feature
- vue-class-component
  - Object
    - [x] `name`
    - [x] `props`
    - [x] `data`
    - [ ] `computed`
    - [ ] `methods`
    - [ ] `watch`
    - [ ] intervalHook (ex: `mounted`)
    - [ ] `provide / inject`
    - [ ] `mixins`
    - [ ] `extends`
  - Class
    - [x] `className`
    - [x] `computed`
    - [x] `data`
    - [x] intervalHook (ex: `mounted`)
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
- [x] replace this to `props` or `variable` or `context`.
- [x] sort by dependence


## Usage
The vc2c project have CLI or API interface.

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

#### cliOptions
```
-v, --view             output file content on stdout, and no write file.
-o, --output           output result file path
-r, --root <root>      set root path for calc file absolute path default:`process.cwd()`
-c, --config <config>  set vc2c config file path, default: `'.vc2c.js'`
-h, --help             output usage information
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

### Vc2cConfig
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
- Vue Class `@Component` decorator Object
  - The vc2c will parse `@Component` decorator argument object propertys, and run `ASTConvert` functions in `plugins[ts.SyntaxKind.Decorator][property.kind as ts.SyntaxKind]` array.
  - When `ASTConvert` function return `ASTResult`, The vc2c record `ASTResult` and next object property.
  - if `ASTConvert` function return `false`, The vc2c run next `ASTConvert` function in array.

- Vue Class
  - The vc2c will parse `Class` AST childs, and run `ASTConvert` functions in `plugins[AST.kind as ts.SyntaxKind]` array.
  - When `ASTConvert` function return `ASTResult`, The vc2c record `ASTResult` and next object property.
  - if `ASTConvert` function return `false`, The vc2c run next `ASTConvert` function in array.
- Transform
  - The vc2c will run all `ASTTransform` in `plugins.after` array.
  - You can use it to merge AST or sort. ex: `computed`,`removeThis`

### Tips
- You can use https://ts-ast-viewer.com/ to get Typescript ast.
- You can use built-in `ASTConvert` or `ASTTransform` in `ASTConvertPlugins`
  ```typescript
  import { BuiltInPlugins } from 'vc2c'
  const astConvert: ASTConvert = BuiltInPlugins.convertProp
  ```
- You cas use built-in typescript ast utils.
  ```typescript
  import { getDecoratorNames, isInternalHook } from 'vc2c'
  ```
- You must put `ASTConvert` more special more top in `ASTConvertPlugins`

### ASTConvert Exmaple
- [`built-ins`](https://github.com/yoyo930021/vc2c/blob/master/src/plugins)

## Roadmap
- add TODO: comments for user prompt action
- Support more features
- convert project
