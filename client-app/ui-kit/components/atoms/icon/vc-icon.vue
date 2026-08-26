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

let latestLoadToken = 0;

async function loadIcon(name?: string, variant?: IconVariantType) {
  const token = ++latestLoadToken;
  const { raw, isOutline: outline } = await loadIconRaw(name, variant);

  if (token !== latestLoadToken) {
    return;
  }

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

  @apply flex-none inline-block align-top size-[--size] leading-none text-[--color] fill-current;

  svg {
    @apply size-full;
  }

  &--outline {
    @apply fill-none;

    container-type: inline-size;

    // Outline icons all share a 24-unit viewBox, so the screen-px stroke values below are
    // converted to user units by hand — vector-effect: non-scaling-stroke, which did this,
    // is drawn at half width by Chrome 151.
    $view-box: 24;

    svg :where(path, line, circle, rect, polyline, polygon, ellipse) {
      stroke: currentColor;
      stroke-width: calc(
        var(--vc-icon-stroke, var(--stroke-bucket, 1.5)) * #{$view-box} / var(--size-anchor, #{$view-box})
      );
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    // fixed stroke grid keyed to real rendered px
    @container (width <= 10px) {
      svg {
        --stroke-bucket: 1;
        --size-anchor: 10;
      }
    }

    @container (10px < width <= 12px) {
      svg {
        --stroke-bucket: 1.1;
        --size-anchor: 12;
      }
    }

    @container (12px < width <= 14px) {
      svg {
        --stroke-bucket: 1.3;
        --size-anchor: 14;
      }
    }

    @container (14px < width <= 16px) {
      svg {
        --stroke-bucket: 1.5;
        --size-anchor: 16;
      }
    }

    @container (16px < width <= 20px) {
      svg {
        --stroke-bucket: 1.6;
        --size-anchor: 20;
      }
    }

    @container (20px < width <= 24px) {
      svg {
        --stroke-bucket: 1.75;
        --size-anchor: 24;
      }
    }

    @container (24px < width <= 28px) {
      svg {
        --stroke-bucket: 1.8;
        --size-anchor: 28;
      }
    }

    @container (28px < width <= 36px) {
      svg {
        --stroke-bucket: 2;
        --size-anchor: 32;
      }
    }

    @container (36px < width <= 44px) {
      svg {
        --stroke-bucket: 2.7;
        --size-anchor: 40;
      }
    }

    @container (44px < width <= 56px) {
      svg {
        --stroke-bucket: 2.7;
        --size-anchor: 48;
      }
    }

    @container (56px < width <= 72px) {
      svg {
        --stroke-bucket: 2.7;
        --size-anchor: 64;
      }
    }

    @container (72px < width <= 96px) {
      svg {
        --stroke-bucket: 2.7;
        --size-anchor: 86;
      }
    }

    // Past the ladder the stroke grows with the icon instead of staying pinned: no size this
    // large occurs here, and a hairline on a huge glyph reads anemic.
    @container (width > 96px) {
      svg {
        --stroke-bucket: 2.7;
        --size-anchor: 96;
      }
    }

    // Sparse arrow-family / line glyphs read too thin on the base grid — give them a heavier
    // stroke for weight parity. Enumerated exact classes so only simple variants match (not the
    // bordered / big / sort arrow variants that share the arrow-/chevron- prefix).
    $arrow-family:
      "chevron-up", "chevron-down", "chevron-left", "chevron-right", "chevron-first", "chevron-last", "chevrons-up",
      "chevrons-down", "chevrons-left", "chevrons-right", "chevrons-up-down", "chevrons-left-right", "arrow-up",
      "arrow-down", "arrow-left", "arrow-right", "arrow-up-left", "arrow-up-right", "arrow-down-left",
      "arrow-down-right", "arrow-up-down", "arrow-left-right", "arrow-up-to-line", "arrow-down-to-line",
      "arrow-left-to-line", "arrow-right-to-line", "arrow-up-from-line", "arrow-down-from-line", "arrow-up-from-dot",
      "arrow-down-to-dot", "corner-up-left", "corner-up-right", "corner-down-left", "corner-down-right",
      "corner-left-up", "corner-left-down", "corner-right-up", "corner-right-down", "move", "move-horizontal",
      "move-vertical", "move-diagonal", "check", "check-check", "x", "plus", "minus", "equal", "divide", "menu",
      "align-justify", "align-left", "align-right", "align-center", "text-align-justify", "text-align-start",
      "text-align-center", "text-align-end", "list";
    $arrow-family-selector: "";

    @each $glyph in $arrow-family {
      @if $arrow-family-selector == "" {
        $arrow-family-selector: "svg.lucide-#{$glyph}";
      } @else {
        $arrow-family-selector: $arrow-family-selector + ", svg.lucide-#{$glyph}";
      }
    }

    #{$arrow-family-selector} {
      @container (width <= 10px) {
        --stroke-bucket: 1.8;
      }

      @container (10px < width <= 12px) {
        --stroke-bucket: 2;
      }

      @container (12px < width <= 14px) {
        --stroke-bucket: 2.1;
      }

      @container (14px < width <= 16px) {
        --stroke-bucket: 2.2;
      }

      @container (16px < width <= 20px) {
        --stroke-bucket: 2.6;
      }

      @container (width > 20px) {
        --stroke-bucket: 3;
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
