<template>
  <div
    class="flex flex-row flex-wrap md:flex-nowrap items-center gap-x-8 md:gap-x-10 bg-white pt-3 pb-5 md:py-0 px-6 shadow-sm md:rounded md:border"
  >
    <router-link
      :to="{ name: 'ListDetails', params: { listId: list.id } }"
      class="relative shrink-0 w-full md:flex-1 font-extrabold pt-0.5 pb-1 md:py-6 text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)] break-words line-clamp-6"
    >
      {{ list.name }}
    </router-link>

    <div class="shrink-0 w-full md:w-auto font-bold text-sm md:text-base mb-4 md:mb-0 xl:pr-5">
      {{ $t("shared.wishlists.list_card.quantity_label") }}:
      <span class="ml-1 font-extrabold">{{ list.items!.length }}</span>
    </div>

    <div class="shrink-0 space-x-3 ml-auto">
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
