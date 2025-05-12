<template>
  <nav :id="componentId" class="mega-menu">
    <VcPopover arrow-enabled placement="bottom-start" class="mega-menu__popover">
      <template #trigger>
        <button type="button" to="/catalog" class="mega-menu__button">
          <VcIcon class="mega-menu__icon" name="drag-dots" />
          <span> All Products </span>
        </button>
      </template>

      <template #content="{ close }">
        <div class="mega-menu__content">
          <ul class="mega-menu__list">
            <VcMenuItem
              v-for="(item, index) in catalogMenuItems"
              :key="index"
              class="mega-menu__item"
              size="sm"
              :to="item.route"
              @click="close"
              @focus="() => openChildren(item)"
              @mouseover="() => openChildren(item)"
            >
              {{ item.title }}

              <template v-if="item.children?.length" #append>
                <VcIcon class="mega-menu__arrow" name="chevron-right" />
              </template>
            </VcMenuItem>
          </ul>

          <Subcategories v-if="activeItem" :item="activeItem" @close="close" />
        </div>
      </template>
    </VcPopover>

    <div class="mega-menu__divider"></div>

    <ul class="mega-menu__nav">
      <li v-for="(item, index) in catalogMenuItems" :key="index" class="mega-menu__item">
        <router-link :to="item.route ?? '#'" class="mega-menu__link">
          {{ item.title }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { useNavigations } from "@/core/composables";
import { useComponentId } from "@/ui-kit/composables";
import Subcategories from "./subcategories.vue";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {}

defineProps<IProps>();

const activeItem = ref<ExtendedMenuLinkType | null>(null);

const componentId = useComponentId("mega-menu");
const { catalogMenuItems } = useNavigations();

function openChildren(item: ExtendedMenuLinkType) {
  activeItem.value = item;
}
</script>

<style lang="scss">
.mega-menu {
  @apply relative z-[3] flex gap-4 h-10 bg-[--header-bottom-bg-color] px-5 xl:px-12;

  &__popover {
    @apply flex items-stretch;
  }

  &__button {
    @apply flex items-center p-1 h-full gap-2 text-sm text-[--header-bottom-link-color] font-bold hover:text-[--header-bottom-link-hover-color];
  }

  &__icon {
    @apply fill-primary size-4;
  }

  &__divider {
    @apply self-center h-5 w-px bg-secondary-200;
  }

  &__nav {
    @apply flex items-center gap-6;
  }

  &__link {
    @apply text-sm font-normal text-[--header-bottom-link-color] hover:text-[--header-bottom-link-hover-color];
  }

  &__content {
    @apply flex min-w-0 p-5 bg-[--header-bottom-bg-color] rounded shadow-lg;
  }

  &__list {
    @apply flex-none w-[21.5rem];
  }

  &__arrow {
    @apply fill-secondary-400;
  }

  &__catalog-divider {
    @apply w-px bg-secondary-200;
  }
}
</style>
