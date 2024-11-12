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
                  'text-primary': !shareProductPopoverShown,
                  'text-neutral-400': shareProductPopoverShown,
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

        <a
          :href="mailToLink"
          :aria-label="$t('common.buttons.send_link_email')"
          target="_blank"
          class="flex w-1/5 cursor-pointer items-center justify-center px-2 py-4 hover:bg-neutral-50"
        >
          <VcIcon name="mail" size="sm" class="text-primary" />
        </a>

        <button
          :aria-label="$t('common.buttons.print')"
          class="flex w-1/5 cursor-pointer items-center justify-center px-2 py-4 hover:bg-neutral-50"
          type="button"
          @click="print()"
        >
          <VcIcon name="printer" size="sm" class="text-primary" />
        </button>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { stringFormat } from "@/core/utilities";
import { AddToCompareCatalog } from "@/shared/compare";
import { AddToList } from "@/shared/wishlists";
import { VcIcon } from "@/ui-kit/components";
import type { Product } from "@/core/api/graphql/types";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();

const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { t } = useI18n();

const divUnderSharedPopover = shallowRef<HTMLElement | null>(null);

const isMobile = breakpoints.smaller("lg");

const pageUrl = computed(() => location.origin + route.fullPath);
const shareProductPopoverShown = ref(false);

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
    divUnderSharedPopover.value.scrollIntoView({ behavior: "smooth" });
  }
}
</script>
