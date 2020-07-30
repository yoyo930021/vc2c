import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js'
import { convert } from '../dist/index.browser'

const defaultCode = `import Vue from 'vue'
import { Prop, Component, Ref, Model, Provide, Inject } from 'vue-property-decorator'

const symbol = Symbol('baz')

/**
 * My basic tag
 */
@Component({
  name: 'oao',
  props: ['bar', 'qaq', 'cac'],
  data () {
    const a = 'pa';
    return {
      a: a
    }
  }
})
export default class BasicPropertyClass extends Vue {
  @Ref() readonly anotherComponent!: HTMLElement
  @Model('change', { type: Boolean }) readonly checked!: boolean
  /**
   * My foo
   */
  @Prop({ type: Boolean, default: false }) foo: any

  @Provide() foa = 'foo'
  @Provide('bar') baz = 'bar'

  @Inject() readonly foai!: string
  @Inject('bar') readonly bari!: string
  @Inject({ from: 'optional', default: 'default' }) readonly optional!: string
  @Inject(symbol) readonly bazi!: string

  /**
   * My msg
   */
  msg = 'Vetur means "Winter" in icelandic.' //foo

  /**
   * My count
   */
  get count () {
    return this.$store.state.count
  }

  /**
   * My greeting
   */
  hello () {
    console.log(this.msg)
  }
}`

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js'
    }
    return './editor.worker.js'
  }
}

const vc2cConfig = {
  compatible: false
}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  experimentalDecorators: true,
  noResolve: true,
  target: 'esnext',
  allowNonTsExtensions: true,
  noEmit: true,
  lib: [
    'esnext',
    'dom',
    'dom.iterable',
    'scripthost'
  ],
  module: 'esnext',
  strict: true,
  esModuleInterop: true,
  resolveJsonModule: true
})

const editor = monaco.editor.create(document.getElementById('editor'), {
  value: defaultCode,
  language: 'typescript',
  theme: 'vs-dark',
  minimap: {
    enabled: false
  }
})

const output = monaco.editor.create(document.getElementById('output'), {
  value: convert(defaultCode, vc2cConfig),
  language: 'typescript',
  theme: 'vs-dark'
})

const setOutput = () => {
  output.setValue(convert(editor.getValue(), vc2cConfig))
}

editor.onDidChangeModelContent(() => {
  setOutput()
})

window.addEventListener('resize', () => {
  editor.layout()
  output.layout()
})

const compatibleCheckbox = document.getElementById('compatible')
compatibleCheckbox.addEventListener('change', () => {
  vc2cConfig.compatible = compatibleCheckbox.checked
  setOutput()
})
