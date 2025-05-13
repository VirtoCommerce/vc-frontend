<template>
  <Transition name="subcategories--slide">
    <div
      v-if="item && item.childCategories?.length"
      class="subcategories"
      role="button"
      tabindex="-1"
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
          :to="routes[child.id]"
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
import { ref, computed, onBeforeUnmount } from "vue";
import { useCategoriesRoutes } from "@/core/composables";
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
let switchTimeout: ReturnType<typeof setTimeout> | null = null;

const items = computed(() => props.item.childCategories || []);
const routes = useCategoriesRoutes(items);

function showChildren(item: Category) {
  cancelHide();

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }

  if (activeItem.value?.id === item.id) {
    return;
  }

  switchTimeout = setTimeout(() => {
    activeItem.value = item;
  }, 200);
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

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }

  timeout = null;
  switchTimeout = null;

  props.onCancelHide?.();
}

onBeforeUnmount(() => {
  if (timeout) {
    clearTimeout(timeout);
  }

  if (switchTimeout) {
    clearTimeout(switchTimeout);
  }
});
</script>

<style lang="scss">
.subcategories {
  @apply w-[21.5rem] max-h-[100%-2.5rem] overflow-y-auto;

  &--slide {
    &-enter-active,
    &-leave-active {
      @apply overflow-hidden;

      transition:
        width 0.3s ease,
        opacity 0.3s ease-in-out;

      & > * {
        @apply w-[19.5rem];
      }
    }

    &-enter-from,
    &-leave-to {
      @apply w-0 opacity-0;
    }

    &-enter-to,
    &-leave-from {
      @apply w-[21.5rem] opacity-100;
    }
  }

  &__list {
    @apply flex-none w-[21.5rem];
  }

  &__arrow {
    @apply fill-secondary-400;
  }

  &__divider {
    @apply self-stretch w-px bg-secondary-200;
  }
}
</style>
