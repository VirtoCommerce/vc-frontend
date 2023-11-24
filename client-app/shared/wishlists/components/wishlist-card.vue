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

    <div class="mt-1.5 shrink-0 px-6 text-base font-bold md:mt-0 md:text-base">
      {{ $t("shared.wishlists.list_card.product_count_label") }}:
      <span class="ml-1 text-sm font-black">{{ list.items!.length }}</span>
    </div>

    <div v-if="isCorporateMember && list.scope" class="flex items-center gap-1 pl-6 md:pl-0 md:pr-1">
      <template v-if="list.scope === WishlistScopeType.Private">
        <VcIcon size="sm" class="text-[--color-secondary-500]" name="lock-closed" />
        <span class="text-base">
          {{ $t("shared.wishlists.list_card.status.private") }}
        </span>
      </template>
      <template v-else-if="list.scope === WishlistScopeType.Organization">
        <VcIcon size="sm" class="text-[--color-accent-500]" name="users" />
        <span class="text-base">
          {{ $t("shared.wishlists.list_card.status.shared") }}
        </span>
      </template>
    </div>

    <div class="absolute right-0 top-0 h-full p-5 md:relative">
      <WishlistDropdownMenu
        :current-scope="list.scope"
        :is-corporate-member="isCorporateMember"
        @set-scope="$emit('setScope', $event)"
        @edit="$emit('settings')"
        @remove="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { WishlistScopeType } from "@/core/api/graphql/types";
import { useUser } from "@/shared/account";
import WishlistDropdownMenu from "./wishlist-dropdown-menu.vue";
import type { WishlistType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "settings"): void;
  (event: "remove"): void;
  (event: "setScope"): void;
}

interface IProps {
  list: WishlistType;
}

defineEmits<IEmits>();

defineProps<IProps>();

const { isCorporateMember } = useUser();
</script>
