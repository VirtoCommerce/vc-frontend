<template>
  <router-link
    v-if="isLink"
    :to="isEnabled ? to : ''"
    class="rounded inline-flex justify-center items-center font-roboto-condensed cursor-pointer whitespace-nowrap"
    :class="buttonClass"
    :disabled="!isEnabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </router-link>

  <button
    v-else
    :type="isSubmit ? 'submit' : 'button'"
    class="rounded inline-flex justify-center items-center font-roboto-condensed cursor-pointer"
    :class="buttonClass"
    :is-disabled="!isEnabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { RouteLocationRaw } from "vue-router";

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
  isOutline: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isWaiting: {
    type: Boolean,
    default: false,
  },
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: null,
  },
});

defineEmits(["click"]);

const isEnabled = computed(() => !props.isDisabled && !props.isWaiting);

const isLink = computed(() => !!props.to);

const primaryEnabledClasses = "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]";
const primaryDisabledClasses = "bg-[color:var(--color-primary)] text-white";
const primaryOutlineEnabledClasses =
  "border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)] hover:text-white hover:border-[color:var(--color-primary-hover)]";
const primaryOutlineDisabledClasses = "border-2 border-[color:var(--color-primary)] text-[color:var(--color-primary)]";
const secondaryEnabledClasses = "bg-black text-white hover:bg-[color:var(--color-primary-hover)]";
const secondaryDisabledClasses = "bg-black text-white";
const secondaryOutlineEnabledClasses = "border-2 bg-white border-black hover:bg-black hover:text-white";
const secondaryOutlineDisabledClasses = "border-2 bg-white border-black";
const waitingStateClasses = "cursor-wait opacity-40";
const disabledStateClasses = "cursor-not-allowed opacity-40";
const smSizeClasses = "h-8 text-sm";
const mdSizeClasses = "h-9 text-base";
const lgSizeClasses = "h-11 text-lg";

const buttonClass = computed(() => {
  return {
    [primaryEnabledClasses]: props.kind == "primary" && !props.isOutline && isEnabled.value,
    [primaryOutlineEnabledClasses]: props.kind == "primary" && props.isOutline && isEnabled.value,
    [secondaryEnabledClasses]: props.kind == "secondary" && !props.isOutline && isEnabled.value,
    [secondaryOutlineEnabledClasses]: props.kind == "secondary" && props.isOutline && isEnabled.value,
    [primaryDisabledClasses]: props.kind == "primary" && !props.isOutline && !isEnabled.value,
    [primaryOutlineDisabledClasses]: props.kind == "primary" && props.isOutline && !isEnabled.value,
    [secondaryDisabledClasses]: props.kind == "secondary" && !props.isOutline && !isEnabled.value,
    [secondaryOutlineDisabledClasses]: props.kind == "secondary" && props.isOutline && !isEnabled.value,
    [waitingStateClasses]: props.isWaiting,
    [disabledStateClasses]: props.isDisabled,
    [smSizeClasses]: props.size == "sm",
    [mdSizeClasses]: props.size == "md",
    [lgSizeClasses]: props.size == "lg",
  };
});
</script>
