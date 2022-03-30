<template>
  <div class="vc-table-mobile__item-actions">
    <!-- First available action -->
    <div
      class="vc-table-mobile__item-action"
      :class="itemActions[0].bgColor"
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
      :class="itemActions[1].bgColor"
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
</template>
<script setup lang="ts">
import { PropType, ref } from "vue";
import { ItemAction } from "../../../../types";

defineProps({
  itemActions: {
    type: Array as PropType<ItemAction[]>,
    required: true,
  },
  item: {
    type: Object,
    default: () => ({}),
  },
});

const isActionsPopupVisible = ref(false);
</script>
<style lang="scss" scoped>
.vc-table-mobile__item {
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
        padding: 15px;
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
      text-align: center;
    }
  }
}
</style>
