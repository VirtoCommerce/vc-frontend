<template>
  <div
    class="vc-table-mobile__item"
    :class="{ 'vc-table-mobile__item_moving': isMoving }"
    :style="`transform: translateX(${offsetX}px)`"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchCancel"
  >
    <!-- Item left actions -->
    <TableMobileActions
      v-if="itemActionsLeft && itemActionsLeft.length"
      :item="item"
      :item-actions="itemActionsLeft"
    ></TableMobileActions>

    <div class="vc-table-mobile__item-content">
      <!-- Mobile item slot content -->
      <slot></slot>
    </div>

    <!-- Item right actions -->
    <TableMobileActions
      v-if="itemActionsRight && itemActionsRight.length"
      :item="item"
      :item-actions="itemActionsRight"
    ></TableMobileActions>
  </div>
</template>

<script setup lang="ts">
import TableMobileActions from "../table-mobile-actions/table-mobile-actions.vue";
import { computed, PropType, Ref, ref } from "vue";
import { ItemAction } from "../../../../types";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },

  actionBuilder: {
    type: Function as PropType<(obj: any) => ItemAction[]>,
    default: undefined,
  },
});

const offsetX = ref(0);
const startX = ref(0);
const startY = ref(0);
const startOffsetX = ref(0);
const isMoving = ref(false);
const threshold = 10;
const maxWidth = 80;
const itemActions: Ref<ItemAction[]> = ref([]);
const itemActionsLeft = computed(
  () =>
    itemActions.value &&
    itemActions.value.length &&
    itemActions.value.filter((action: ItemAction) => action.leftActions)
);
const itemActionsRight = computed(
  () =>
    itemActions.value &&
    itemActions.value.length &&
    itemActions.value.filter((action: ItemAction) => !action.leftActions)
);

const touchStart = async (e: TouchEvent): Promise<void> => {
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
  startOffsetX.value = offsetX.value;
  isMoving.value = true;

  if (!itemActions.value.length) {
    if (typeof props.actionBuilder === "function") {
      itemActions.value = await props.actionBuilder(props.item);

      if (itemActions.value.some((action: ItemAction) => action.leftActions)) {
        offsetX.value = -maxWidth;
        startOffsetX.value = offsetX.value;
      }
    }
  }
};

const touchMove = (e: TouchEvent): void => {
  if (itemActions.value && itemActions.value.length) {
    const deltaX = e.touches[0].clientX - startX.value;
    const deltaY = e.touches[0].clientY - startY.value;

    if (
      Math.abs(deltaX) > threshold &&
      (itemActionsLeft.value && itemActionsLeft.value.length
        ? Math.abs(startOffsetX.value + deltaX) <= maxWidth * 2
        : Math.abs(startOffsetX.value + deltaX) <= maxWidth) &&
      startOffsetX.value + deltaX < 0
    ) {
      if (Math.abs(deltaY) < threshold * 2) {
        e.preventDefault();
      }
      offsetX.value = startOffsetX.value + deltaX;
    }
  }
};

const touchEnd = (): void => {
  const absoluteOffsetX = Math.abs(offsetX.value);
  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value = absoluteOffsetX <= maxWidth * 2 - threshold * 2 ? -maxWidth : -maxWidth * 2;
  }

  isMoving.value = false;
};

const touchCancel = (): void => {
  const absoluteOffsetX = Math.abs(offsetX.value);
  if (absoluteOffsetX < maxWidth) {
    offsetX.value = absoluteOffsetX < maxWidth / 2 ? 0 : -maxWidth;
  } else {
    offsetX.value = absoluteOffsetX <= maxWidth * 2 - threshold * 2 ? -maxWidth : -maxWidth * 2;
  }

  isMoving.value = false;
};
</script>

<style lang="scss" scoped>
.vc-table-mobile__item {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  transition: transform ease 0.2s;

  &_moving {
    transition: none;
  }

  &-content {
    flex-shrink: 0;
    width: 100%;
  }
}
</style>
