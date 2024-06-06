<script lang="ts">
import Vue from "vue";
import { Component, Provide } from "vue-property-decorator";

const symbol = Symbol("baz");

/**
 * My basic tag
 */
@Component({})
export default class MyComponent extends Vue {
  @Provide() foo = "foo";
  @Provide("bar") baz = "bar";
  @Provide(symbol) fiz = "fiz";
}
</script>
