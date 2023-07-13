<template>
  <div class="divide-y rounded border bg-white shadow-sm print:shadow-none">
    <div class="px-5 py-4 md:px-7">
      <h2 class="text-xl font-extrabold uppercase">
        {{ $t("shared.catalog.product_details.price_block.title") }}
      </h2>
    </div>

    <div class="px-5 py-8 md:px-7 md:py-5">
      <slot />
    </div>

    <div class="flex print:hidden">
      <div
        class="flex w-2/5 select-none items-center justify-center space-x-2 border-r px-1 py-4"
        :class="{ 'cursor-pointer hover:bg-gray-100': isAuthenticated }"
        :title="!isAuthenticated ? $t('common.messages.wishlists_available_for_authorized') : undefined"
        @click="openAddToListModal"
      >
        <svg
          height="16"
          width="16"
          name="icon"
          :class="isAuthenticated ? 'text-[color:var(--color-primary)]' : 'text-gray-400'"
        >
          <use href="/static/images/common/favorities.svg#main"></use>
        </svg>
        <span :class="isAuthenticated ? 'text-[color:var(--color-link)]' : 'text-gray-400'" class="text-sm font-bold">
          {{ $t("shared.catalog.product_details.price_block.add_to_list_button") }}
        </span>
      </div>

      <div class="flex w-3/5">
        <div class="w-1/3">
          <VcPopover
            :title="$t('shared.catalog.product_details.share_product_label')"
            show-close-button
            @toggle="handleShareProductPopoverToggle"
          >
            <template #trigger>
              <div
                class="flex cursor-pointer select-none items-center justify-center space-x-2 border-r px-1 py-4 hover:bg-gray-100"
              >
                <i
                  class="fas fa-share-square text-base"
                  :class="{
                    'text-[color:var(--color-primary)]': !shareProductPopoverShown,
                    'text-gray-400': shareProductPopoverShown,
                  }"
                />
              </div>
            </template>
            <template #content>
              <div class="mb-7 mt-1.5 flex items-center justify-between space-x-6 px-5">
                <a
                  v-for="socialSharingService in $cfg.social_sharing_services"
                  :key="socialSharingService.name"
                  target="_blank"
                  :href="getProductSocialShareUrl(socialSharingService.url_template, pageUrl)"
                >
                  <img
                    class="rounded-sm"
                    width="40"
                    height="40"
                    :src="socialSharingService.icon"
                    :alt="socialSharingService.name"
                  />
                </a>
              </div>
            </template>
          </VcPopover>
        </div>

        <div class="w-1/3">
          <a
            :href="mailToLink"
            target="_blank"
            class="flex cursor-pointer select-none items-center justify-center border-r px-1 py-4 hover:bg-gray-100"
          >
            <i class="fas fa-envelope text-base text-[color:var(--color-primary)]" />
          </a>
        </div>

        <div class="w-1/3">
          <div
            class="flex flex-1 cursor-pointer select-none items-center justify-center px-1 py-4 hover:bg-gray-100"
            @click="print()"
          >
            <i class="fas fa-print text-base text-[color:var(--color-primary)]" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- free area for popover on mobile -->
  <div v-show="isMobile" ref="divUnderSharedPopover" class="h-10"></div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { stringFormat } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { productsInWishlistEvent, useBroadcast } from "@/shared/broadcast";
import { usePopup } from "@/shared/popup";
import { AddToWishlistsModal } from "@/shared/wishlists";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

const route = useRoute();

const breakpoints = useBreakpoints(breakpointsTailwind);
const broadcast = useBroadcast();
const { t } = useI18n();

const divUnderSharedPopover = shallowRef<HTMLElement | null>(null);

const isMobile = breakpoints.smaller("lg");

const { isAuthenticated } = useUser();
const { openPopup } = usePopup();

const pageUrl = computed(() => location.origin + route.fullPath);
const shareProductPopoverShown = ref(false);

function openAddToListModal() {
  if (!isAuthenticated.value) {
    return;
  }

  openPopup({
    component: AddToWishlistsModal,
    props: {
      product: props.product,
      onResult: (inWishlist: boolean) => {
        broadcast.emit(productsInWishlistEvent, [{ inWishlist, productId: props.product.id }], true);
      },
    },
  });
}

const mailToLink = computed(
  () =>
    `mailto:?subject=${encodeURIComponent(
      t("shared.catalog.product_details.price_block.product_email_title", [props.product?.name])
    )}&body=${encodeURIComponent(pageUrl.value)}`
);

function getProductSocialShareUrl(urlTemplate: string, url: string): string {
  return stringFormat(urlTemplate, url);
}

function print() {
  window.print();
}

function handleShareProductPopoverToggle(isShown: boolean): void {
  shareProductPopoverShown.value = isShown;

  if (isMobile.value && isShown && divUnderSharedPopover.value) {
    divUnderSharedPopover.value.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  }
}
</script>
