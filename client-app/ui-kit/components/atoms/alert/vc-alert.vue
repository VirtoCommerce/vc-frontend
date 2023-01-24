<template>
  <div class="vc-alert" :class="[type && `vc-alert--${type}`]">
    <svg v-if="icon" class="vc-alert__icon">
      <use :href="iconSrc" />
    </svg>

    <div class="vc-alert__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";

const props = defineProps({
  text: Boolean,

  type: {
    type: String as PropType<"info" | "success" | "warning" | "error">,
    default: "",
    validator: (value: string) => !value || ["info", "success", "warning", "error"].includes(value),
  },

  icon: {
    type: [Boolean, String],
    default: false,
  },
});

const iconSrc = computed<string>(() => {
  const { icon } = props;

  if (icon && typeof icon === "string") {
    return icon;
  }

  switch (props.type) {
    case "error":
      return "/static/images/x-circle.svg#main";

    case "warning":
      return "/static/images/exclamation-circle.svg#main";

    case "success":
      return "/static/images/check-circle.svg#main";

    case "info":
      return "/static/images/information-circle.svg#main";

    default:
      return "/static/images/information-circle.svg#main";
  }
});
</script>

<style lang="scss">
.vc-alert {
  @apply flex items-center space-x-2 pr-3 pl-2.5 py-1.5 rounded;

  &--info {
    @apply text-[color:var(--color-link)] bg-[color:var(--color-link-light)];
  }

  &--success {
    @apply text-[color:var(--color-success)] bg-[color:var(--color-success-light)];
  }

  &--warning {
    @apply text-[color:var(--color-warning)] bg-[color:var(--color-warning-light)];
  }

  &--error {
    @apply text-[color:var(--color-danger)] bg-[color:var(--color-danger-light)];
  }

  &__icon {
    @apply shrink-0 w-5 h-5;
  }

  &__content {
    @apply grow flex items-center text-11 text-[color:var(--color-secondary)];
  }
}
</style>
