<script lang="ts">
import Vue from "vue";
import { Component, Inject } from "vue-property-decorator";

const symbol = Symbol("baz");

/**
 * My basic tag
 */
@Component({})
export default class MyComponent extends Vue {
  @Inject() readonly foo!: string;
  @Inject("bar") readonly bar!: string;
  @Inject({ from: "optional", default: "default" }) readonly optional!: string;
  @Inject(symbol) readonly baz!: string;
}
</script>
