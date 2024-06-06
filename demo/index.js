import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { convert } from "../dist";

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
}`;

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "typescript" || label === "javascript") {
      return tsWorker();
    }
    return editorWorker();
  },
};

const vc2cConfig = {
  compatible: false,
  useFunctionDeclaration: false,
};

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  experimentalDecorators: true,
  noResolve: true,
  target: "esnext",
  allowNonTsExtensions: true,
  noEmit: true,
  lib: ["esnext", "dom", "dom.iterable", "scripthost"],
  module: "esnext",
  strict: true,
  esModuleInterop: true,
  resolveJsonModule: true,
});

const editor = monaco.editor.create(document.getElementById("editor"), {
  value: defaultCode,
  language: "typescript",
  theme: "vs-dark",
  minimap: {
    enabled: false,
  },
});

const output = monaco.editor.create(document.getElementById("output"), {
  value: await convert("index.ts", defaultCode, vc2cConfig),
  language: "typescript",
  theme: "vs-dark",
});

const setOutput = async () => {
  output.setValue(await convert("index.ts", editor.getValue(), vc2cConfig));
};

editor.onDidChangeModelContent(() => {
  setOutput();
});

window.addEventListener("resize", () => {
  editor.layout();
  output.layout();
});

const compatibleCheckbox = document.getElementById("compatible");
compatibleCheckbox.addEventListener("change", () => {
  vc2cConfig.compatible = compatibleCheckbox.checked;
  setOutput();
});

const useFunctionDeclarationCheckbox = document.getElementById(
  "use_function_declaration",
);
useFunctionDeclarationCheckbox.addEventListener("change", () => {
  vc2cConfig.useFunctionDeclaration = useFunctionDeclarationCheckbox.checked;
  setOutput();
});
