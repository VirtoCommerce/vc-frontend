<template>
  <div class="sf-accordion-item">
    <!-- @slot -->
    <slot
      name="header"
      v-bind="{
        header,
        isOpen,
        accordionClick,
        showChevron: $parent.showChevron,
      }">
      <SfButton
        :aria-pressed="isOpen.toString()"
        :aria-expanded="isOpen.toString()"
        :class="{ 'is-open': isOpen }"
        class="sf-button--pure sf-accordion-item__header"
        @click="accordionClick">
        {{ header }}
        <!-- @slot here you can add additional information about this item -->
        <slot name="additional-info"></slot>
        <SfChevron
          tabindex="0"
          class="sf-accordion-item__chevron"
          :class="{ 'sf-chevron--right': !isOpen }"></SfChevron>
      </SfButton>
    </slot>
    <SfExpand :transition="$parent.transition">
      <div v-if="isOpen">
        <div class="sf-accordion-item__content">
          <!-- @slot -->
          <slot></slot>
        </div>
      </div>
    </SfExpand>
  </div>
</template>
<script>
import { focus } from "../../../../utilities/directives";
import SfExpand from "../../../../utilities/transitions/component/SfExpand";
import SfButton from "../../../atoms/SfButton/SfButton.vue";
import SfChevron from "../../../atoms/SfChevron/SfChevron.vue";
export default {
  name: "SfAccordionItem",
  directives: { focus },
  components: {
    SfChevron,
    SfButton,
    SfExpand
  },
  props: {
    header: {
      type: String,
      "default": ""
    }
  },
  data() {
    return {
      isOpen: false
    };
  },
  methods: {
    accordionClick() {
      this.$parent.$emit("toggle", this._uid);
    }
  }
};
</script>
<style lang="scss">
@import "assets/styles/scss/components/organisms/SfAccordion.scss";
</style>
