<!-- eslint-disable vuejs-accessibility/no-static-element-interactions -->
<template>
  <div v-if="$cfg.rating_enabled && modelValue">
    <VcLabel v-if="label" class="vc-rating-info__label">{{ label }}</VcLabel>
    <div class="vc-rating" @mouseleave="onLeave" @blur="onLeave">
      <VcIcon
        v-for="index in max"
        :key="index"
        class="vc-rating__icon"
        :class="{ 'vc-rating__icon--disabled': !readonly && index > (hoveredValue ?? modelValue) }"
        name="star"
        :size="isMobile ? 'xl' : 'md'"
        @mouseenter="onEnter(index)"
        @focus="onEnter(index)"
        @click="onClick(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ref, toRefs } from "vue";
import { VcLabel, VcIcon } from "@/ui-kit/components/atoms";

interface IProps {
  label?: string;
  modelValue: number | null | undefined;
  max?: number;
  readonly?: boolean;
}

interface IEmits {
  (event: "update:modelValue", value: number): void;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  max: 5,
  readonly: false,
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

const { modelValue } = toRefs(props);
const hoveredValue = ref<number | null>();

function onEnter(value: number) {
  hoveredValue.value = value;
}

function onLeave() {
  hoveredValue.value = null;
}

function onClick(value: number) {
  if (!props.readonly) {
    modelValue.value = value;
    emit("update:modelValue", value);
  }
}
</script>

<style lang="scss">
.vc-rating {
  @apply flex items-center gap-0.5 whitespace-nowrap;

  &__label {
    @apply mb-1;
  }

  &__icon {
    @apply text-[color:var(--color-rating)] outline-none;

    &--disabled {
      @apply text-[color:var(--color-rating-disabled)];
    }
  }
}
</style>
