<template>
  <div
    class="relative flex flex-col border-t bg-white pb-4 pt-4.5 shadow-sm last:border-b md:flex-row md:items-center md:py-0 lg:rounded lg:border"
  >
    <router-link
      :to="{ name: 'ListDetails', params: { listId: list.id } }"
      class="grow truncate px-6 text-17 font-extrabold text-[color:var(--color-link)] before:absolute before:inset-0 hover:text-[color:var(--color-link-hover)] md:py-5 md:text-base md:before:hidden"
    >
      {{ list.name }}
    </router-link>

    <div class="mt-1.5 shrink-0 px-6 text-13 font-bold md:mt-0 md:text-base">
      {{ $t("shared.wishlists.list_card.product_count_label") }}:
      <span class="ml-1 text-sm font-black">{{ list.items!.length }}</span>
    </div>

    <div class="absolute right-0 top-5 px-5 md:relative md:right-auto md:top-auto">
      <WishlistDropdownMenu @edit="$emit('settings')" @remove="$emit('remove')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WishlistType } from "@/core/api/graphql/types";
import type { PropType } from "vue";
import WishlistDropdownMenu from "@/shared/wishlists/components/wishlist-dropdown-menu.vue";

defineEmits(["settings", "remove"]);

defineProps({
  list: {
    type: Object as PropType<WishlistType>,
    required: true,
  },
});
</script>
