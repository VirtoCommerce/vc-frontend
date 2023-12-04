<template>
  <VcFilterCardSkeleton v-if="loading">
    <div class="mb-1.5 h-5 bg-[--color-neutral-50]">&nbsp;</div>
    <div v-for="i in 6" :key="i" class="mb-1.5 ml-6 h-4 bg-[--color-neutral-50]">&nbsp;</div>
  </VcFilterCardSkeleton>

  <!-- TODO: use VcWidget instead -->
  <VcFilterCard v-else :full-width-content="!category?.childCategories?.length">
    <template v-if="!!parentCategory" #header>
      <router-link
        :to="getCategoryRoute(parentCategory!)"
        class="-mx-1.5 flex grow items-center gap-1.5 rounded-sm px-1.5 py-0.5 hover:bg-[--color-neutral-50]"
      >
        <VcIcon class="text-[--color-primary-500]" name="chevron-left" size="xs" />

        <span class="font-bold">
          {{ parentCategory!.name }}
        </span>
      </router-link>
    </template>

    <template v-if="category?.childCategories?.length" #default>
      <div class="-mt-1 mb-0.5 py-0.5 text-xs font-black uppercase text-[--color-neutral-900]">
        {{ category?.name }}
      </div>

      <div class="flex flex-col pl-4">
        <router-link
          v-for="(item, index) in subcategories"
          :key="index"
          :to="subcategoriesRoutes[item.id]"
          class="-mx-2 mt-0.5 truncate rounded-sm px-2 py-0.5 transition-colors hover:bg-[--color-neutral-50]"
        >
          {{ item.name }}
        </router-link>
      </div>
    </template>
  </VcFilterCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCategoriesRoutes } from "@/core/composables";
import { getCategoryRoute } from "@/core/utilities";
import type { Category } from "@/core/api/graphql/types";

interface IProps {
  category?: Category | null;
  loading?: boolean;
}

const props = defineProps<IProps>();

const parentCategory = computed<Category | undefined>(() => props.category?.parent);
const subcategories = computed<Category[]>(() => props.category?.childCategories || []);

const subcategoriesRoutes = useCategoriesRoutes(subcategories);
</script>
