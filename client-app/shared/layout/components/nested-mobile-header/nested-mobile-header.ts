import { defineComponent, onBeforeUnmount, warn, h, createCommentVNode, useSlots, watchEffect, watch } from "vue";
import { useNestedMobileHeader } from "@/shared/layout";

export default defineComponent({
  name: "NestedMobileHeader",

  props: {
    show: {
      type: Boolean,
      default: true,
    },

    animated: {
      type: Boolean,
      default: false,
    },
  },

  /**
   * To find out which slots are used, see the file:
   * client-app/shared/layout/components/header/_internal/mobile-header.vue
   */
  template: "<slot><slot name='left'></slot><slot name='right'></slot></slot>",

  setup(props) {
    const slots = useSlots();
    const { setSlots, resetSlots, isAnimated } = useNestedMobileHeader();

    onBeforeUnmount(() => {
      resetSlots();
    });

    watch(
      () => props.show,
      (show) => {
        if (show) {
          setSlots(slots);
        } else {
          resetSlots();
        }

        if (!Object.keys(slots).length) {
          warn("Component content is empty.");
        }
      },
      { immediate: true }
    );

    watchEffect(async () => {
      isAnimated.value = props.animated;
    });

    return () => h(createCommentVNode(" Nested Mobile Header "));
  },
});
