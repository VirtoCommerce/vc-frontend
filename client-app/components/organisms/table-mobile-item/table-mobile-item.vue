<template>
  <div
    class="vc-table-mobile__item"
    :class="{ 'vc-table-mobile__item_moving': isMoving }"
    :style="`transform: translateX(${offsetX}px)`"
    @click="$emit('click')"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchCancel"
  >
    <div class="vc-table-mobile__item-content">
      <!-- Mobile item slot content -->
      <slot></slot>
    </div>

    <!-- Item actions -->
    <div v-if="itemActions && itemActions.length" class="vc-table-mobile__item-actions">
      <!-- First available action -->
      <div
        class="vc-table-mobile__item-action"
        :class="[`vc-table-mobile__item-action_${itemActions[0].variant}`]"
        @click.stop="itemActions[0].clickHandler(item)"
      >
        <i :class="itemActions[0].icon"></i>
        <div class="vc-table-mobile__item-action-text">
          {{ itemActions[0].title }}
        </div>
      </div>

      <!-- Second available action -->
      <div
        v-if="itemActions.length === 2"
        class="vc-table-mobile__item-action"
        :class="[`vc-table-mobile__item-action_${itemActions[1].variant}`]"
        @click.stop="itemActions[1].clickHandler(item)"
      >
        <i :class="itemActions[1].icon"></i>
        <div class="vc-table-mobile__item-action-text">
          {{ itemActions[1].title }}
        </div>
      </div>

      <!-- Other available actions -->
      <template v-if="itemActions.length > 2">
        <div class="vc-table-mobile__item-action" @click.stop="isActionsPopupVisible = true">
          <i class="fas fa-ellipsis-h"></i>
          <div class="vc-table-mobile__item-action-text">More</div>
        </div>

        <!-- Actions popup -->
        <teleport v-if="isActionsPopupVisible" to="body">
          <div class="vc-table-mobile__item-actions-popup">
            <div class="vc-table-mobile__item-actions-popup-inner">
              <div class="vc-table-mobile__item-actions-popup-header">
                <span class="vc-table-mobile__item-actions-popup-title"> All actions </span>
                <i
                  class="vc-table-mobile__item-actions-popup-close fas fa-times-circle"
                  @click="isActionsPopupVisible = false"
                ></i>
              </div>

              <div class="vc-table-mobile__item-actions-popup-items">
                <div
                  v-for="(itemAction, i) in itemActions"
                  :key="i"
                  class="vc-table-mobile__item-actions-popup-item"
                  @click="itemAction.clickHandler(item)"
                >
                  <i :class="itemAction.icon"></i>
                  <div class="vc-table-mobile__item-actions-popup-item-title">
                    {{ itemAction.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </teleport>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },

    actionBuilder: {
      type: Function,
      default: undefined,
    },
  },
  emits: ["click"],

  setup(props) {
    const offsetX = ref(0);
    const startX = ref(0);
    const startY = ref(0);
    const startOffsetX = ref(0);
    const isMoving = ref(false);
    const threshold = 10;
    const maxWidth = 80;
    const isActionsPopupVisible = ref(false);
    const itemActions = ref([]);

    return {
      offsetX,
      isActionsPopupVisible,
      itemActions,
      isMoving,

      async touchStart(e: TouchEvent): Promise<void> {
        startX.value = e.touches[0].clientX;
        startY.value = e.touches[0].clientY;
        startOffsetX.value = offsetX.value;
        isMoving.value = true;

        if (!itemActions.value.length) {
          if (typeof props.actionBuilder === "function") {
            itemActions.value = await props.actionBuilder(props.item);
          }
        }
      },

      touchMove(e: TouchEvent): void {
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
      },

      touchEnd(): void {
        offsetX.value = offsetX.value < -(maxWidth / 2) ? -maxWidth : 0;
        isMoving.value = false;
      },

      touchCancel(): void {
        offsetX.value = offsetX.value < -(maxWidth / 2) ? -maxWidth : 0;
        isMoving.value = false;
      },
    };
  },
});
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

  &-actions {
    flex-shrink: 0;
    width: 80px;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    background-color: #a9bfd2;

    &-popup {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(107, 121, 135, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99;

      &-inner {
        background: white;
        border-radius: 6px;
        overflow: hidden;
        padding: var(--padding-xl);
        max-width: 80%;
        width: 350px;
        border: 1px solid #eef0f2;
        box-sizing: border-box;
        box-shadow: 1px 1px 22px rgba(126, 142, 157, 0.2);
      }

      &-header {
        display: flex;
        width: 100%;
        align-items: center;
      }

      &-title {
        flex-grow: 1;
        color: #2e3d4e;
        font-size: 19px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      &-close {
        color: #c2d7e4;
      }

      &-items {
        display: flex;
        flex-wrap: wrap;
        margin-top: 20px;
        margin-bottom: 20px;
        justify-content: space-between;
      }

      &-item {
        display: flex;
        flex-grow: 1;
        flex-shrink: 0;
        flex-direction: column;
        align-items: center;
        color: #319ed4;
        margin: 8px 0;
        box-sizing: border-box;
        padding: 4px;
        max-width: 80px;

        &-title {
          font-size: 13px;
          margin-top: 8px;
          text-align: center;
        }
      }
    }
  }

  &-action {
    display: flex;
    flex-grow: 1;
    flex-basis: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;

    &-text {
      margin-top: 4px;
      font-size: 14px;
    }

    &_primary {
      background-color: #f0ad4e;
    }

    &_danger {
      background-color: #ff4a4a;
    }

    &_grey {
      background-color: #a3afcd;
    }
  }
}
</style>
