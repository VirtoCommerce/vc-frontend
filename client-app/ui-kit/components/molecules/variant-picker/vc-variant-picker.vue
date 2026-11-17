<template>
  <div
    :class="[
      'vc-variant-picker',
      `vc-variant-picker--size--${size}`,
      {
        'vc-variant-picker--active': checked,
        'vc-variant-picker--unavailable': !checked && !isAvailable,
        'vc-variant-picker--square': type !== 'text',
        'vc-variant-picker--fill': fill,
        'vc-variant-picker--two-lines': hasDescription,
        [`vc-variant-picker--surface--${surface}`]: hasTopBadge,
      },
    ]"
  >
    <label class="vc-variant-picker__container">
      <input
        :checked="checked"
        class="vc-variant-picker__input"
        :type="inputType"
        :aria-label="tooltip ?? inputValue"
        :name="name"
        :value="inputValue"
      />

      <VcTooltip
        class="vc-variant-picker__tooltip"
        :disabled="tooltipDisabled"
        :enable-teleport="tooltipEnableTeleport"
        :teleport-selector="tooltipTeleportSelector"
      >
        <template #default="{ triggerProps, tooltipId }">
          <button
            type="button"
            class="vc-variant-picker__trigger"
            :tabindex="tabindex ?? '0'"
            :aria-label="accessibleName"
            :data-test-id="testId"
            v-bind="tooltipTriggerEvents(triggerProps, tooltipId)"
            @keydown.enter.prevent="toggleValue"
            @keydown.space.prevent="toggleValue"
            @click="toggleValue"
          >
            <span v-if="type === 'color' && !isMultiColor" class="vc-variant-picker__color" />

            <span
              v-else-if="type === 'color' && isMultiColor"
              class="vc-variant-picker__color-grid"
              :data-count="Math.min(colorsList.length, 4)"
            >
              <span
                v-for="(colorValue, index) in colorsList"
                :key="index"
                class="vc-variant-picker__color-item"
                :style="{ backgroundColor: colorValue }"
              />
            </span>

            <VcImage v-else-if="type === 'image'" :src="image" :alt="displayValue" class="vc-variant-picker__img" />

            <span v-else-if="isRichText" class="vc-variant-picker__body">
              <span v-if="icon && iconPosition === 'start'" class="vc-variant-picker__icon">
                <VcIcon :name="icon" :size="iconSize" />
              </span>

              <span class="vc-variant-picker__content">
                <span class="vc-variant-picker__label">{{ labelText }}</span>

                <span v-if="hasDescription" class="vc-variant-picker__description">
                  <slot name="description">{{ description }}</slot>
                </span>
              </span>

              <VcBadge
                v-if="badge && badgePosition === 'end'"
                class="vc-variant-picker__badge"
                :color="badgeColor"
                :variant="badgeVariantValue"
                :size="badgeSize"
                rounded
                nowrap
              >
                {{ badge }}
              </VcBadge>

              <span v-if="icon && iconPosition === 'end'" class="vc-variant-picker__icon">
                <VcIcon :name="icon" :size="iconSize" />
              </span>
            </span>

            <span v-else class="vc-variant-picker__text">
              {{ labelText }}
            </span>

            <span v-if="hasTopBadge" class="vc-variant-picker__badge-top">
              <VcBadge :color="badgeColor" :variant="badgeVariantValue" size="xs" rounded nowrap>
                {{ badge }}
              </VcBadge>
            </span>

            <span class="vc-variant-picker__marker">
              <VcIcon name="apply" size="xxs" />
            </span>
          </button>
        </template>

        <template v-if="!tooltipDisabled" #content>
          <slot name="tooltip">{{ tooltip }}</slot>
        </template>
      </VcTooltip>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { isEqual, omit } from "lodash-es";
import { computed, inject, useSlots, watch } from "vue";
import { getColorValue, serialize } from "@/ui-kit/utilities";

interface IEmits {
  (event: "update:modelValue", value: string | string[]): void;
  (event: "change", value: string | string[]): void;
}

interface IProps {
  type?: VcVariantPickerType;
  modelValue?: string | string[];
  value: string | string[];
  size?: VcVariantPickerSizeType;
  name?: string;
  isAvailable?: boolean;
  tooltip?: string;
  tooltipEnableTeleport?: boolean;
  tooltipTeleportSelector?: string;
  tabindex?: string | number;
  testId?: string;
  /**
   * Text shown in a `text` picker instead of `value`. Top line of a two-line tile.
   */
  label?: string;
  /**
   * Second line of a `text` picker (price, stock, a note). The `description` slot takes any content,
   * e.g. `VcProductPrice` with `single-line`.
   */
  description?: string;
  /**
   * Icon of a `text` picker. In a two-line tile it sits in a circle, centred vertically.
   */
  icon?: string;
  iconPosition?: VcVariantPickerIconPositionType;
  /**
   * Short text of a `VcBadge` on a `text` picker: a discount, "Popular", "New".
   */
  badge?: string;
  badgeColor?: VcBadgeColorType;
  /**
   * `end` places the badge inside the tile on the right, `top` on the top-right corner.
   */
  badgePosition?: VcVariantPickerBadgePositionType;
  /**
   * By default the badge is `soft`; a corner badge over a `tinted` or `dark` group surface is `outline`.
   */
  badgeVariant?: VcBadgeVariantType;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  type: "color",
  size: "md",
  iconPosition: "start",
  badgeColor: "success",
  badgePosition: "end",
});

const SMALL_SIZES: VcVariantPickerSizeType[] = ["xxs", "xs", "sm"];

const slots = useSlots();

const groupContext = inject<VcVariantPickerGroupContextType | null>("variantPickerGroupContext", null);

const modelValue = computed(() => groupContext?.modelValue.value ?? props.modelValue);
const multiple = groupContext?.multiple;
const size = computed(() => groupContext?.size.value ?? props.size);
const type = computed(() => groupContext?.type.value ?? props.type);
const name = computed(() => groupContext?.name.value ?? props.name);
const fill = computed(() => groupContext?.fill.value ?? false);
const surface = computed(() => groupContext?.surface.value ?? "base");

const normalizedValue = computed(() => (Array.isArray(props.value) ? props.value : [props.value]));

const colorsList = computed(() => {
  if (type.value !== "color") {
    return [];
  }

  const allColors = normalizedValue.value.map((v) => getColorValue(v)).filter(Boolean);
  return allColors.slice(0, 4);
});

const isMultiColor = computed(
  () => type.value === "color" && Array.isArray(props.value) && colorsList.value.length > 1,
);

const displayValue = computed(() => normalizedValue.value[0]);
const labelText = computed(() => props.label ?? displayValue.value);

const hasDescription = computed(() => type.value === "text" && (!!props.description || !!slots.description));
const hasTopBadge = computed(() => type.value === "text" && !!props.badge && props.badgePosition === "top");
const isRichText = computed(
  () =>
    type.value === "text" && (hasDescription.value || !!props.icon || (!!props.badge && props.badgePosition === "end")),
);

const isSmall = computed(() => SMALL_SIZES.includes(size.value));
const iconSize = computed<VcIconSizeType>(() => (hasDescription.value || isSmall.value ? "xs" : "sm"));
const badgeSize = computed<VcBadgeSizeType>(() => (isSmall.value ? "xs" : "sm"));
const badgeVariantValue = computed<VcBadgeVariantType>(() => {
  if (props.badgeVariant) {
    return props.badgeVariant;
  }

  return hasTopBadge.value && surface.value !== "base" ? "outline" : "soft";
});

const inputType = computed(() => (multiple?.value ? "checkbox" : "radio"));
const inputValue = computed(() => serialize(props.value));

const checked = computed(() => {
  if (!modelValue.value) {
    return false;
  }

  if (multiple?.value) {
    return Array.isArray(modelValue.value) && modelValue.value.some((v) => isEqual(v, props.value));
  }

  return isEqual(modelValue.value, props.value);
});

const color = computed(() => (type.value === "color" && !isMultiColor.value ? colorsList.value[0] : undefined));

const image = computed(() => (type.value === "image" ? displayValue.value : ""));

const tooltipDisabled = computed(() => !props.tooltip && !slots.tooltip);

const accessibleName = computed(() => {
  if (props.tooltip) {
    return props.tooltip;
  }

  if (isRichText.value) {
    // The visible label, description and badge name the button.
    return undefined;
  }

  if (type.value === "text") {
    return labelText.value;
  }

  return inputValue.value;
});

watch(
  hasTopBadge,
  (isTop, _, onCleanup) => {
    if (isTop && groupContext) {
      onCleanup(groupContext.registerTopBadge());
    }
  },
  { immediate: true },
);

function tooltipTriggerEvents(triggerProps: Record<string, unknown>, tooltipId?: string): Record<string, unknown> {
  const events = omit(triggerProps, ["role", "aria-haspopup", "aria-expanded", "aria-controls"]);

  return {
    ...events,
    "aria-describedby": tooltipDisabled.value ? undefined : tooltipId,
  };
}

function toggleValue(): void {
  const valueToSet = Array.isArray(props.value) ? [...props.value] : props.value;

  if (groupContext) {
    groupContext.toggleValue(valueToSet);
  } else {
    emit("update:modelValue", valueToSet);
    emit("change", valueToSet);
  }
}
</script>

<style lang="scss">
.vc-variant-picker {
  $square: "";
  $active: "";
  $unavailable: "";
  $color: "";
  $colorGrid: "";
  $image: "";
  $text: "";
  $marker: "";
  $body: "";
  $fill: "";
  $twoLines: "";
  $surfaceDark: "";
  $sizeSmall: "";
  $colors: primary, secondary, neutral, info, success, warning, danger, accent;

  --props-color: v-bind(color);
  --color: var(--props-color, var(--vc-variant-picker-bg-color, theme("colors.additional.50")));
  --radius: var(--vc-variant-picker-radius, var(--vc-radius, 0.5rem));
  --radius-inner: var(--radius);
  --strike-line-width: 2px;
  --surface-color: var(--vc-variant-picker-surface-color, theme("colors.additional.50"));

  @apply inline-block;

  &--active {
    $active: &;
  }

  &--square {
    $square: &;
  }

  &--unavailable {
    $unavailable: &;
  }

  &--fill {
    $fill: &;

    @apply flex grow basis-0 min-w-fit;
  }

  &--two-lines {
    $twoLines: &;
  }

  &--surface--dark {
    $surfaceDark: &;
  }

  &--size {
    &--xxs {
      $sizeSmall: if($sizeSmall == "", &, "#{$sizeSmall}, #{&}");

      --size: 1.625rem;
      --line-height: 0.875rem;
      --px: theme("padding[2.5]");
      --transparency: 44%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--xs {
      $sizeSmall: if($sizeSmall == "", &, "#{$sizeSmall}, #{&}");

      --size: 2rem;
      --line-height: 0.875rem;
      --px: theme("padding.3");
      --transparency: 45%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--sm {
      $sizeSmall: if($sizeSmall == "", &, "#{$sizeSmall}, #{&}");

      --size: 2.375rem;
      --line-height: 1rem;
      --px: theme("padding[3.5]");
      --transparency: 46%;

      @apply text-xs/[--line-height] font-black tracking-[1%];
    }

    &--md {
      --size: 2.75rem;
      --line-height: 1.25rem;
      --px: theme("padding.4");
      --transparency: 48%;

      @apply text-sm/[--line-height] font-black tracking-[1%];
    }

    &--lg {
      --size: 3.25rem;
      --line-height: 1.5rem;
      --px: theme("padding.5");
      --transparency: 49%;

      @apply text-base/[--line-height] font-black tracking-[1%];
    }
  }

  &__input {
    @apply hidden;
  }

  &__container,
  &__tooltip {
    #{$fill} & {
      @apply w-full;
    }
  }

  &__color {
    $color: &;

    @apply grow rounded-[--radius-inner] bg-[--color];
  }

  &__color-grid {
    $colorGrid: &;

    @apply grow grid rounded-[--radius-inner] overflow-hidden;

    &[data-count="0"],
    &[data-count="1"] {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }

    &[data-count="2"] {
      grid-template-rows: repeat(2, 1fr);
      grid-template-columns: 1fr;
    }

    &[data-count="3"] {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);

      .vc-variant-picker__color-item:first-child {
        grid-column: 1 / -1;
      }
    }

    &[data-count="4"] {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
    }
  }

  &__color-item {
    @apply min-h-0 min-w-0;
  }

  &__img {
    $image: &;

    --vc-image-object-fit: cover;

    @apply grow rounded-[--radius-inner];
  }

  &__text {
    $text: &;

    @apply flex items-center px-[--px] text-accent-600 text-center font-bold;
  }

  &__body {
    $body: &;

    @apply flex items-center gap-2 w-full px-[--px] py-1.5 text-start;
  }

  &__content {
    @apply flex flex-col grow min-w-0;
  }

  &__label {
    @apply truncate text-accent-600;
  }

  &__description {
    --vc-product-price-font-size: theme("fontSize.sm");

    @apply truncate text-sm/[1.125rem] font-normal tracking-normal text-neutral-800;

    #{$sizeSmall} & {
      --vc-product-price-font-size: theme("fontSize.xs");

      @apply text-xs/4;
    }
  }

  &__icon {
    --vc-icon-color: var(--color-secondary-500);

    @apply flex-none flex;

    #{$active} & {
      --vc-icon-color: var(--color-accent-600);
    }

    #{$twoLines} & {
      --vc-icon-color: var(--color-accent-600);

      @apply items-center justify-center size-8 rounded-full bg-accent-50;
    }

    #{$twoLines}:is(#{$sizeSmall}) & {
      @apply size-7;
    }
  }

  &__badge {
    @apply flex-none;
  }

  // Corner badge: a 2px ring in the colour behind the picker keeps the tile border from running into it.
  &__badge-top {
    @apply absolute top-0 -end-2 z-[1] flex p-0.5 rounded-full bg-[--surface-color] -translate-y-1/2 pointer-events-none;

    @each $color in $colors {
      --vc-badge-outline-#{$color}-bg: var(--surface-color);
    }

    #{$surfaceDark} & {
      @each $color in $colors {
        --vc-badge-outline-#{$color}-text: var(--color-#{$color}-100);
        --vc-badge-outline-#{$color}-border: var(--color-#{$color}-400);
      }
    }

    #{$unavailable} & {
      @apply opacity-50;
    }
  }

  &__marker {
    $marker: &;

    @apply absolute self-center hidden items-center justify-center size-5 border rounded-full bg-additional-50 text-accent-500;
  }

  &__trigger {
    @apply relative flex items-stretch justify-center
    min-h-[--size] min-w-[--size]
    bg-cover bg-center bg-no-repeat bg-additional-50
    rounded-[--radius] cursor-pointer;

    box-shadow: 0 0 0 1px var(--color-neutral-200);

    &:hover {
      box-shadow: 0 0 0 2px var(--color-neutral-200);
    }

    #{$square} & {
      @apply size-[--size];
    }

    #{$fill} & {
      @apply w-full;
    }

    #{$active} & {
      &:has(#{$text}, #{$body}) {
        box-shadow: 0 0 0 2px var(--color-accent-500);
      }

      &:has(#{$color}, #{$colorGrid}, #{$image}) {
        & #{$marker} {
          @apply flex;
        }
      }
    }

    #{$unavailable} & {
      &::before {
        @apply content-[""] absolute inset-0 rounded-[--radius-inner] bg-additional-50/40;
      }

      &::after {
        @apply content-[""] absolute inset-0 rounded-[--radius-inner] opacity-40;

        background: linear-gradient(
          -45deg,
          transparent var(--transparency),
          transparent var(--transparency) calc(50% - var(--strike-line-width) / 2),
          var(--color-secondary-950) calc(50% - var(--strike-line-width) / 2),
          var(--color-secondary-950) calc(50% + var(--strike-line-width) / 2),
          transparent calc(50% + var(--strike-line-width) / 2)
        );
      }
    }
  }
}
</style>
