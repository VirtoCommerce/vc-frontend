<template>
  <div class="bg-white border shadow-sm rounded">
    <div class="border-b px-5 py-4 md:px-7">
      <h2 class="text-xl font-extrabold uppercase">
        {{ $t("shared.catalog.product_details.price_block.title") }}
      </h2>
    </div>

    <div class="border-b px-5 py-8 md:px-7 md:py-5">
      <slot />
    </div>

    <div class="flex text-center">
      <div
        class="flex items-center justify-center flex-1 select-none py-4 px-1 border-r space-x-2"
        :class="{ 'cursor-pointer hover:bg-gray-100': isAuthenticated }"
        :title="
          !isAuthenticated
            ? $t('shared.catalog.product_details.price_block.add_to_list_button_unauthorized_title')
            : undefined
        "
        @click="addToList"
      >
        <i
          :class="isAuthenticated ? 'text-[color:var(--color-primary)]' : 'text-gray-400'"
          class="fas fa-plus text-base"
        />
        <span :class="isAuthenticated ? 'text-blue-800' : 'text-gray-400'" class="text-sm font-bold">
          {{ $t("shared.catalog.product_details.price_block.add_to_list_button") }}
        </span>
      </div>

      <div
        class="flex items-center justify-center flex-1 select-none py-4 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
      >
        <i class="fas fa-envelope fa-xl text-[color:var(--color-primary)]" />
        <span class="text-sm text-blue-800 font-bold">
          {{ $t("shared.catalog.product_details.price_block.send_email_button") }}
        </span>
      </div>

      <div
        class="flex items-center justify-center flex-1 select-none py-4 px-1 space-x-2 cursor-pointer hover:bg-gray-100"
        @click="print()"
      >
        <i class="fas fa-print text-[color:var(--color-primary)]" />
        <span class="text-sm text-blue-800 font-bold">
          {{ $t("shared.catalog.product_details.price_block.print_button") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from "@/core/api/graphql/types";
import { PropType } from "vue";
import { useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddToWishlistsDialog } from "@/shared/wishlists";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const { isAuthenticated } = useUser();
const { openPopup } = usePopup();

function addToList() {
  if (!isAuthenticated.value) return;

  openPopup({
    component: AddToWishlistsDialog,
    props: {
      product: props.product,
    },
  });
}

function print() {
  window.print();
}
</script>
