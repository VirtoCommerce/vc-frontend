<template>
  <SfButton class="sf-arrow"
            type="button"
            v-bind="$attrs"
            v-on="$listeners">
    <!--@slot Use this slot to replace arrow icon-->
    <slot>
      <SfIcon
        size="1.5rem"
        icon="arrow_left"
        aria-hidden="true"
        class="sf-arrow__icon"></SfIcon>
    </slot>
  </SfButton>
</template>
<script>
import SfButton from "../SfButton/SfButton.vue";
import SfIcon from "../SfIcon/SfIcon.vue";
export default {
  name: "SfArrow",
  components: { SfButton, SfIcon }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/atoms/SfArrow.scss";
</style>
