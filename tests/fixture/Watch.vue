<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";

/**
 * My basic tag
 */
@Component({})
export default class MyComponent extends Vue {
  @Prop({ type: String, default: "" })
  firstName: string;

  @Prop({ type: String, default: "" })
  lastName: string;

  get fullName() {
    return this.getFullName(this.firstName, this.lastName);
  }

  getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`.trim();
  }

  @Watch("fullName", { immediate: true })
  greetings() {
    console.log("hello", this.fullName);
  }

  @Watch("firstName")
  onFirstNameChanged() {
    console.log("changed first name", this.firstName);
  }
}
</script>
