<template>
  <div class="sf-banner-grid">
    <template v-if="bannerGrid === 1">
      <div class="sf-banner-grid__row">
        <div class="sf-banner-grid__col">
          <slot name="banner-A"></slot>
        </div>
        <div class="sf-banner-grid__col sf-banner-grid__col--medium">
          <slot name="banner-B"></slot>
        </div>
        <div class="sf-banner-grid__col">
          <div class="sf-banner-grid__row">
            <div class="sf-banner-grid__col">
              <slot name="banner-C"></slot>
            </div>
          </div>
          <div class="sf-banner-grid__row">
            <div class="sf-banner-grid__col">
              <slot name="banner-D"></slot>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="bannerGrid === 2">
      <div class="sf-banner-grid__row">
        <div class="sf-banner-grid__col sf-banner-grid__col--small">
          <slot name="banner-A"></slot>
        </div>
        <div class="sf-banner-grid__col">
          <div class="sf-banner-grid__row">
            <div class="sf-banner-grid__col sf-banner-grid__col--higher">
              <slot name="banner-B"></slot>
            </div>
            <div class="sf-banner-grid__col sf-banner-grid__col--higher">
              <slot name="banner-C"></slot>
            </div>
          </div>
          <div class="sf-banner-grid__row">
            <div class="sf-banner-grid__col">
              <slot name="banner-D"></slot>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: "SfBannerGrid",
  props: {
    bannerGrid: {
      type: Number,
      "default": 1
    }
  }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/organisms/SfBannerGrid.scss";
</style>
