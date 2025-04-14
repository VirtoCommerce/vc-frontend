<template>
  <div class="vc-collapsible-content">
    <div
      ref="contentWrapperElement"
      :class="[
        'vc-collapsible-content__wrapper',
        {
          'vc-collapsible-content__wrapper--collapsed': !showAll,
          'vc-collapsible-content__wrapper--end-gradient': !showAll && showSeeMoreButton,
        },
      ]"
    >
      <div ref="contentElement" class="vc-collapsible-content__content">
        <slot />
      </div>
    </div>

    <slot v-if="showSeeMoreButton" name="toggle-button" v-bind="{ showAll }">
      <div class="vc-collapsible-content__button">
        <VcButtonSeeMoreLess v-model="showAll" />
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { computed, ref, shallowRef, toRef, watch, watchEffect } from "vue";
import type { ComponentPublicInstance } from "vue";

interface IEmits {
  (event: "update:collapse", value: boolean): void;
}

interface IProps {
  maxHeight?: string;
  collapse?: boolean;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  maxHeight: "",
});

const contentWrapperElement = shallowRef<HTMLDivElement>();
const contentElement = shallowRef<ComponentPublicInstance>();

const collapse = toRef(props, "collapse");
const showAll = ref(collapse.value);

const { height: contentWrapperElementHeight } = useElementSize(contentWrapperElement);
const { height: contentElementHeight } = useElementSize(contentElement);

const showSeeMoreButton = computed<boolean>(
  () => contentElementHeight.value > contentWrapperElementHeight.value || showAll.value,
);

watchEffect(() => {
  showAll.value = collapse.value;
});

watch(showAll, (value: boolean) => {
  if (value !== collapse.value) {
    emit("update:collapse", value);
  }
});
</script>

<style lang="scss">
.vc-collapsible-content {
  --props-max-height: v-bind("props.maxHeight");
  --max-height: var(--props-max-height, var(--vc-collapsible-content-max-height));

  &__wrapper {
    @apply relative;

    &--collapsed {
      @apply overflow-y-hidden max-h-[--max-height];

      @media print {
        @apply max-h-none;
      }
    }

    &--end-gradient {
      &:after {
        @apply absolute block bottom-0 content-[''] h-10 w-full bg-gradient-to-t from-additional-50;

        @media print {
          @apply content-none;
        }
      }
    }
  }

  &__button {
    @apply mt-3;

    @media print {
      @apply hidden;
    }
  }
}
</style>
