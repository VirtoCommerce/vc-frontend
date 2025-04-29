<template>
  <span :class="['vc-icon', sizeClass]" :style="style" v-html="icon"></span>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { getColorValue, loadIconRaw } from "@/ui-kit/utilities";

interface IProps {
  name?: string;
  size?: VcIconSizeType;
  color?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "document-text",
  color: "",
});

const icon = ref();

const style = computed(() =>
  typeof props.size === "number"
    ? {
        width: `${props.size}px`,
        height: `${props.size}px`,
      }
    : {},
);

const sizeClass = computed(() => (typeof props.size === "string" ? `vc-icon--size--${props.size}` : ""));

const _color = computed(() => getColorValue(props.color));

async function loadIcon(name?: string) {
  icon.value = await loadIconRaw(name);
}

watch(
  () => props.name,
  (newIconName: string) => {
    void loadIcon(newIconName);
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vc-icon {
  --props-color: v-bind(_color);

  --size: var(--vc-icon-size, 1.5rem);
  --color: var(--props-color, var(--vc-icon-color, currentColor));

  $self: &;

  @apply flex-none inline-block align-top size-[--size] leading-none fill-[--color] text-[--color];

  &--size {
    &--xxs {
      @apply size-2.5;
    }

    &--xs {
      @apply size-3.5;
    }

    &--sm {
      @apply size-5;
    }

    &--lg {
      @apply size-10;
    }

    &--xl {
      @apply size-12;
    }

    &--xxl {
      @apply size-16;
    }
  }

  @at-root .vc-button {
    $icon: "";

    &--icon {
      $icon: &;
    }

    #{$self} {
      &:first-child:not(:last-child) {
        @apply me-2;
      }

      &:last-child:not(:first-child) {
        @apply ms-2;
      }
    }

    &__slot {
      #{$icon} & {
        & > #{$self} {
          @apply mx-0 #{!important};
        }

        & > *:not(#{$self}) {
          @apply hidden;
        }
      }
    }
  }
}
</style>
