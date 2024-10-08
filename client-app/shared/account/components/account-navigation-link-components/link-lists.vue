<template>
  <AccountNavigationLink :item="item">
    <template v-if="isListDetails">
      <div
        v-for="list in lists"
        :key="list.id"
        class="ml-4 flex items-center space-x-2 overflow-hidden text-ellipsis px-3 text-sm"
      >
        <VcIcon class="flex-none text-primary" name="minus" />

        <router-link
          :to="{ name: 'ListDetails', params: { listId: list.id } }"
          class="line-clamp-2 cursor-pointer py-0.5 font-bold text-neutral hover:text-additional-950"
          active-class="!text-neutral-950"
        >
          {{ list.name }}
        </router-link>
      </div>
    </template>
  </AccountNavigationLink>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useRoute } from "vue-router";
import { useWishlists } from "@/shared/wishlists";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationLink from "@/shared/account/components/account-navigation-link.vue";
const props = defineProps<IProps>();

const { lists } = useWishlists();
const isListDetails = computed(() => route.name === "ListDetails");

interface IProps {
  item: ExtendedMenuLinkType;
}

const item = toRef(props, "item");

const route = useRoute();
</script>
