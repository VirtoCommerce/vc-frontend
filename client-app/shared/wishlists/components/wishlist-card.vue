<template>
  <div class="relative rounded bg-additional-50 p-4 text-sm shadow-md md:flex md:items-center md:gap-6 md:px-5">
    <div class="flex items-center gap-2 pe-10 md:contents">
      <router-link
        :to="{ name: 'ListDetails', params: { listId: list.id } }"
        class="truncate text-base font-bold text-[--link-color] hover:text-[--link-hover-color]"
      >
        {{ list.name }}
      </router-link>

      <VcBadge class="md:-ms-4 md:me-auto" variant="outline-dark" color="info" rounded>
        {{ list.itemsCount }}
      </VcBadge>
    </div>

    <div v-if="list.description" class="truncate pe-10 md:max-w-[30%] md:pe-0">{{ list.description }}</div>

    <div class="flex items-center pt-4 md:contents">
      <div class="md:whitespace-nowrap">
        {{ $t("shared.wishlists.list_card.saved") }}: <b>{{ $d(list.modifiedDate) }}</b>
      </div>

      <WishlistStatus v-if="isCorporateMember && list.sharingSetting" :sharing-setting="list.sharingSetting" class="ms-auto md:ms-0" />
    </div>

    <div class="absolute right-4 top-4 md:relative md:right-auto md:top-auto">
      <WishlistDropdownMenu
        v-if="list.sharingSetting?.access === WishlistAccessType.Write"
        @edit="$emit('settings')"
        @remove="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {  WishlistAccessType } from "@/core/api/graphql/types";
import { useUser } from "@/shared/account/composables";
import WishlistDropdownMenu from "./wishlist-dropdown-menu.vue";
import WishlistStatus from "./wishlist-status.vue";
import type {WishlistType} from "@/core/api/graphql/types";

interface IEmits {
  (event: "settings"): void;
  (event: "remove"): void; 
}

interface IProps {
  list: WishlistType;
}

defineEmits<IEmits>();

defineProps<IProps>();

const { isCorporateMember } = useUser();
</script>
