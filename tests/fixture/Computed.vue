<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

interface Item {
  id: number;
  name: string;
  active: boolean;
}

/**
 * My basic tag
 */
@Component({})
export default class MyComponent extends Vue {
  @Prop({ type: [Object, Array], default: null })
  items: Item[] | Item;

  @Prop({ type: String, default: "" })
  firstName: string;

  @Prop({ type: String, default: "" })
  lastName: string;

  get activeItems() {
    return this.items.filter((item) => item.selected);
  }

  get fullName() {
    return this.getFullName(this.firstName, this.lastName);
  }

  set fullName(v: string) {
    const [firstName = "", lastName = ""] = v.split(" ");

    this.$emit("update:firstName", firstName);
    this.$emit("update:lastName", lastName);
  }

  get count() {
    return this.$store.state.count;
  }

  getFullName(firstName: string, lastName: string) {
    return `${firstName} ${lastName}`.trim();
  }
}
</script>
