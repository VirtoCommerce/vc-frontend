<template>
  <div
    class="relative flex flex-col border-y bg-white pb-4 pt-4.5 shadow-sm md:flex-row md:items-center md:rounded md:border-x md:py-0"
  >
    <router-link
      :to="{ name: 'ListDetails', params: { listId: list.id } }"
      class="grow truncate px-6 text-17 font-extrabold text-[color:var(--color-link)] before:absolute before:inset-0 hover:text-[color:var(--color-link-hover)] md:py-5 md:text-base md:before:hidden"
    >
      {{ list.name }}
    </router-link>

    <div class="mt-1.5 shrink-0 px-6 text-13 font-bold md:mt-0 md:text-base">
      {{ $t("shared.wishlists.list_card.product_count_label") }}:
      <span class="ml-1 text-sm font-extrabold">{{ list.items!.length }}</span>
    </div>

    <div class="hidden shrink-0 gap-x-3 px-6 md:flex">
      <!-- todo: https://virtocommerce.atlassian.net/browse/ST-2256 -->
      <button
        type="button"
        class="h-7 w-7 rounded text-gray-700 shadow hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.list_settings_button')"
        @click="$emit('settings')"
      >
        <i class="fas fa-cog text-sm" />
      </button>

      <button
        type="button"
        class="h-7 w-7 rounded text-[color:var(--color-danger)] shadow hover:bg-gray-100"
        :title="$t('shared.wishlists.list_card.remove_list_button')"
        @click="$emit('remove')"
      >
        <i class="fas fa-times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WishlistType } from "@/xapi/types";
import type { PropType } from "vue";

defineEmits(["settings", "remove"]);

defineProps({
  list: {
    type: Object as PropType<WishlistType>,
    required: true,
  },
});
</script>
