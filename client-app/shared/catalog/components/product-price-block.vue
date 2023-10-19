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
      <button
        :class="[
          'flex h-14 w-2/5 select-none items-center justify-center border-r p-2',
          { 'hover:bg-gray-100': isAuthenticated },
        ]"
        type="button"
        :disabled="!isAuthenticated"
        :title="!isAuthenticated ? $t('common.messages.wishlists_available_for_authorized') : undefined"
        @click="openAddToListModal"
      >
        <VcIcon
          name="whishlist"
          :size="16"
          :class="{
            'text-[--color-primary-500]': isAuthenticated,
            'text-[--color-neutral-400]': !isAuthenticated,
          }"
        />

        <span
          :class="[
            'ms-2 text-sm font-bold',
            {
              'text-[--color-accent-600]': isAuthenticated,
              'text-[--color-neutral-400]': !isAuthenticated,
            },
          ]"
        >
          {{ $t("shared.catalog.product_details.price_block.add_to_list_button") }}
        </span>
      </button>

      <div class="flex w-3/5">
        <div class="w-1/3">
          <VcPopover y-offset="20" trigger="click" @toggle="handleShareProductPopoverToggle">
            <template #trigger>
              <div
                class="flex h-14 cursor-pointer select-none items-center justify-center space-x-2 border-r p-2 hover:bg-gray-100"
              >
                <VcIcon
                  name="share"
                  :size="18"
                  :class="{
                    'text-[--color-primary-500]': !shareProductPopoverShown,
                    'text-[--color-neutral-400]': shareProductPopoverShown,
                  }"
                />
              </div>
            </template>

            <template #content="{ close }">
              <div
                class="rounded border bg-white p-5 shadow-lg before:absolute before:-top-2 before:left-[calc(50%-0.5rem)] before:h-4 before:w-4 before:rotate-45 before:border-l before:border-t before:bg-inherit"
              >
                <h3 class="flex justify-between text-lg font-bold">
                  <span class="flex grow">
                    {{ $t("shared.catalog.product_details.share_product_label") }}
                  </span>

                  <button
                    class="-me-1 flex p-1 text-[--color-danger-400] hover:text-[--color-danger-700]"
                    type="button"
                    @click="close()"
                  >
                    <VcIcon name="x" size="sm" />
                  </button>
                </h3>

                <div class="mt-5 flex items-center space-x-6">
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
              </div>
            </template>
          </VcPopover>
        </div>

        <div class="w-1/3">
          <a
            :href="mailToLink"
            target="_blank"
            class="flex h-14 cursor-pointer select-none items-center justify-center border-r p-2 hover:bg-gray-100"
          >
            <VcIcon name="mail" :size="18" class="text-[--color-primary-500]" />
          </a>
        </div>

        <div class="w-1/3">
          <button
            class="flex h-14 w-full cursor-pointer select-none items-center justify-center p-2 hover:bg-gray-100"
            type="button"
            @click="print()"
          >
            <VcIcon name="printer" :size="18" class="text-[--color-primary-500]" />
          </button>
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
import { productsInWishlistEvent, TabsType, useBroadcast } from "@/shared/broadcast";
import { usePopup } from "@/shared/popup";
import { AddToWishlistsModal } from "@/shared/wishlists";
import { VcIcon } from "@/ui-kit/components";
import type { Product } from "@/core/api/graphql/types";
import type { PropType } from "vue";

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});

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
        broadcast.emit(productsInWishlistEvent, [{ inWishlist, productId: props.product.id }], TabsType.ALL);
      },
    },
  });
}

const mailToLink = computed(
  () =>
    `mailto:?subject=${encodeURIComponent(
      t("shared.catalog.product_details.price_block.product_email_title", [props.product?.name]),
    )}&body=${encodeURIComponent(pageUrl.value)}`,
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
