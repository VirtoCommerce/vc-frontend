<template>
  <Transition name="subcategories--slide">
    <div
      v-if="item && item.childCategories?.length"
      class="subcategories"
      @blur="scheduleHide"
      @mouseleave="scheduleHide"
      @focus="cancelHide"
      @mouseenter="cancelHide"
    >
      <ul class="subcategories__list">
        <VcMenuItem
          v-for="child in item.childCategories"
          :key="child.id"
          class="subcategories__item"
          size="sm"
          @click="$emit('close')"
          @focus="showChildren(child)"
          @mouseover="showChildren(child)"
        >
          {{ child.name }}

          <template v-if="child.childCategories?.length" #append>
            <VcIcon class="subcategories__arrow" name="chevron-right" />
          </template>
        </VcMenuItem>
      </ul>
    </div>
  </Transition>

  <div class="mega-menu__divider"></div>

  <Subcategories
    v-if="activeItem"
    :item="activeItem"
    :on-schedule-hide="scheduleHide"
    :on-cancel-hide="cancelHide"
    @close="$emit('close')"
  />
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import type { Category } from "@/core/api/graphql/types";

interface IEmits {
  (e: "close"): void;
}

interface IProps {
  item: Category;
  onCancelHide?: () => void;
  onScheduleHide?: () => void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const activeItem = ref<Category | null>(null);
let timeout: ReturnType<typeof setTimeout> | null = null;

function showChildren(item: Category) {
  cancelHide();
  activeItem.value = item;
}

function scheduleHide() {
  timeout = setTimeout(() => {
    activeItem.value = null;
  }, 300);

  props.onScheduleHide?.();
}

function cancelHide() {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = null;
  props.onCancelHide?.();
}

onBeforeUnmount(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>

<style lang="scss">
.subcategories {
  @apply w-[21.5rem];

  &--slide {
    &-enter-active,
    &-leave-active {
      overflow: hidden;
      transition:
        width 0.3s ease,
        opacity 0.3s ease-in-out;

      & > * {
        width: calc(21.5rem - 2rem);
      }
    }

    &-enter-from,
    &-leave-to {
      width: 0;
      opacity: 0;
    }

    &-enter-to,
    &-leave-from {
      width: 21.5rem;
      opacity: 1;
    }
  }

  &__list {
    @apply flex-none w-[21.5rem];
  }

  &__arrow {
    @apply fill-secondary-400;
  }

  &__divider {
    @apply w-px bg-secondary-200;
  }
}
</style>
