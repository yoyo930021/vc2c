<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

interface Item {
  id: number;
  name: string;
}

/**
 * My basic tag
 */
@Component({
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
})
export default class MyComponent extends Vue {
  @Prop({ type: String, default: null })
  userName: string | null;

  greetings() {
    console.log(`hello ${this.userName ?? "Unknown"} (id: ${this.userId})`);
  }

  /**
   * Returns {void}
   */
  public noop(): void {}

  fn() {
    this.noop();
    this.greetings();
  }
}
</script>
