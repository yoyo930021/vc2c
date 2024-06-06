<script lang="ts">
import { Vue, Component, Ref } from "vue-property-decorator";
import AnotherComponent from "@/path/to/another-component.vue";

@Component
export default class MyComponent extends Vue {
  @Ref() readonly anotherComponent!: AnotherComponent;
  @Ref("aButton") readonly button!: HTMLButtonElement;
}
</script>
