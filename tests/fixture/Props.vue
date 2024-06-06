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
    msg: null,
    name: {},
    loading: Boolean,
    focused: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
    },
  },
})
export default class MyComponent extends Vue {
  @Prop({ type: String, default: null })
  propName: string | null;

  @Prop({ type: [Object, Array], default: null })
  selected: Item[] | Item;
}
</script>
