<template>
  <router-view></router-view>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
  name: "home"
})
export default class App extends Vue {

  // todo: remove
  throwError() {
    throw new Error();
  }
}
</script>
