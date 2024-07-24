<template>
  <VcLoaderOverlay v-if="loading" no-bg />

  <VcContainer v-else class="relative z-0">
    <VcBreadcrumbs :items="breadcrumbs" class="max-lg:hidden" />

    <VcTypography tag="h1" class="mb-5"
      >{{ $t("pages.purchase_request.title") }} {{ result?.purchaseRequest?.number }}</VcTypography
    >
    <VcLayoutWithRightSidebar v-if="cart" is-sidebar-sticky>
      <ProductsSection
        :grouped="!!$cfg.line_items_group_by_vendor_enabled"
        :items="cart.items"
        :items-grouped-by-vendor="lineItemsGroupedByVendor"
        :selected-item-ids="selectedItemIds"
        :validation-errors="cart.validationErrors"
        @change:item-quantity="changeItemQuantity($event.itemId, $event.quantity)"
      />

      <template #sidebar>
        <OrderSummary :cart="cart" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
        </OrderSummary>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>
</template>

<script setup lang="ts">
import { toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useGetPurchaseRequestQuery } from "@/core/api/graphql/purchase-request/queries/getPurchaseRequest";
import { useBreadcrumbs } from "@/core/composables";
import { useFullCart } from "@/shared/cart/composables/useCart";
import ProductsSection from "@/shared/cart/components/products-section.vue";
import OrderSummary from "@/shared/checkout/components/order-summary.vue";

interface IProps {
  id: string;
}

const props = defineProps<IProps>();

const propsRef = toRef(props);

const { t } = useI18n();
const breadcrumbs = useBreadcrumbs([{ title: t("pages.bulk_order.title") }]);

const { result } = useGetPurchaseRequestQuery(propsRef);
const {
  cart,
  loading,
  lineItemsGroupedByVendor,
  selectedItemIds,
  changeItemQuantity,
  selectedLineItems,
  allItemsAreDigital,
  forceFetch,
} = useFullCart();
watch(result, async () => {
  if (result.value?.purchaseRequest) {
    await forceFetch({
      cartName: result.value.purchaseRequest.number,
      cartType: "purchaseRequest",
    });
  }
});
</script>
