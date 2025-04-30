<template>
  <VcWidget :title="$t(`shared.catalog.product_details.price_block.title`)">
    <slot />

    <template #footer-container>
      <div class="flex select-none divide-x print:hidden">
        <AddToList class="w-1/5 hover:bg-neutral-50" :product="product" :icon-size="20" />

        <AddToCompareCatalog class="w-1/5 hover:bg-neutral-50" :product="product" :icon-size="20" />

        <VcPopover class="w-1/5" y-offset="20" trigger="click" z-index="3" @toggle="handleShareProductPopoverToggle">
          <template #trigger>
            <div class="flex cursor-pointer items-center justify-center px-2 py-4 hover:bg-neutral-50">
              <VcIcon
                name="share"
                size="sm"
                :aria-label="$t('common.buttons.share')"
                :class="{
                  'fill-primary': !shareProductPopoverShown,
                  'fill-neutral-400': shareProductPopoverShown,
                }"
              />
            </div>
          </template>

          <template #content="{ close }">
            <div class="rounded border bg-additional-50 p-5 shadow-lg">
              <h3 class="flex justify-between text-lg font-bold">
                <span class="flex grow">
                  {{ $t("shared.catalog.product_details.share_product_label") }}
                </span>

                <button class="-me-1 flex p-1 text-danger-400 hover:text-danger-700" type="button" @click="close()">
                  <VcIcon name="delete-thin" size="sm" />
                </button>
              </h3>

              <div class="mt-5 flex items-center space-x-6">
                <a
                  v-for="socialSharingService in $cfg.social_sharing_services"
                  :key="socialSharingService.name"
                  target="_blank"
                  :href="getProductSocialShareUrl(socialSharingService.url_template, pageUrl)"
                  :aria-label="`Share via ${socialSharingService.name}`"
                >
                  <VcImage
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

        <AddToHistoryV2 :product="product" />

        <button
          :aria-label="$t('common.buttons.print')"
          class="flex w-1/5 cursor-pointer items-center justify-center px-2 py-4 hover:bg-neutral-50"
          type="button"
          @click="print()"
        >
          <VcIcon name="printer" size="sm" class="fill-primary" />
        </button>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { stringFormat } from "@/core/utilities";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import { VcIcon } from "@/ui-kit/components";
import type { Product } from "@/core/api/graphql/types";
import AddToHistoryV2 from "@/modules/price-history/components/add-to-history-v2.vue";

interface IProps {
  product: Product;
}

defineProps<IProps>();

const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);

const divUnderSharedPopover = shallowRef<HTMLElement | null>(null);

const isMobile = breakpoints.smaller("lg");

const pageUrl = computed(() => location.origin + route.path);
const shareProductPopoverShown = ref(false);

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
