<template>
  <div class="sf-top-bar">
    <div class="sf-top-bar__container">
      <div class="sf-top-bar__left">
        <!--@slot Custom left content-->
        <slot name="left"></slot>
      </div>
      <div class="sf-top-bar__center">
        <!--@slot Custom center content-->
        <slot name="center"></slot>
      </div>
      <div class="sf-top-bar__right">
        <!--@slot Custom right content-->
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "SFTopBar"
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/organisms/SfTopBar.scss";
</style>
