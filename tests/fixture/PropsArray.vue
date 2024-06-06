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
  props: ["msg", "name", "loading", "focused", "disabled"],
})
export default class MyComponent extends Vue {
  @Prop({ type: String, default: null })
  propName: string | null;

  @Prop({ type: [Object, Array], default: null })
  selected: Item[] | Item;
}
</script>
