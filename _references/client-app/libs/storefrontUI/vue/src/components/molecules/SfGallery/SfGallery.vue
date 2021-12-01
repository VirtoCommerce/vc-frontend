<template>
  <div class="sf-gallery">
    <div class="sf-gallery__stage">
      <SfImage
        ref="sfGalleryBigImage"
        class="sf-gallery__big-image"
        :class="{ 'sf-gallery__big-image--has-zoom': enableZoom }"
        :src="pictureSelected.desktop.url"
        :alt="pictureSelected.alt"
        :width="imageWidth"
        :height="imageHeight"></SfImage>
    </div>

    <div class="sf-gallery__thumbs">
      <slot name="thumbs" v-bind="{ images, active: activeIndex, go }">
        <SfButton
          v-for="(image, index) in images"
          :key="'img-' + index"
          class="sf-button--pure sf-gallery__item"
          :class="{ 'sf-gallery__item--selected': index === activeIndex }"
          @click="go(index)">
          <SfImage
            class="sf-gallery__thumb"
            :src="image.mobile.url"
            :alt="image.alt"
            :width="thumbWidth"
            :height="thumbHeight"></SfImage>
        </SfButton>
      </slot>
    </div>
  </div>
</template>
<script>
import SfButton from "../../atoms/SfButton/SfButton.vue";
import SfImage from "../../atoms/SfImage/SfImage.vue";
export default {
  name: "SfGallery",
  components: {
    SfImage,
    SfButton
  },
  props: {
    /**
     * Images list
     */
    images: {
      type: Array,
      "default": () => []
    },
    /**
     * Images width, without unit
     */
    imageWidth: {
      type: [Number, String],
      "default": 422
    },
    /**
     * Images height, without unit
     */
    imageHeight: {
      type: [Number, String],
      "default": 664
    },
    /**
     * Thumb width, without unit
     */
    thumbWidth: {
      type: [Number, String],
      "default": 160
    },
    /**
     * Thumb height, without unit
     */
    thumbHeight: {
      type: [Number, String],
      "default": 160
    },
    /**
     * Initial image number (starting from 1)
     */
    current: {
      type: Number,
      "default": 1
    },
    /**
     * Glide slider options (https://glidejs.com/docs/options/)
     */
    sliderOptions: {
      type: Object,
      default() {
        return {
          type: "slider",
          autoplay: false,
          rewind: false,
          gap: 0
        };
      }
    },
    /**
     * Image zoom inside or overlap the stage
     */
    outsideZoom: {
      type: Boolean,
      "default": false
    },
    /**
     * Toogle for image zoom or overlap the stage
     */
    enableZoom: {
      type: Boolean,
      "default": false
    }
  },
  data() {
    return {
      positionStatic: {},
      eventHover: {},
      glide: null,
      activeIndex: this.current - 1,
      style: ""
    };
  },
  computed: {
    pictureSelected() {
      return this.images.length > 0 ? this.images[this.activeIndex] : { desktop: { url: '' }, alt: ''};
    }
  },
  methods: {
    go(index) {
      this.activeIndex = index;
      /**
       * Event for current image change (`v-model`)
       * @type {Event}
       */
      this.$emit("click", index + 1);
    }
  }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/molecules/SfGallery.scss";
</style>
