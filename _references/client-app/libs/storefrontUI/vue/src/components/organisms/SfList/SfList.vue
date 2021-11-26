<template>
  <ul class="sf-list">
    <!-- @slot -->
    <slot></slot>
  </ul>
</template>
<script>
import Vue from "vue";
import SfListItem from "./_internal/SfListItem.vue";
Vue.component("SfListItem", SfListItem);
export default {
  name: "SfList"
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/organisms/SfList.scss";
</style>
