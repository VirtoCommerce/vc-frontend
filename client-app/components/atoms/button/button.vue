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

const buttonClass = computed(() => {
  return {
    "bg-yellow-500 text-white hover:bg-yellow-600 ": props.kind == "primary" && !props.outline && isEnabled.value,
    "border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-600 hover:text-white hover:border-yellow-600":
      props.kind == "primary" && props.outline && isEnabled.value,
    "bg-black text-white hover:bg-yellow-600": props.kind == "secondary" && !props.outline && isEnabled.value,
    "border-2 g-white border-black hover:bg-yellow-600 hover:text-white hover:border-yellow-600":
      props.kind == "secondary" && props.outline && isEnabled.value,
    "bg-yellow-500 text-white": props.kind == "primary" && !props.outline && !isEnabled.value,
    "border-2 border-yellow-500 text-yellow-500": props.kind == "primary" && props.outline && !isEnabled.value,
    "bg-black text-white": props.kind == "secondary" && !props.outline && !isEnabled.value,
    "border-2 bg-white border-black": props.kind == "secondary" && props.outline && !isEnabled.value,
    "cursor-wait opacity-30": props.waiting,
    "cursor-not-allowed opacity-30": props.disabled,
    "h-11 text-lg": props.size == "lg",
    "h-9 text-base": props.size == "md",
    "h-8 text-sm": props.size == "sm",
  };
});
</script>
