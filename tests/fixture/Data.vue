<script lang="ts">
import Vue from "vue";
import { Component } from "vue-class-component";
/**
 * My basic tag
 */
@Component({
  data() {
    return {
      isLoading: false,
      loginForm: {
        email: "",
        password: "",
      },
    };
  },
})
export default class MyComponent extends Vue {
  msg = "";

  public name: string | null = null;

  user = {
    first_name: "John",
    last_name: "Doe" as string | null,
    age: 42,
  };
}
</script>
