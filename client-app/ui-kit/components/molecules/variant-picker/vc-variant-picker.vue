<template>
  <div
    :class="[
      'vc-variant-picker',
      `vc-variant-picker--size--${size}`,
      {
        'vc-variant-picker--active': checked,
        'vc-variant-picker--unavailable': !checked && !isAvailable,
        'vc-variant-picker--square': type !== 'text',
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
        :data-test-id="testId"
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

            <span v-else class="vc-variant-picker__text">
              {{ displayValue }}
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
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import { computed, inject, useSlots } from "vue";
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
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  type: "color",
  size: "md",
});

const slots = useSlots();

const groupContext = inject<VcVariantPickerGroupContextType | null>("variantPickerGroupContext", null);

const modelValue = computed(() => groupContext?.modelValue.value ?? props.modelValue);
const multiple = groupContext?.multiple;
const size = computed(() => groupContext?.size.value ?? props.size);
const type = computed(() => groupContext?.type.value ?? props.type);
const name = computed(() => groupContext?.name.value ?? props.name);

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

const accessibleName = computed(() => {
  if (props.tooltip) {
    return props.tooltip;
  }

  if (type.value === "text") {
    return displayValue.value;
  }

  return inputValue.value;
});

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

  --props-color: v-bind(color);
  --color: var(--props-color, var(--vc-variant-picker-bg-color, theme("colors.additional.50")));
  --radius: var(--vc-variant-picker-radius, var(--vc-radius, 0.5rem));
  --strike-line-width: 2px;

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

  &--size {
    &--xxs {
      --size: 1.5rem;
      --line-height: 0.875rem;
      --px: theme("padding[2.5]");
      --transparency: 44%;

      @apply text-xs/[--line-height] font-bold;
    }

    &--xs {
      --size: 1.875rem;
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
      --size: 3rem;
      --line-height: 1.25rem;
      --px: theme("padding.4");
      --transparency: 48%;

      @apply text-sm/[--line-height] font-black tracking-[1%];
    }

    &--lg {
      --size: 3.5rem;
      --line-height: 1.5rem;
      --px: theme("padding.5");
      --transparency: 49%;

      @apply text-base/[--line-height] font-black tracking-[1%];
    }
  }

  &__input {
    @apply hidden;
  }

  &__trigger {
    @apply relative flex items-stretch justify-center py-0.5
    min-h-[--size] min-w-[--size]
    bg-cover bg-center bg-no-repeat bg-additional-50
    rounded-[--radius] cursor-pointer px-[--px];

    box-shadow: 0 0 0 1px var(--color-neutral-200);

    #{$square} & {
      @apply size-[--size] px-0.5;
    }

    &:hover {
      box-shadow: 0 0 0 1px var(--color-neutral-400);
    }

    &:focus-within {
      box-shadow: 0 0 0 2px rgb(from var(--color-primary-500) r g b / 0.5);
    }

    #{$active} & {
      box-shadow: 0 0 0 2px var(--color-primary-500);
    }

    #{$unavailable} & {
      &::before {
        @apply content-[""] absolute inset-px rounded-[inherit] bg-additional-50/60;
      }

      &::after {
        @apply content-[""] absolute inset-0 rounded-[inherit] opacity-40;

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

  &__color {
    @apply grow rounded-[calc(var(--radius)-2px)] bg-[--color];
  }

  &__color-grid {
    @apply grow grid rounded-[calc(var(--radius)-2px)] overflow-hidden;

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
    @apply grow rounded-[calc(var(--radius)-2px)] object-cover object-center;
  }

  &__text {
    @apply flex items-center text-accent-600 text-center font-bold;
  }
}
</style>
