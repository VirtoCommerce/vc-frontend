<template>
  <div class="cp-materials">
    <div class="cp-materials__content">
      <slot name="title" v-bind="{ title }">
        <div v-if="title" class="cp-materials__title" v-text="title" />
      </slot>

      <slot name="description" v-bind="{ description }">
        <div v-if="description" class="cp-materials__description" v-text="description" />
      </slot>

      <slot name="items" v-bind="{ items }">
        <ul class="cp-materials__list">
          <li v-for="(item, i) in items" :key="i" class="cp-materials__item" v-text="item" />
        </ul>
      </slot>

      <slot name="button" v-bind="{ buttonText, link }">
        <sf-button :link="link" class="sf-button--outline color-primary cp-materials__button" v-text="buttonText" />
      </slot>
    </div>

    <slot name="banner" v-bind="{ bannerImage, bannerDescription, bannerLinkText, bannerLink }">
      <div class="cp-materials__banner">
        <img class="sf-image cp-materials__img" :src="bannerImage" :alt="bannerDescription" />

        <div class="cp-materials__info">
          <div v-if="bannerDescription" class="cp-materials__text" v-text="bannerDescription" />
          <sf-link :link="bannerLink" class="cp-materials__link" v-text="bannerLinkText" />
        </div>
      </div>
    </slot>
  </div>
</template>

<script>
import {
  SfLink,
  SfButton
} from '@libs/storefrontUI/vue';

export default {
  name: 'CpMaterials',

  components: {
    SfLink,
    SfButton
  },

  props: {
    /**
     * CpMaterials title.
     */
    title: {
      type: String,
      'default': ''
    },
    /**
     * CpMaterials description.
     */
    description: {
      type: String,
      'default': ''
    },
    items: {
      type: Array,
      'default': []
    },
    /**
     * CpMaterials button text.
     */
    buttonText: {
      type: String,
      'default': ''
    },
    /**
     *  CpMaterials link.
     */
    link: {
      type: String,
      'default': ''
    },
    /**
     * CpMaterials banner description.
     */
    bannerDescription: {
      type: String,
      'default': ''
    },
    /**
     * Text that will be displayed inside the button.
     */
    bannerLinkText: {
      type: String,
      'default': ''
    },
    /**
     *  CpMaterials banner link.
     */
    bannerLink: {
      type: String,
      'default': ''
    },
    /**
     * Background image.
     */
    bannerImage: {
      type: String,
      'default': '',
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/components/organisms/CpMaterials.scss";
</style>
