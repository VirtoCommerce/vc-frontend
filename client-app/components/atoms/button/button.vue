<template>
  <router-link
    v-if="type == 'link'"
    v-bind="$attrs"
    :to="to"
    class="h-11 rounded flex justify-center items-center uppercase font-roboto-condensed cursor-pointer"
    :class="linkClass"
  >
    <slot></slot>
  </router-link>
  <button
    v-if="type == 'button'"
    v-bind="$attrs"
    :type="isSubmit ? 'submit' : 'button'"
    class="h-11 rounded flex justify-center items-center uppercase font-roboto-condensed cursor-pointer"
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
  type: {
    type: String,
    default: "button",
    validator(value: string) {
      return ["button", "link"].includes(value);
    },
  },
  kind: {
    type: String,
    default: "primary",
    validator(value: string) {
      return ["primary", "secondary"].includes(value);
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
  classes: {
    type: String,
    default: "",
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
    default: "/",
  },
});

const emit = defineEmits(["click"]);

const isEnabled = computed(() => !props.disabled && !props.waiting);

const linkClass = computed(() => {
  return {
    "bg-yellow-500 text-white hover:bg-yellow-600 ": props.kind == "primary" && !props.outline,
    "border-yellow-500 text-yellow-500 hover:bg-yellow-600 hover:text-white hover:border-yellow-600":
      props.kind == "primary" && props.outline,
    "bg-black text-white hover:bg-yellow-600": props.kind == "secondary" && !props.outline,
    "bg-white border-black hover:bg-yellow-600 hover:text-white hover:border-yellow-600":
      props.kind == "secondary" && props.outline,
  };
});

const buttonClass = computed(() => {
  return {
    "bg-yellow-500 text-white hover:bg-yellow-600 ": props.kind == "primary" && !props.outline && isEnabled,
    "border-yellow-500 text-yellow-500 hover:bg-yellow-600 hover:text-white hover:border-yellow-600":
      props.kind == "primary" && props.outline && isEnabled,
    "bg-black text-white hover:bg-yellow-600": props.kind == "secondary" && !props.outline && isEnabled,
    "bg-white border-black hover:bg-yellow-600 hover:text-white hover:border-yellow-600":
      props.kind == "secondary" && props.outline && isEnabled,
    "bg-yellow-500 text-white": props.kind == "primary" && !props.outline && !isEnabled.value,
    "border-yellow-500 text-yellow-500": props.kind == "primary" && props.outline && !isEnabled.value,
    "bg-black text-white": props.kind == "secondary" && !props.outline && !isEnabled.value,
    "bg-white border-black": props.kind == "secondary" && props.outline && !isEnabled.value,
    "cursor-wait": props.waiting,
    "cursor-not-allowed": props.disabled,
  };
});
</script>
