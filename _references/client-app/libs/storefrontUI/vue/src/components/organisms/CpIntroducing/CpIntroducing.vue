<template>
  <div class="cp-introducing" :style="style">
    <div class="cp-introducing__container">
      <slot name="image" v-bind="{ image }">
        <div v-if="image" class="cp-introducing__img-container">
          <img class="sf-image cp-introducing__img"
               :src="image"
               :alt="title" />
        </div>
      </slot>

      <div class="cp-introducing__content">
        <slot name="sub-title" v-bind="{ subTitle }">
          <div v-if="subTitle"
               class="cp-introducing__subtitle"
               v-text="subTitle" />
        </slot>

        <slot name="title" v-bind="{ title }">
          <div v-if="title"
               class="cp-introducing__title"
               v-text="title" />
        </slot>

        <slot name="description" v-bind="{ description }">
          <div v-if="description"
               class="cp-introducing__description"
               v-text="description" />
        </slot>

        <slot name="button" v-bind="{ buttonText }">
          <SfButton
            v-if="buttonText"
            :link="link"
            class="sf-button--outline color-primary cp-introducing__button"
            v-text="buttonText" />
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import {
  SfButton
} from '@libs/storefrontUI/vue';

export default {
  name: 'CpIntroducing',

  components: {
    SfButton
  },

  props: {
    /**
     * CpIntroducing title.
     */
    title: {
      type: String,
      'default': ''
    },
    /**
     * CpIntroducing subtitle.
     */
    subTitle: {
      type: String,
      'default': ''
    },
    /**
     * Text that will be displayed inside the button.
     */
    buttonText: {
      type: String,
      'default': ''
    },
    /**
     *  CpIntroducing link. If it's filled in, changes button tag on a tag.
     */
    link: {
      type: String,
      'default': ''
    },
    /**
     * CpIntroducing description.
     */
    description: {
      type: String,
      'default': ''
    },
    /**
     * Background color.
     */
    background: {
      type: String,
      'default': ''
    },
    /**
     * Background image.
     */
    image: {
      type: String,
      'default': ''
    }
  },

  computed: {
    style() {
      const background = this.background;

      return {
        "--_cp-introducing-background": background
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/components/organisms/CpIntroducing.scss";
</style>
