<template>
  <div class="sf-header-navigation-item" v-on="$listeners">
    <div
      class="sf-header-navigation-item__item sf-header-navigation-item__item--desktop">
      <slot name="desktop-navigation-item">
        <SfLink class="sf-header-navigation-item__link" :link="link">
          {{
            label
          }}
        </SfLink>
      </slot>
      <slot></slot>
    </div>
    <div
      class="sf-header-navigation-item__item sf-header-navigation-item__item--mobile">
      <slot name="mobile-navigation-item">
        <SfMenuItem :label="label" class="sf-header-navigation-item__menu-item">
          {{ label }}
        </SfMenuItem>
      </slot>
      <div class="sf-header-navigation-item__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>
import SfLink from "../../../atoms/SfLink/SfLink.vue";
import SfMenuItem from "../../../molecules/SfMenuItem/SfMenuItem.vue";

export default {
  name: "SfHeaderNavigationItem",
  components: {
    SfLink,
    SfMenuItem
  },
  props: {
    label: {
      type: String,
      "default": ""
    },
    link: {
      type: [String, Object],
      "default": ""
    }
  }
};
</script>
