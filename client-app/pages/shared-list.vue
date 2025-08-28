<template>
  <VcContainer class="relative max-lg:pb-12">
    <VcTypography
      v-if="list?.name"
      tag="h1"
      class="mb-5"
    >
      {{ list.name }}
    </VcTypography>

    <div
      ref="listElement"
      class="mt-5 w-full"
    >
      <!-- Skeletons -->
      <template v-if="listLoading">
        <div
          v-if="isMobile"
          class="grid grid-cols-2 gap-x-4 gap-y-6"
        >
          <ProductSkeletonGrid
            v-for="i in actualPageRowsCount"
            :key="i"
          />
        </div>

        <div
          v-else
          class="flex flex-col rounded border bg-additional-50 shadow-sm"
        >
          <WishlistProductItemSkeleton
            v-for="i in actualPageRowsCount"
            :key="i"
            class="even:bg-neutral-50"
          />
        </div>
      </template>

      <!-- List details -->
      <template v-else-if="!listLoading && !!list?.items?.length">
        <VcWidget size="lg">
          <div class="flex flex-col gap-6">
            <WishlistLineItems
              :items="pagedListItems"
              :pending-items="pendingItems"
              :editable="false"
              @link-click="selectItemEvent"
            />

            <p
              v-if="page >= PAGE_LIMIT"
              class="my-3 text-center"
            >{{ $t("ui_kit.reach_limit.page_limit") }}</p>

            <VcPagination
              v-if="pagesCount > 1"
              v-model:page="page"
              :pages="Math.min(pagesCount, PAGE_LIMIT)"
              :scroll-target="listElement"
              :scroll-offset="60"
            />
          </div>
        </VcWidget>
      </template>

      <!-- Empty list -->
      <VcEmptyView
        v-else-if="!listLoading && list?.items?.length === 0"
        :text="$t('shared.wishlists.list_details.empty_list')"
        icon="outline-lists"
      >
        <template #button>
          <VcButton
            v-if="!!continue_shopping_link"
            :external-link="continue_shopping_link"
          >
            {{ $t("shared.wishlists.list_details.empty_list_button") }}
          </VcButton>

          <VcButton
            v-else
            to="/"
          >
            {{ $t("shared.wishlists.list_details.empty_list_button") }}
          </VcButton>
        </template>
      </VcEmptyView>

      <Error404 v-else-if="!listLoading && !list" />
    </div>
  </VcContainer>
</template>

<script
  setup
  lang="ts"
>
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { cloneDeep, keyBy } from "lodash";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useAnalytics, usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { PAGE_LIMIT } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { prepareLineItem } from "@/core/utilities";
import { useShortCart } from "@/shared/cart";
import {
  useWishlists,
  WishlistLineItems,
  WishlistProductItemSkeleton,
} from "@/shared/wishlists";
import type { LineItemType, Product } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

interface IProps {
  sharingKey: string;
}

const props = defineProps<IProps>();

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);
const { analytics } = useAnalytics();
const { t } = useI18n();
const { listLoading, list, fetchSharedWishList } = useWishlists();
const {
  cart, 
} = useShortCart(); 

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});
const breakpoints = useBreakpoints(breakpointsTailwind);

usePageHead({
  title: computed(() => t("pages.account.list_details.meta.title", [list.value?.name])),
});

const wishlistListProperties = computed(() => ({
  item_list_id: "wishlist",
  item_list_name: `Wishlist "${list.value?.name}"`,
  related_id: list.value?.id,
  related_type: "wishlist",
}));
const isMobile = breakpoints.smaller("lg"); 

const listElement = ref<HTMLElement | undefined>();
const pendingItems = ref<Record<string, boolean>>({});
const itemsPerPage = ref(6);
const page = ref(1);
const wishlistItems = ref<LineItemType[]>([]);
const cartItemsBySkus = computed(() => keyBy(cart.value?.items, "sku"));
const preparedLineItems = computed<PreparedLineItemType[]>(() =>
  wishlistItems.value.map((item) => prepareLineItem(item, cartItemsBySkus.value[item.sku]?.quantity)),
);
const pagesCount = computed<number>(() => Math.ceil((wishlistItems.value.length ?? 0) / itemsPerPage.value));
const pagedListItems = computed<PreparedLineItemType[]>(() =>
  preparedLineItems.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);
const actualPageRowsCount = computed<number>(() => pagedListItems.value.length || itemsPerPage.value);
 
function selectItemEvent(item: Product | undefined): void {
  if (!item) {
    return;
  }

  analytics("selectItem", item, wishlistListProperties.value);
}  

watchEffect(async () => {
  await fetchSharedWishList(props.sharingKey);
  page.value = 1;
  wishlistItems.value = cloneDeep(list.value?.items) ?? [];
});

/**
 * Send Google Analytics event for related products.
 */
watchEffect(() => {
  const items = list.value?.items
    ?.map((item) => item.product!)
    // filtering of deleted products
    .filter(Boolean);

  if (items?.length) {
    analytics("viewItemList", items, wishlistListProperties.value);
  }
});
</script>
