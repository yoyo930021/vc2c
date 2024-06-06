<script lang="ts">
import { Vue, Component, Model } from "vue-property-decorator";

@Component
export default class YourComponent extends Vue {
  @Model("change", { type: Boolean }) readonly checked!: boolean;
}
</script>
