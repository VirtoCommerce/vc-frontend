<template>
  <router-link
    v-if="isLink"
    v-bind="$attrs"
    :to="isEnabled ? to : ''"
    tag="button"
    class="rounded flex justify-center items-center font-roboto-condensed cursor-pointer whitespace-nowrap"
    :class="buttonClass"
    :disabled="!isEnabled"
  >
    <slot></slot>
  </router-link>
  <button
    v-else
    v-bind="$attrs"
    :type="isSubmit ? 'submit' : 'button'"
    class="rounded flex justify-center items-center font-roboto-condensed cursor-pointer"
    :class="buttonClass"
    :disabled="!isEnabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  kind: {
    type: String,
    default: "primary",
    validator(value: string) {
      return ["primary", "secondary"].includes(value);
    },
  },
  size: {
    type: String,
    default: "md",
    validator(value: string) {
      return ["sm", "md", "lg"].includes(value);
    },
  },
  isSubmit: {
    type: Boolean,
    default: false,
  },
  outline: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  waiting: {
    type: Boolean,
    default: false,
  },
  to: {
    type: String,
    default: null,
  },
});

defineEmits(["click"]);

const isEnabled = computed(() => !props.disabled && !props.waiting);

const isLink = computed(() => !!props.to);

const primaryEnabledClasses = "bg-yellow-500 text-white hover:bg-yellow-600";
const primaryDisabledClasses = "bg-yellow-500 text-white";
const primaryOutlineEnabledClasses =
  "border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-600 hover:text-white hover:border-yellow-600";
const primaryOutlineDisabledClasses = "border-2 border-yellow-500 text-yellow-500";
const secondaryEnabledClasses = "bg-black text-white hover:bg-yellow-600";
const secondaryDisabledClasses = "bg-black text-white";
const secondaryOutlineEnabledClasses = "border-2 g-white border-black hover:bg-black hover:text-white";
const secondaryOutlineDisabledClasses = "border-2 bg-white border-black";
const waitingStateClasses = "cursor-wait opacity-30";
const disabledStateClasses = "cursor-not-allowed opacity-30";
const smSizeClasses = "h-8 text-sm";
const mdSizeClasses = "h-9 text-base";
const lgSizeClasses = "h-11 text-lg";

const buttonClass = computed(() => {
  return {
    [primaryEnabledClasses]: props.kind == "primary" && !props.outline && isEnabled.value,
    [primaryOutlineEnabledClasses]: props.kind == "primary" && props.outline && isEnabled.value,
    [secondaryEnabledClasses]: props.kind == "secondary" && !props.outline && isEnabled.value,
    [secondaryOutlineEnabledClasses]: props.kind == "secondary" && props.outline && isEnabled.value,
    [primaryDisabledClasses]: props.kind == "primary" && !props.outline && !isEnabled.value,
    [primaryOutlineDisabledClasses]: props.kind == "primary" && props.outline && !isEnabled.value,
    [secondaryDisabledClasses]: props.kind == "secondary" && !props.outline && !isEnabled.value,
    [secondaryOutlineDisabledClasses]: props.kind == "secondary" && props.outline && !isEnabled.value,
    [waitingStateClasses]: props.waiting,
    [disabledStateClasses]: props.disabled,
    [smSizeClasses]: props.size == "sm",
    [mdSizeClasses]: props.size == "md",
    [lgSizeClasses]: props.size == "lg",
  };
});
</script>
