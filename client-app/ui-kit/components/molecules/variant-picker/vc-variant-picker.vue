<template>
  <div
    :class="[
      'vc-variant-picker',
      `vc-variant-picker--size--${size}`,
      {
        'vc-variant-picker--active': checked,
        'vc-variant-picker--unavailable': !checked && !isAvailable,
        'vc-variant-picker--square': type === 'color' || type === 'image',
        'vc-variant-picker--card': isCard,
        [`vc-variant-picker--width--${width}`]: width !== 'content',
        'vc-variant-picker--with-corner': !!$slots.corner,
        'vc-variant-picker--corner-room': !!$slots.corner && !groupContext,
      },
    ]"
  >
    <component :is="isCard ? 'div' : 'label'" class="vc-variant-picker__container">
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
          <!-- A card is a div: a <button> may hold phrasing content only, and a card's slots may hold blocks. -->
          <component
            :is="isCard ? 'div' : 'button'"
            ref="trigger"
            :type="isCard ? undefined : 'button'"
            class="vc-variant-picker__trigger"
            :role="inputType"
            :aria-checked="String(checked)"
            :tabindex="triggerTabindex"
            :aria-label="accessibleName"
            :aria-labelledby="isCard ? labelId : undefined"
            :data-test-id="testId"
            v-bind="tooltipTriggerEvents(triggerProps, tooltipId)"
            @keydown.enter.prevent="toggleValue"
            @keydown.space.prevent="toggleValue"
            @keydown="groupContext?.onKeydown?.($event)"
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

            <div v-else-if="isCard" class="vc-variant-picker__content">
              <div v-if="$slots.prepend" class="vc-variant-picker__prepend">
                <slot name="prepend" :checked="checked" />
              </div>

              <div class="vc-variant-picker__body">
                <div :id="labelId" class="vc-variant-picker__label">
                  <slot :checked="checked">{{ displayValue }}</slot>
                </div>

                <div v-if="$slots.description" :id="descriptionId" class="vc-variant-picker__description">
                  <slot name="description" :checked="checked" />
                </div>
              </div>

              <div v-if="$slots.append" :id="appendId" class="vc-variant-picker__append">
                <slot name="append" :checked="checked" />
              </div>
            </div>

            <span v-else class="vc-variant-picker__text">
              {{ displayValue }}
            </span>

            <span v-if="$slots.corner" :id="cornerId" class="vc-variant-picker__corner">
              <slot name="corner" :checked="checked" />
            </span>

            <span class="vc-variant-picker__marker">
              <VcIcon name="apply" size="xxs" />
            </span>
          </component>
        </template>

        <template v-if="!tooltipDisabled" #content>
          <slot name="tooltip" :checked="checked">{{ tooltip }}</slot>
        </template>
      </VcTooltip>
    </component>
  </div>
</template>

<script lang="ts" setup>
import { isEqual, omit } from "lodash-es";
import { computed, inject, onUpdated, provide, ref, useTemplateRef } from "vue";
import { INTERACTIVE_PARENT_KEY } from "@/ui-kit/components/molecules/menu-item/vc-menu-item-context";
import { useComponentId } from "@/ui-kit/composables";
import { getColorValue, serialize } from "@/ui-kit/utilities";
import { Logger } from "@/ui-kit/utilities/logger";

interface IEmits {
  (event: "update:modelValue", value: string | string[]): void;
  (event: "change", value: string | string[]): void;
}

interface IProps {
  /**
   * `card` is a selectable frame around slot content (`default`, `prepend`, `description`, `append`); the other
   * types show `value` as a colour, an image or text.
   */
  type?: VcVariantPickerType;
  modelValue?: string | string[];
  value: string | string[];
  size?: VcVariantPickerSizeType;
  name?: string;
  /**
   * Unset is `false`: pass `is-available` to show a picker as available. While it is not checked, an unavailable
   * picker shows the unavailable look (colour, image and text pickers are struck through, a card draws its frame
   * dashed); a checked picker never does. It stays selectable: the picker has no disabled state.
   */
  isAvailable?: boolean;
  /** Names a colour, image or text picker; describes a card, which its `default` slot names. */
  tooltip?: string;
  tooltipEnableTeleport?: boolean;
  tooltipTeleportSelector?: string;
  /**
   * The trigger's tabindex on its own and in a `multiple` VcVariantPickerGroup (unset: `0`). A single-choice group
   * sets it itself, whatever this prop says: the group is one Tab stop, and the arrow keys move it between the pickers.
   */
  tabindex?: string | number;
  testId?: string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  type: "color",
  size: "md",
});

const slots = defineSlots<{
  /**
   * `type="card"`: the card's content; it names the card. Falls back to the first `value`. Used alone, it fills the
   * card and the card imposes no layout on it; it inherits the font size and weight `size` sets (bold at xxs and xs,
   * black above) and the accent colour. No interactive content (buttons, links, inputs) inside a card.
   */
  default?: (props: { checked: boolean }) => unknown;
  /**
   * `type="card"`: content before the default slot, e.g. a `VcIcon` without `size`: its wrapper sets
   * `--vc-icon-size` by the picker size and `--vc-icon-color` by the checked state. Decorative: it is not announced.
   * A `VcRadioButton` or `VcCheckbox` in this or any other slot of the picker renders as an inert indicator.
   */
  prepend?: (props: { checked: boolean }) => unknown;
  /**
   * `type="card"`: a second line under the default slot, e.g. a `VcProductPrice`; its text size follows the picker
   * size, a `VcProductPrice`'s too. It describes the card.
   */
  description?: (props: { checked: boolean }) => unknown;
  /** `type="card"`: content at the card's end, e.g. a `VcBadge`. It describes the card. */
  append?: (props: { checked: boolean }) => unknown;
  /**
   * Any type: content over the top-end corner, e.g. a `VcBadge` with `size="xs"`. It rises above the picker and
   * past its end; VcVariantPickerGroup keeps that room free for its direct-child pickers, and so does a picker on
   * its own. On colour, image and text pickers it sits inside a `<button>`: phrasing, non-interactive content only.
   * It describes the picker.
   */
  corner?: (props: { checked: boolean }) => unknown;
  /** Tooltip content in place of the `tooltip` prop's text. */
  tooltip?: (props: { checked: boolean }) => unknown;
}>();

const CARD_SLOTS = ["default", "prepend", "description", "append"] as const;

const groupContext = inject<VcVariantPickerGroupContextType | null>("variantPickerGroupContext", null);

provide(INTERACTIVE_PARENT_KEY, ref(true));

const modelValue = computed(() => groupContext?.modelValue.value ?? props.modelValue);
const multiple = groupContext?.multiple;
const size = computed(() => groupContext?.size.value ?? props.size);
const type = computed(() => groupContext?.type.value ?? props.type);
const name = computed(() => groupContext?.name.value ?? props.name);

const isCard = computed(() => type.value === "card");
const width = computed(() =>
  type.value === "text" || isCard.value ? (groupContext?.width?.value ?? "content") : "content",
);

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

const trigger = useTemplateRef<HTMLElement>("trigger");

const triggerTabindex = computed(() => {
  if (groupContext?.tabStop && !multiple?.value) {
    return groupContext.tabStop.value === trigger.value ? 0 : -1;
  }

  return props.tabindex ?? 0;
});

const componentId = useComponentId("vc-variant-picker");
const labelId = `${componentId}-label`;
const descriptionId = `${componentId}-description`;
const appendId = `${componentId}-append`;
const cornerId = `${componentId}-corner`;

const accessibleName = computed(() => {
  if (isCard.value) {
    return undefined;
  }

  if (props.tooltip) {
    return props.tooltip;
  }

  if (type.value === "text") {
    return displayValue.value;
  }

  return inputValue.value;
});

if (import.meta.env.DEV) {
  let isWarned = false;

  // Not a watcher: slots are not reactive.
  function warnOnCardSlots(): void {
    const isMisused = !isCard.value && CARD_SLOTS.some((slotName) => !!slots[slotName]);

    if (isMisused && !isWarned) {
      Logger.warn(
        `VcVariantPicker: the default, prepend, description and append slots render only when type is "card"; this picker is type "${type.value}".`,
      );
    }

    isWarned = isMisused;
  }

  warnOnCardSlots();
  onUpdated(warnOnCardSlots);
}

// Called while rendering, so a description, append or corner slot added or removed after mount is followed; a tooltip
// slot is not: `tooltipDisabled` is computed, and slots are not reactive.
function describedBy(tooltipId?: string): string | undefined {
  const ids = [
    isCard.value && slots.description ? descriptionId : undefined,
    isCard.value && slots.append ? appendId : undefined,
    slots.corner ? cornerId : undefined,
    tooltipDisabled.value ? undefined : tooltipId,
  ].filter(Boolean);

  return ids.length ? ids.join(" ") : undefined;
}

function tooltipTriggerEvents(triggerProps: Record<string, unknown>, tooltipId?: string): Record<string, unknown> {
  const events = omit(triggerProps, ["role", "aria-haspopup", "aria-expanded", "aria-controls"]);

  return {
    ...events,
    "aria-describedby": describedBy(tooltipId),
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
@use "@/ui-kit/styles/variant-picker-corner" as *;

.vc-variant-picker {
  $square: "";
  $active: "";
  $card: "";
  $struck: "";
  $dashed: "";
  $stretch: "";
  $share: "";
  $color: "";
  $colorGrid: "";
  $image: "";
  $text: "";
  $content: "";
  $marker: "";

  --props-color: v-bind(color);
  --bg-color: var(--vc-variant-picker-bg-color, theme("colors.additional.50"));
  --color: var(--props-color, var(--bg-color));
  --radius: var(--vc-variant-picker-radius, var(--vc-radius, 0.5rem));
  --radius-inner: var(--radius);
  --strike-line-width: 2px;

  @apply inline-block;

  &--active {
    $active: &;
  }

  &--square {
    $square: &;
  }

  &--card {
    $card: &;
  }

  &--unavailable:not(#{$card}) {
    $struck: &;
  }

  &--unavailable#{$card} {
    $dashed: &;
  }

  &--width--stretch {
    $stretch: &;
  }

  &--width--share {
    $share: &;

    @apply flex grow basis-0 min-w-fit;
  }

  // `--with-corner` has no rule here: VcVariantPickerGroup reads it to keep the room for its direct-child pickers'
  // corners.
  &--corner-room {
    padding-top: $corner-rise;
    padding-inline-end: $corner-overhang;
  }

  &--size {
    &--xxs {
      --size: 1.625rem;
      --line-height: 0.875rem;
      --px: theme("padding[2.5]");
      --transparency: 44%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--xs {
      --size: 2rem;
      --line-height: 0.875rem;
      --px: theme("padding.3");
      --transparency: 45%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--sm {
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
      --card-gap: theme("spacing[2.5]");
      --transparency: 48%;

      @apply text-sm/[--line-height] font-black tracking-[1%];
    }

    &--lg {
      --size: 3.25rem;
      --line-height: 1.5rem;
      --px: theme("padding.5");
      --card-px: theme("padding[4.5]");
      --card-gap: theme("spacing.3");
      --transparency: 49%;

      @apply text-base/[--line-height] font-black tracking-[1%];
    }

    &--xxs,
    &--xs,
    &--sm {
      --description-font-size: theme("fontSize.xs");
      --description-line-height: 1rem;
      --prepend-icon-size: 0.875rem;
    }

    &--md,
    &--lg {
      --description-font-size: theme("fontSize.sm");
      --description-line-height: 1.125rem;
      --prepend-icon-size: 1.25rem;
    }
  }

  &__input {
    @apply hidden;
  }

  // In a width mode the picker fills its grid cell or flex line, so every card in a row takes the row's height.
  &__container {
    #{$stretch} &,
    #{$share} & {
      @apply block size-full;
    }
  }

  &__tooltip {
    #{$stretch} &,
    #{$share} & {
      @apply h-full;
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

    // The value is a bare text node, which takes an ellipsis only from a block box; self-center keeps it mid-tile.
    #{$stretch} & {
      @apply block self-center min-w-0 truncate;
    }
  }

  // overflow-hidden: content that cannot shrink (prepend, append, a wide image) is cut at the card's edge; the corner
  // sits outside it.
  &__content {
    $content: &;

    --card-padding: var(--vc-variant-picker-card-padding, theme("padding[1.5]") var(--card-px, var(--px)));

    @apply flex grow items-stretch min-w-0 p-[--card-padding] rounded-[--radius-inner] overflow-hidden text-start;

    gap: var(--card-gap, theme("spacing.2"));
  }

  &__prepend {
    --vc-icon-size: var(--prepend-icon-size);
    --vc-icon-color: var(--color-secondary-500);

    @apply flex flex-none items-center;

    #{$active} & {
      --vc-icon-color: var(--color-accent-600);
    }
  }

  // The body shrinks to the room prepend and append leave, and its text wraps there: a word wider than that room breaks
  // onto the next line instead of running under the append content.
  &__body {
    @apply flex grow flex-col justify-center min-w-0 break-words;
  }

  &__label {
    @apply text-accent-600;
  }

  // VcProductPrice's own size tokens, so a price in the description follows the picker size.
  &__description {
    --vc-product-price-font-size: var(--description-font-size);
    --vc-product-price-line-height: var(--description-line-height);

    @apply text-[length:var(--description-font-size)] leading-[--description-line-height] font-normal tracking-normal text-neutral-800;
  }

  &__append {
    @apply flex flex-none items-center;
  }

  &__corner {
    @apply absolute z-[1] flex;

    top: -$corner-rise;
    inset-inline-end: -$corner-overhang;
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

    #{$card} & {
      @apply bg-[--bg-color];
    }

    // A box-shadow cannot be dashed: the frame is the outline of a ::before over the box, drawn where the box-shadow
    // frame is (just outside the box, its radius grown by its width). Like a box-shadow, an outline takes no room and
    // adds no scrollable overflow, so the card keeps its size. neutral-500 keeps 3:1 against every preset's surfaces.
    #{$dashed} & {
      --dash-width: 1px;

      @apply shadow-none;

      &:hover {
        --dash-width: 2px;
      }

      &::before {
        @apply content-[""] absolute inset-0 rounded-[--radius] pointer-events-none
        outline-dashed outline-[length:var(--dash-width)] outline-neutral-500;
      }
    }

    #{$stretch} &,
    #{$share} & {
      @apply size-full;
    }

    #{$active} & {
      &:has(#{$text}, #{$content}) {
        box-shadow: 0 0 0 2px var(--color-accent-500);
      }

      &:has(#{$color}, #{$colorGrid}, #{$image}) {
        & #{$marker} {
          @apply flex;
        }
      }
    }

    #{$struck} & {
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
