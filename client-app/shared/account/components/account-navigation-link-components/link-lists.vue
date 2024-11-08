<template>
  <AccountNavigationItem :item="item">
    <template v-if="isListDetails">
      <div
        v-for="list in lists"
        :key="list.id"
        class="ml-4 flex items-center space-x-2 overflow-hidden text-ellipsis px-3 text-sm"
      >
        <VcIcon class="flex-none fill-primary" size="xs" name="minus" />

        <router-link
          :to="{ name: 'ListDetails', params: { listId: list.id } }"
          class="line-clamp-2 cursor-pointer py-0.5 font-bold text-neutral hover:text-additional-950"
          active-class="!text-neutral-950"
        >
          {{ list.name }}
        </router-link>
      </div>
    </template>
  </AccountNavigationItem>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useWishlists } from "@/shared/wishlists";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

defineProps<IProps>();

const { lists, fetchWishlists } = useWishlists();
const isListDetails = computed(() => route.name === "ListDetails");

interface IProps {
  item: ExtendedMenuLinkType;
}

const route = useRoute();
watchEffect(async () => {
  if (isListDetails.value) {
    await fetchWishlists();
  }
});
</script>
