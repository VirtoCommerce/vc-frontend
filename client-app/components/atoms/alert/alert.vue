<template>
  <div class="vc-alert" :class="[type && `vc-alert--${type}`, text && 'vc-alert--text']">
    <i v-if="icon" :class="iconClasses" class="vc-alert__icon" aria-hidden="true" />
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

const iconClasses = computed<string>(() => {
  const { icon } = props;

  if (icon && typeof icon === "string") {
    return icon;
  }

  switch (props.type) {
    case "error":
      return "fa fa-times-circle";

    case "warning":
      return "fa fa-exclamation-triangle";

    case "success":
      return "fa fa-check-circle";

    case "info":
      return "fa fa-info-circle";

    default:
      return "fa fa-info mx-1";
  }
});
</script>

<style lang="scss">
$status-colors: info, success, warning, error;

.vc-alert {
  $self: &;

  @apply flex items-center space-x-2 px-3 py-3 rounded-sm bg-white;

  &__icon {
    @apply text-lg;
  }

  &__content {
    @apply text-sm;
  }

  @each $status in $status-colors {
    &--#{$status} {
      @apply bg-#{$status}-500 text-white;

      &#{$self}--text {
        @apply bg-#{$status}-200 text-black;

        #{$self}__icon {
          @apply text-#{$status}-600;
        }
      }
    }
  }
}
</style>
