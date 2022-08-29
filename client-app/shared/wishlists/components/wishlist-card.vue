<template>
  <div
    class="relative flex flex-col md:flex-row md:items-center bg-white pt-4.5 pb-4 md:py-0 shadow-sm md:rounded border-y md:border-x"
  >
    <router-link
      :to="{ name: 'ListDetails', params: { listId: list.id } }"
      class="grow md:py-5 px-6 text-17 md:text-base font-extrabold truncate text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)] before:absolute before:inset-0 md:before:hidden"
    >
      {{ list.name }}
    </router-link>

    <div class="shrink-0 mt-1.5 md:mt-0 px-6 text-13 md:text-base font-bold">
      {{ $t("shared.wishlists.list_card.product_count_label") }}:
      <span class="ml-1 text-sm font-extrabold">{{ list.items!.length }}</span>
    </div>

    <div class="hidden md:flex shrink-0 px-6 gap-x-3">
      <!-- todo: https://virtocommerce.atlassian.net/browse/ST-2256 -->
      <button
        type="button"
        class="h-7 w-7 shadow rounded text-gray-700 hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.list_settings_button')"
        @click="$emit('settings')"
      >
        <i class="fas fa-cog text-sm" />
      </button>

      <button
        type="button"
        class="h-7 w-7 shadow rounded text-[color:var(--color-danger)] hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.remove_list_button')"
        @click="$emit('remove')"
      >
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { WishlistType } from "@/xapi/types";

defineEmits(["settings", "remove"]);

defineProps({
  list: {
    type: Object as PropType<WishlistType>,
    required: true,
  },
});
</script>
