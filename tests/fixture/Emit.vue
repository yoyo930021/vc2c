<script lang="ts">
import Vue from "vue";
import { Component, Emit } from "vue-property-decorator";

interface Item {
  id: number;
  name: string;
}

/**
 * My basic tag
 */
@Component
export default class MyComponent extends Vue {
  currentValue = "";

  @Emit()
  onChange() {
    return this.currentValue;
  }

  @Emit("update:model-value")
  onInput() {
    return this.currentValue;
  }

  @Emit()
  reset() {
    this.currentValue = "";
  }
}
</script>
