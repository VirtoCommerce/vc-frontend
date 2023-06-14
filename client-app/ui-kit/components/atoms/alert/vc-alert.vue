<template>
  <div class="vc-alert" :class="[`vc-alert--${variant}--${color}`]">
    <VcIcon v-if="icon" :name="iconName" :size="16" class="vc-alert__icon" />

    <div class="vc-alert__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IProps {
  color?: "success" | "warning" | "danger" | "info";
  icon?: boolean | string;
  variant?: "solid" | "outline";
}

const props = withDefaults(defineProps<IProps>(), {
  variant: "solid",
  color: "info",
});

const iconName = computed<string>(() => {
  const { icon } = props;

  if (icon && typeof icon === "string") {
    return icon;
  }

  switch (props.color) {
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
$colors: success, warning, danger, info;

.vc-alert {
  @apply flex items-start space-x-2 p-2 border rounded;

  @each $color in $colors {
    &--solid--#{$color} {
      @apply text-[--color-#{$color}-500] bg-[--color-#{$color}-50] border-[--color-#{$color}-50];
    }

    &--outline--#{$color} {
      @apply text-[--color-#{$color}-500] border-current;
    }
  }

  &__icon {
    @apply shrink-0;
  }

  &__content {
    @apply grow text-xs text-[--color-neutral-950];

    &:first-child:last-child {
      @apply px-1;
    }
  }
}
</style>
