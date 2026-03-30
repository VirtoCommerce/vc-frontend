<template>
  <nav class="vc-tabs">
    <button
      v-for="(item, index) in items"
      :key="index"
      :disabled="isDisabled"
      :class="['vc-tabs__button', isActiveItem(item) ? 'vc-tabs__button--active' : 'vc-tabs__button--inactive']"
      type="button"
      @click="select(item)"
    >
      <span :class="['vc-tabs__label', isActiveItem(item) ? 'vc-tabs__label--active' : 'vc-tabs__label--inactive']">
        <slot name="item" v-bind="{ item, index, isActive: isActiveItem(item) }">
          {{ textField && isItemObject(item) ? item[textField] : item }}
        </slot>
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts" generic="T extends ItemType | string | number, U extends string | number">
export type ItemType = {
  [key: string | number]: unknown;
};

type EmitType = T extends ItemType ? T[U] : T;

const emit = defineEmits<{
  (event: "update:modelValue", value: EmitType): void;
  (event: "change", value: EmitType): void;
}>();

const props = withDefaults(
  defineProps<{
    isDisabled?: boolean;
    modelValue: T extends ItemType ? T[U] : T;
    items?: readonly T[];
    /**
     * The property of the object that will be displayed in the "selected" and "item" slots.
     * (Optional) Only for objects array of modelValue.
     */
    textField?: string;

    /**
     * An object property passed as a new value for the "modelValue" or "change" events
     * (Optional) Only for objects array of modelValue.
     */
    valueField?: U;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    isDisabled: false,
    items: () => [],
    size: "md",
  },
);

function isActiveItem(item: T): boolean {
  const itemValue = props.valueField && isItemObject(item) ? item[props.valueField] : item;
  return itemValue === props.modelValue;
}

function select(item: T) {
  if (props.isDisabled) {
    return;
  }

  const newValue = (props.valueField && isItemObject(item) ? item[props.valueField] : item) as EmitType | undefined;

  if (newValue && newValue !== props.modelValue) {
    emit("update:modelValue", newValue);
    emit("change", newValue);
  }
}

function isItemObject(item: unknown): item is ItemType {
  return typeof item === "object" && item !== null;
}

console.warn("[UIKit][warn] VcTabs is deprecated, use VcTabSwitch instead.");
</script>

<style lang="scss">
.vc-tabs {
  @apply flex gap-1;

  &__button {
    @apply appearance-none disabled:opacity-40;

    &--active {
      @apply cursor-default;
    }

    &--inactive {
      @apply text-[--link-color] hover:text-[--link-hover-color];
    }
  }

  &__label {
    @apply block appearance-none px-1.5 py-2;

    &--active {
      @apply rounded bg-additional-50 shadow-md text-neutral-900;
    }

    &--inactive {
      @apply text-primary-700;
    }
  }
}
</style>
