<template>
  <HugeiconsIcon
    v-if="hugeIcon"
    :class="['vc-icon', sizeClass]"
    :style="style"
    :icon="icon"
    :color="_color"
    :stroke-width="strokeWidth"
  />

  <span v-else :class="['vc-icon', 'vc-icon--common', sizeClass]" :style="style" v-html="icon"></span>
</template>

<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { ref, computed, watch } from "vue";
import { DEFAULT_ICON_STROKE_WIDTH } from "@/ui-kit/constants";
import { getColorValue, loadHugeiconsIcon, loadIconRaw } from "@/ui-kit/utilities";

// TODO: change size calculation for HugeiconsIcon & component styles after a complete transition to HugeiconsIcon.
interface IProps {
  name?: string;
  size?: VcIconSizeType;
  color?: string;
  hugeIcon?: boolean;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "document-text",
  color: "",
  strokeWidth: DEFAULT_ICON_STROKE_WIDTH,
  hugeIcon: false,
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
  if (props.hugeIcon) {
    icon.value = await loadHugeiconsIcon(name);
  } else {
    icon.value = await loadIconRaw(name);
  }
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

  @apply size-[--size];

  &--common {
    @apply flex-none inline-block align-top  leading-none fill-[--color] text-[--color];
  }

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
