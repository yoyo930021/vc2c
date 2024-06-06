<script lang="ts">
import Vue from "vue";
import { Component } from "vue-class-component";
/**
 * My basic tag
 */
@Component
export default class MyComponent extends Vue {
  render(h) {
    return h("div");
  }
}
</script>
