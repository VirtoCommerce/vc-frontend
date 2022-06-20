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
        class="flex items-center justify-center select-none py-4 px-1 border-r space-x-2 w-2/5"
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

      <div class="flex w-3/5">
        <div class="w-1/3">
          <VcPopover :title="$t('shared.catalog.product_details.share_product_label')" :showCloseButton="true">
            <template #trigger>
              <div
                class="items-center justify-center select-none py-4 px-1 border-r space-x-2 cursor-pointer hover:bg-gray-100"
              >
                <i class="fas fa-share-square fa-xl text-[color:var(--color-primary)]" />
              </div>
            </template>
            <template #content>
              <div class="flex justify-between items-center px-5 mt-1.5 mb-7 space-x-6">
                <a
                  class=""
                  :href="getProductSocialShareUrl(socialSharingService.url_template, pageUrl)"
                  v-for="socialSharingService in $cfg.social_sharing_services"
                  :key="socialSharingService.name"
                >
                  <img class="rounded-sm" width="40" height="40" :src="socialSharingService.icon" />
                </a>
              </div>
            </template>
          </VcPopover>
        </div>

        <div class="w-1/3">
          <div class="items-center justify-center select-none py-4 px-1 border-r space-x-2 hover:bg-gray-100">
            <i class="fas fa-envelope fa-xl text-gray-400" />
          </div>
        </div>

        <div class="w-1/3">
          <div
            class="items-center justify-center flex-1 select-none py-4 px-1 space-x-2 cursor-pointer hover:bg-gray-100"
            @click="print()"
          >
            <i class="fas fa-print text-[color:var(--color-primary)]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Product } from "@/xapi/graphql/types";
import { PropType } from "vue";
import { useUser } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddToWishlistsDialog } from "@/shared/wishlists";
import { VcPopover } from "@/ui-kit/components";
import { stringFormat } from "@core/utilities";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

const { isAuthenticated } = useUser();
const { openPopup } = usePopup();

const pageUrl: string = location.href;

function addToList() {
  if (!isAuthenticated.value) {
    return;
  }

  openPopup({
    component: AddToWishlistsDialog,
    props: {
      product: props.product,
    },
  });
}

function getProductSocialShareUrl(urlTemplate: string, url: string): string {
  return stringFormat(urlTemplate, url);
}

function print() {
  window.print();
}
</script>
