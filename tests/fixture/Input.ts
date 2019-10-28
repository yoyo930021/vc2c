import Vue from 'vue'
import { Prop, Component, Ref, Model, Watch, Emit } from 'vue-property-decorator'

/**
 * My basic tag
 */
@Component({
  name: 'oao',
  props: {
    bar: String
  },
  data () {
    const a = 'pa'
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
  @Prop({ type: Number, default: false }) foo!: number

  /**
   * My msg
   */
  msg = 'Vetur means "Winter" in icelandic.' // foo

  /**
   * My count
   */
  get count () {
    return this.$store.state.count
  }

  @Watch('checked', { deep: true, immediate: true })
  onCheckedChanged (val: boolean, newVal: boolean) {
    console.log(val, newVal)
    console.log(this.anotherComponent)
  }

  @Watch('msg')
  onMsgChanged (val: string, newVal: string) {
    console.log(val, newVal)
  }

  mounted () {
    this.click('oao')
  }

  created () {
    this.removeItem()
  }

  @Emit()
  click (c: string) {}

  @Emit('remove')
  removeItem () {
    if (this.foo > 10) {
      return 10
    } else {
      return this.foo
    }
  }

  /**
   * My greeting
   */
  hello () {
    console.log(this.msg)
  }
}
