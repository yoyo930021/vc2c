<script lang="ts">
import Vue from "vue";
import { Component } from "vue-class-component";
/**
 * My basic tag
 */
@Component
export default class MyComponent extends Vue {
  beforeCreate() {
    console.log("before create");
  }

  created() {
    console.log("created");
  }

  mounted() {
    console.log("mounted");
  }

  beforeUpdate() {
    console.log("before update");
  }

  updated() {
    console.log("updated");
  }

  beforeDestroy() {
    console.log("before destroy");
  }

  destroyed() {
    console.log("destroyed");
  }
}
</script>
