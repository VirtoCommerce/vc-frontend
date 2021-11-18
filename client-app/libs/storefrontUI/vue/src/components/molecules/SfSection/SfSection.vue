<template>
  <section class="sf-section" :style="style">
    <!--@slot Section heading. Slot content will replace default <sf-heading> component-->
    <slot
      name="heading"
      v-bind="{ levelHeading, titleHeading, subtitleHeading }">
      <SfHeading
        v-if="titleHeading || subtitleHeading"
        :level="levelHeading"
        :title="titleHeading"
        :description="subtitleHeading" />
    </slot>
    <!--@slot Section content.-->
    <div class="sf-section__content">
      <!--@slot Section content.-->
      <slot></slot>
    </div>
  </section>
</template>

<script>
import SfHeading from "../../atoms/SfHeading/SfHeading.vue";
export default {
  name: "SfSection",
  components: {
    SfHeading
  },
  props: {
    /**
     * Heading title
     */
    titleHeading: {
      type: String,
      "default": ""
    },
    /**
     * Heading subtitle
     */
    subtitleHeading: {
      type: String,
      "default": ""
    },
    /**
     * Heading tag level
     */
    levelHeading: {
      type: Number,
      "default": 2
    },
    /** Background color */
    background: {
      type: String,
      "default": ""
    },
    /** Background image path */
    image: {
      type: [Object, String],
      "default": ""
    }
  },
  computed: {
    style() {
      const { image, background } = this;

      return {
        "--_section-background-image": image.mobile ? `url(${image.mobile})` : `url(${image})`,
        "--_section-background-desktop-image": image.desktop && `url(${image.desktop})`,
        "--_section-background-color": background
      };
    }
  }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/molecules/SfSection.scss";
</style>
