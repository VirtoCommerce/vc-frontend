<template>
  <span
    :class="['vc-icon', sizeClass, { 'vc-icon--outline': isOutline }]"
    :style="style"
    :aria-hidden="ariaHidden"
    :role="role"
    :aria-label="label || undefined"
    v-html="icon"
  ></span>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { getColorValue, loadIconRaw, resolveIcon } from "@/ui-kit/utilities";
import type { IconVariantType } from "@/ui-kit/utilities";

interface IProps {
  name?: string;
  size?: VcIconSizeType;
  color?: string;
  variant?: IconVariantType;
  label?: string;
  strokeWidth?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: "document-text",
  color: "",
});

const icon = ref("");
const isOutline = ref(false);

const PRESET_SIZES = new Set(["xxs", "xs", "sm", "md", "lg", "xl", "xxl"]);

const isPreset = computed(() => typeof props.size === "string" && PRESET_SIZES.has(props.size));

const sizeClass = computed(() => (isPreset.value ? `vc-icon--size--${props.size as string}` : ""));

const style = computed(() => {
  const result: Record<string, string> = {};

  if (props.size !== undefined && props.size !== "" && !isPreset.value) {
    const value = typeof props.size === "number" ? `${props.size}px` : props.size;
    result.width = value;
    result.height = value;
  }

  if (props.strokeWidth !== undefined) {
    result["--vc-icon-stroke"] = String(props.strokeWidth);
  }

  return result;
});

const _color = computed(() => getColorValue(props.color));

const ariaHidden = computed(() => (props.label ? undefined : "true"));
const role = computed(() => (props.label ? "img" : undefined));

async function loadIcon(name?: string, variant?: IconVariantType) {
  const { raw, isOutline: outline } = await loadIconRaw(name, variant);
  icon.value = raw;
  isOutline.value = outline;
}

watch(
  () => [props.name, props.variant] as const,
  ([newName, newVariant]) => {
    // sync so --outline class applies before async SVG load resolves, avoiding first-paint flash
    isOutline.value = resolveIcon(newName, newVariant).isOutline;
    void loadIcon(newName, newVariant);
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

  svg {
    @apply size-full;
  }

  &--outline {
    @apply fill-none;

    container-type: inline-size;

    svg :where(path, line, circle, rect, polyline, polygon, ellipse) {
      fill: none;
      stroke: var(--color);
      stroke-width: var(--vc-icon-stroke, var(--stroke-bucket, 1.5));
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    // fixed stroke grid keyed to real rendered px
    @container (width <= 10px) {
      svg {
        --stroke-bucket: 1;
      }
    }

    @container (10px < width <= 12px) {
      svg {
        --stroke-bucket: 1.1;
      }
    }

    @container (12px < width <= 14px) {
      svg {
        --stroke-bucket: 1.3;
      }
    }

    @container (14px < width <= 16px) {
      svg {
        --stroke-bucket: 1.5;
      }
    }

    @container (16px < width <= 20px) {
      svg {
        --stroke-bucket: 1.6;
      }
    }

    @container (20px < width <= 24px) {
      svg {
        --stroke-bucket: 1.75;
      }
    }

    @container (24px < width <= 28px) {
      svg {
        --stroke-bucket: 1.8;
      }
    }

    @container (28px < width <= 36px) {
      svg {
        --stroke-bucket: 2;
      }
    }

    @container (width > 36px) {
      svg {
        --stroke-bucket: 2.7;
      }
    }
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

    // md: no rule — themeable default via --vc-icon-size

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
