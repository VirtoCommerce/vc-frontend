<template>
  <div
    :class="['vc-sliding-actions', { 'vc-sliding-actions--moving': isMoving }]"
    :style="`transform: translateX(${offsetX}px)`"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <ActionsBox v-if="actionsOnLeft.length" :actions="actionsOnLeft" :input-object="inputObject" :width="maxWidth" />

    <div class="vc-sliding-actions__content">
      <slot />
    </div>

    <ActionsBox v-if="actionsOnRight.length" :actions="actionsOnRight" :input-object="inputObject" :width="maxWidth" />
  </div>
</template>

<script setup lang="ts">
// FIXME: https://virtocommerce.atlassian.net/browse/ST-5121
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref } from "vue";
import ActionsBox from "./_internal/actions-box.vue";
import type { PropType } from "vue";

const props = defineProps({
  inputObject: Object,

  actionsBuilder: {
    type: Function as PropType<(inputObject: any) => SlidingActionsItem[]>,
    default: () => [],
  },
});

const threshold = 10;
const maxWidth = 80;

const offsetX = ref(0);
const startX = ref(0);
const startY = ref(0);
const startOffsetX = ref(0);
const isMoving = ref(false);
const actions = ref<SlidingActionsItem[]>([]);

const actionsOnLeft = computed<SlidingActionsItem[]>(() => actions.value.filter((action) => action.left));
const actionsOnRight = computed<SlidingActionsItem[]>(() => actions.value.filter((action) => !action.left));

function resetOffset() {
  if (actionsOnLeft.value.length) {
    offsetX.value = -maxWidth;
    startOffsetX.value = offsetX.value;
  } else {
    offsetX.value = 0;
    startOffsetX.value = 0;
  }
}

async function handleTouchStart(event: TouchEvent) {
  startX.value = event.touches[0].clientX;
  startY.value = event.touches[0].clientY;
  startOffsetX.value = offsetX.value;

  if (!actions.value.length) {
    actions.value = await props.actionsBuilder(props.inputObject);
    resetOffset();
  }

  if (actions.value.length) {
    isMoving.value = true;
  }
}

function handleTouchMove(event: TouchEvent) {
  if (!actions.value.length) {
    return;
  }

  const deltaX = event.touches[0].clientX - startX.value;
  const deltaY = event.touches[0].clientY - startY.value;
  const newOffsetX = startOffsetX.value + deltaX;
  const absoluteNewOffsetX = Math.abs(newOffsetX);

  const shiftAllowed =
    Math.abs(deltaX) > threshold &&
    newOffsetX < 0 &&
    (actionsOnRight.value.length
      ? actionsOnLeft.value.length
        ? absoluteNewOffsetX <= maxWidth * 2
        : absoluteNewOffsetX <= maxWidth
      : absoluteNewOffsetX <= maxWidth);

  if (!shiftAllowed) {
    return;
  }

  if (event.cancelable && Math.abs(deltaY) < threshold * 2) {
    event.preventDefault();
  }

  offsetX.value = newOffsetX;
}

function handleTouchEnd() {
  const absoluteOffsetX = Math.abs(offsetX.value);

  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value = absoluteOffsetX <= maxWidth * 2 - threshold * 2 ? -maxWidth : -maxWidth * 2;
  }

  isMoving.value = false;
}
</script>

<style scoped lang="scss">
.vc-sliding-actions {
  @apply relative flex flex-nowrap items-stretch transition-transform duration-200;

  &__content {
    @apply shrink-0 w-full;
  }

  &--moving {
    @apply transition-none;
  }
}
</style>
