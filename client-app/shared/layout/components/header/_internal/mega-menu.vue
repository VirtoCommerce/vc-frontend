<template>
  <nav ref="megaMenuElement" class="mega-menu" role="navigation">
    <VcPopover
      arrow-enabled
      placement="bottom-start"
      class="mega-menu__popover"
      :aria-label="$t('common.buttons.all_products')"
      role="menu"
    >
      <template #trigger>
        <button
          type="button"
          class="mega-menu__button"
          tabindex="0"
          :disabled="loading"
          @keyup.arrow-down="focusMenuItem"
        >
          <VcLoader v-if="loading" class="mega-menu__loader" />
          <VcIcon v-else class="mega-menu__icon" name="drag-dots" />

          <span> {{ $t("common.buttons.all_products") }} </span>
        </button>
      </template>

      <template v-if="category" #content="{ close }">
        <div class="mega-menu__content">
          <Subcategories
            :item="category"
            :aria-label="$t('shared.layout.header.mega_menu.aria_labels.categories')"
            @close="close"
          />
        </div>
      </template>
    </VcPopover>

    <div class="mega-menu__divider"></div>

    <ul
      ref="navElement"
      class="mega-menu__nav"
      role="menubar"
      :aria-label="$t('shared.layout.header.mega_menu.aria_labels.navigation')"
    >
      <li v-for="(item, index) in visibleItems" :key="index" class="mega-menu__item" menu-item role="none">
        <VcLink :to="item.route ?? '#'" class="mega-menu__link" role="menuitem">
          {{ item.title }}
        </VcLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { useElementBounding, watchDebounced } from "@vueuse/core";
import { ref, computed, onMounted, useTemplateRef, nextTick } from "vue";
import { useNavigations } from "@/core/composables";
import { useCategory } from "@/shared/catalog";
import Subcategories from "./subcategories.vue";

interface IProps {}

defineProps<IProps>();

const MENU_PADDING_RIGHT = 20;

const calculating = ref(false);
const navRef = useTemplateRef<HTMLElement>("navElement");
const menuRef = useTemplateRef<HTMLElement>("megaMenuElement");
const visibleItemsCount = ref(1);

const { width: menuRight } = useElementBounding(menuRef);
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

    if (useElementBounding(item).right.value > menuRight.value - MENU_PADDING_RIGHT) {
      itemsCount--;
      break;
    }

    itemsCount++;
  }

  visibleItemsCount.value = itemsCount;
  calculating.value = false;
}

function focusMenuItem() {
  if (!category.value || !category.value.childCategories.length) {
    return;
  }

  const item = document.querySelector(
    `[id="subcategory-${category.value?.childCategories[0].id}"] > [role="menuitem"]`,
  ) as HTMLElement;

  if (item) {
    item.focus();
  }
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
  @apply flex gap-4 h-10 bg-[--header-bottom-bg-color] px-5 xl:px-12;

  &__popover {
    @apply flex items-stretch;
  }

  &__button {
    @apply flex items-center p-1 h-full gap-2 text-sm text-[--header-bottom-link-color] font-bold whitespace-nowrap border-none rounded;

    &:hover {
      @apply text-[--header-bottom-link-hover-color];
    }

    &:disabled {
      @apply cursor-not-allowed text-neutral-400;
    }

    &:focus {
      @apply outline-none ring-2 ring-primary-100;
    }
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
    @apply text-sm font-normal text-[--header-bottom-link-color] whitespace-nowrap;

    &:hover {
      @apply text-[--header-bottom-link-hover-color];
    }
  }

  &__content {
    @apply flex min-w-0 max-h-[calc(100vh-11.5rem)] ps-2.5 py-5 bg-[--header-bottom-bg-color] rounded shadow-lg;
  }
}
</style>
