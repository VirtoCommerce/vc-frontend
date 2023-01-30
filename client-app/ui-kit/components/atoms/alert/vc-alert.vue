<template>
  <div class="vc-alert" :class="[type && `vc-alert--${type}`]">
    <VcIcon v-if="icon" :name="iconName" size="sm" class="vc-alert__icon" />

    <div class="vc-alert__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  type?: "success" | "warning" | "danger";
  icon?: boolean | string;
}

const props = defineProps<Props>();

const iconName = computed<string>(() => {
  const { icon } = props;

  if (icon && typeof icon === "string") {
    return icon;
  }

  switch (props.type) {
    case "danger":
      return "x-circle";

    case "warning":
      return "exclamation-circle";

    case "success":
      return "check-circle";

    default:
      return "information-circle";
  }
});
</script>

<style lang="scss">
$colors: success, warning, danger;

.vc-alert {
  @apply flex items-center space-x-2 py-1.5 px-2.5 rounded;

  @each $color in $colors {
    &--#{$color} {
      @apply text-[color:var(--color-#{$color})] bg-[color:var(--color-#{$color}-light)];
    }
  }

  &__icon {
    @apply shrink-0;
  }

  &__content {
    @apply grow flex items-center text-11 text-[color:var(--color-body-text)];
  }
}
</style>
