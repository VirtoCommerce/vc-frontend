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
import { TableMobileActions } from "@/components";
import { ItemAction } from "@/components/types";
import { computed, Ref, ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },

  actionBuilder: {
    type: Function,
    default: undefined,
  },
});

const offsetX = ref(0);
const startX = ref(0);
const startY = ref(0);
const startOffsetX = ref(0);
const isMoving = ref(false);
const threshold = 10;
const maxWidth = 160;
const itemActions: Ref<ItemAction[]> = ref([]);
const itemActionsLeft = computed(() => itemActions.value.filter((item) => item.position === "left"));
const itemActionsRight = computed(() => itemActions.value.filter((item) => item.position === "right"));

const touchStart = async (e: TouchEvent): Promise<void> => {
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
  startOffsetX.value = offsetX.value;
  isMoving.value = true;

  if (!itemActions.value.length) {
    if (typeof props.actionBuilder === "function") {
      itemActions.value = await props.actionBuilder(props.item);
    }
  }
};

const touchMove = (e: TouchEvent): void => {
  if (itemActions.value && itemActions.value.length) {
    const deltaX = e.touches[0].clientX - startX.value;
    const deltaY = e.touches[0].clientY - startY.value;

    if (
      Math.abs(deltaX) > threshold &&
      Math.abs(startOffsetX.value + deltaX) <= maxWidth &&
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
  offsetX.value = offsetX.value < -(maxWidth / 2) ? -maxWidth : 0;
  isMoving.value = false;
};

const touchCancel = (): void => {
  offsetX.value = offsetX.value < -(maxWidth / 2) ? -maxWidth : 0;
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
