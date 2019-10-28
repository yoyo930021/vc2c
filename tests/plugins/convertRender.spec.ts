import { convert } from '../../src'

describe('test convertRender', () => {
  it('convert class component render function', () => {
    const content = `
    import { Vue, Component } from 'vue-class-component'

    @Component
    export default class TestComp extends Vue {
      render () {
        return this.$slots.default
      }
    }
    `

    const result = convert(content, {})

    expect(result).toMatchSnapshot()
  })
})
