<template>
  <nav :id="componentId" ref="megaMenuElement" class="mega-menu">
    <VcPopover arrow-enabled placement="bottom-start" class="mega-menu__popover">
      <template #trigger>
        <button type="button" to="/catalog" class="mega-menu__button" :disabled="loading">
          <VcIcon class="mega-menu__icon" name="drag-dots" />
          <span> All Products </span>
        </button>
      </template>

      <template #content="{ close }">
        <div class="mega-menu__content">
          <Subcategories v-if="category" :item="category" @close="close" />
        </div>
      </template>
    </VcPopover>

    <div class="mega-menu__divider"></div>

    <ul ref="navElement" class="mega-menu__nav">
      <li v-for="(item, index) in visibleItems" :key="index" class="mega-menu__item" menu-item>
        <router-link :to="item.route ?? '#'" class="mega-menu__link">
          {{ item.title }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useElementBounding, watchDebounced } from "@vueuse/core";
import { ref, computed, onMounted, useTemplateRef, nextTick } from "vue";
import { useNavigations } from "@/core/composables";
import { useCategory } from "@/shared/catalog";
import { useComponentId } from "@/ui-kit/composables";
import Subcategories from "./subcategories.vue";

interface IProps {}

defineProps<IProps>();

const calculating = ref(false);
const navRef = useTemplateRef<HTMLElement>("navElement");
const menuRef = useTemplateRef<HTMLElement>("megaMenuElement");
const visibleItemsCount = ref(1);

const { width: menuRight } = useElementBounding(menuRef);

const componentId = useComponentId("mega-menu");
const { catalogMenuItems } = useNavigations();
const { category, fetchCategory, loading } = useCategory();

const visibleItems = computed(() => catalogMenuItems.value.slice(0, visibleItemsCount.value));

async function calculateVisibleItems() {
  calculating.value = true;

  const menuItems = (navRef?.value?.querySelectorAll("[menu-item]") as NodeListOf<HTMLElement>) || [];
  let itemsCount = 1;

  for (let i = 0; i < catalogMenuItems.value.length; i++) {
    const item = menuItems[i];

    if (!item) {
      itemsCount++;
      await nextTick();
      await calculateVisibleItems();
      return;
    }

    if (useElementBounding(item).right.value > menuRight.value - 20) {
      itemsCount--;
      break;
    }

    itemsCount++;
  }

  visibleItemsCount.value = itemsCount;
  calculating.value = false;
}

watchDebounced(
  [menuRight, () => catalogMenuItems.value],
  async () => {
    if (!menuRef.value || calculating.value) {
      return;
    }

    visibleItemsCount.value = catalogMenuItems.value.length;

    await nextTick();
    await calculateVisibleItems();
  },
  { debounce: 100, maxWait: 1000, immediate: true },
);

onMounted(async () => {
  await fetchCategory({
    maxLevel: 4,
    onlyActive: true,
  });
});
</script>

<style lang="scss">
.mega-menu {
  @apply relative z-[3] flex gap-4 h-10 bg-[--header-bottom-bg-color] px-5 xl:px-12;

  &__popover {
    @apply flex items-stretch;
  }

  &__button {
    @apply flex items-center p-1 h-full gap-2 text-sm text-[--header-bottom-link-color] font-bold whitespace-nowrap hover:text-[--header-bottom-link-hover-color];
  }

  &__icon {
    @apply fill-primary size-4;
  }

  &__divider {
    @apply self-center h-5 w-px bg-secondary-200;
  }

  &__nav {
    @apply grow flex items-center gap-6;
  }

  &__link {
    @apply text-sm font-normal text-[--header-bottom-link-color] whitespace-nowrap hover:text-[--header-bottom-link-hover-color];
  }

  &__content {
    @apply flex min-w-0 max-h-[calc(100vh-11.5rem)] p-5 bg-[--header-bottom-bg-color] rounded shadow-lg;
  }
}
</style>
