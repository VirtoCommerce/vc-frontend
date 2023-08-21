<template>
  <div class="vc-actions-box" :style="`--vc-actions-box-width: ${width}px`">
    <!-- First action -->
    <ActionButton
      :icon="actions[0].icon"
      :class="actions[0].classes"
      @click.stop="actions[0].clickHandler(inputObject)"
    >
      {{ actions[0].title }}
    </ActionButton>

    <!-- Second action -->
    <ActionButton
      v-if="actions.length === 2"
      :icon="actions[1].icon"
      :class="actions[1].classes"
      @click.stop="actions[1].clickHandler(inputObject)"
    >
      {{ actions[1].title }}
    </ActionButton>

    <!-- Other actions -->
    <template v-if="actions.length > 2">
      <ActionButton icon="dots-horizontal" @click.stop="isActionsPopupVisible = true">
        {{ $t("common.buttons.more") }}
      </ActionButton>

      <!-- Actions popup -->
      <ActionsPopup
        v-if="isActionsPopupVisible"
        :actions="actions"
        @close="isActionsPopupVisible = false"
        @select="(action: SlidingActionsItem) => action.clickHandler(inputObject)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ActionButton from "./action-button.vue";
import ActionsPopup from "./actions-popup.vue";
import type { PropType } from "vue";

defineProps({
  inputObject: Object,

  actions: {
    type: Array as PropType<SlidingActionsItem[]>,
    default: () => [],
    required: true,
  },

  width: {
    type: [String, Number],
    default: 80, // px,
  },
});

const isActionsPopupVisible = ref(false);
</script>

<style scoped lang="scss">
.vc-actions-box {
  @apply flex flex-col shrink-0 [justify-content:stretch] w-[var(--vc-actions-box-width)] bg-[#a9bfd2];
}
</style>
