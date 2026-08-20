<template>
  <div class="customer-order-details">
    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block print:hidden" />

    <VcEmptyView v-if="notFound" :text="t('sales_rep.customer_orders.order_not_found')" icon="outline-404">
      <template #button>
        <VcButton :to="ordersRoute" prepend-icon="arrow-left">
          {{ t("sales_rep.customer_orders.back_to_orders") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <template v-else-if="order">
      <div class="flex flex-col gap-2.5 lg:flex-row lg:justify-between">
        <VcTypography tag="h1">
          {{ t("pages.account.order_details.title", [order.number]) }}
        </VcTypography>

        <!-- Read-only: the Sales Rep endpoint exposes no order mutations, so printing is the only action. -->
        <div class="flex flex-wrap gap-3 print:hidden">
          <VcButton variant="outline" prepend-icon="printer" @click="print()">
            {{ t("common.buttons.print_order") }}
          </VcButton>
        </div>
      </div>

      <VcLayout sidebar-position="right" sticky>
        <VcWidget id="line-items-widget" size="lg" class="print:break-inside-auto">
          <!-- Items grouped by Vendor -->
          <div v-if="$cfg.line_items_group_by_vendor_enabled" class="space-y-5 md:space-y-7">
            <template v-for="(group, vendorId) in orderItemsGroupedByVendor" :key="vendorId">
              <div v-if="group.items.length" class="space-y-3">
                <div class="flex max-w-full gap-2 max-xs:flex-col">
                  <VendorName :name="group.vendor?.name" class="min-w-0" />

                  <VcRating
                    v-if="$cfg.vendor_rating_enabled && group.vendor?.rating"
                    :review-count="group.vendor.rating.reviewCount"
                    :value="group.vendor.rating.value"
                    size="xs"
                  />
                </div>

                <OrderLineItems :items="group.items" />
              </div>
            </template>
          </div>

          <OrderLineItems v-else :items="mainCurrencyOrderItems" />

          <template v-for="group in otherCurrencyOrderItemGroups" :key="group.currencyCode">
            <div v-if="group.items.length" class="mt-5 space-y-3">
              <h4 class="text-lg font-black">
                {{ t("common.labels.products_in_currency", { currency: group.currencyCode }) }}
              </h4>

              <OrderLineItems :items="group.items" :subtotal-currency-code="group.currencyCode" />
            </div>
          </template>
        </VcWidget>

        <AcceptedGifts v-if="giftItems.length" :items="giftItems" class="mt-5" />

        <OrderCommentSection v-if="order.comment" :comment="order.comment" readonly class="mt-5" />

        <template #sidebar>
          <VcWidget id="order-data-widget" :title="t('common.titles.order_data')" class="order-first mb-5">
            <div class="flex flex-col gap-1.5 text-sm">
              <div v-if="order.createdDate">
                <span class="font-black"> {{ t("common.labels.created") }}: </span>
                {{ $d(order.createdDate) }}
              </div>

              <div v-if="customerName">
                <span class="font-black"> {{ t("sales_rep.orders.customer") }}: </span>
                {{ customerName }}
              </div>

              <div v-if="order.status" class="flex items-center gap-2">
                <span class="font-black"> {{ t("common.labels.status") }}: </span>

                <OrderStatus size="sm" :status="order.status" :display-value="order.statusDisplayValue" />
              </div>

              <VcAlert
                v-if="order.cancelReason"
                class="mt-2.5"
                :color="isCancelled ? 'danger' : 'warning'"
                icon="exclamation-circle"
                variant="outline-dark"
              >
                {{ order.cancelReason }}
              </VcAlert>
            </div>
          </VcWidget>

          <div class="space-y-5">
            <OrderSummary
              :cart="order"
              :no-shipping="allItemsAreDigital"
              class="order-last print:order-none print:break-after-page"
            />

            <VcWidget v-if="billingAddress" :title="t('common.titles.billing_address')">
              <AddressInfo :address="billingAddress" class="text-base" />
            </VcWidget>

            <VcWidget v-if="!allItemsAreDigital && shipment" :title="t('common.titles.shipping_method')">
              <div class="flex items-center gap-4 text-base">
                <VcImage
                  :alt="shipmentMethodName"
                  :src="shipment.shippingMethod?.logoUrl"
                  class="size-12 print:hidden"
                  lazy
                />

                <span class="min-w-0 break-words">
                  {{ shipmentMethodName }}
                  ({{ shipment.price?.formattedAmount }})
                </span>
              </div>
            </VcWidget>

            <VcWidget v-if="!allItemsAreDigital && deliveryAddress" :title="shipToTitle">
              <AddressInfo :address="deliveryAddress" class="text-base" />
            </VcWidget>

            <VcWidget v-if="payment?.paymentMethod" :title="t('common.titles.payment_method')">
              <div class="flex items-center gap-4 text-base">
                <VcImage
                  :alt="paymentMethodName"
                  :src="payment.paymentMethod.logoUrl"
                  class="size-12 print:hidden"
                  lazy
                />

                <span class="min-w-0 break-words">
                  {{ paymentMethodName }}
                </span>
              </div>
            </VcWidget>
          </div>
        </template>
      </VcLayout>
    </template>

    <VcLoaderOverlay v-else no-bg />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { OrderStatusCode } from "@/core/constants/order-status";
import { OrderLineItems, OrderStatus } from "@/shared/account";
import { AcceptedGifts, OrderCommentSection, OrderSummary } from "@/shared/checkout";
import { BOPIS_CODE } from "@/shared/checkout/composables/useBopis";
import { AddressInfo, VendorName } from "@/shared/common";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import { useSalesRepCustomerOrder } from "../composables/useSalesRepCustomerOrder";
import { CUSTOMER_ORDERS_ROUTE_NAME, CUSTOMER_PROFILE_ROUTE_NAME, MY_CUSTOMERS_ROUTE_NAME } from "../constants";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  organizationId: string;
  orderId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const {
  order,
  notFound,
  giftItems,
  mainCurrencyOrderItems,
  otherCurrencyOrderItemGroups,
  orderItemsGroupedByVendor,
  deliveryAddress,
  billingAddress,
  shipment,
  payment,
  allItemsAreDigital,
} = useSalesRepCustomerOrder(() => props.orderId);

const { customer } = useSalesRepCustomer(() => props.organizationId);

const customerName = computed(() => customer.value?.organizationName ?? "");

const isCancelled = computed(
  () => String(order.value?.status).toLowerCase() === String(OrderStatusCode.CANCELLED).toLowerCase(),
);

const shipmentMethodName = computed<string>(() =>
  t(`common.methods.delivery_by_id.${shipment.value?.shipmentMethodCode}_${shipment.value?.shipmentMethodOption}`),
);
const paymentMethodName = computed(() => payment.value?.paymentMethod?.name);

const shipToTitle = computed(() =>
  shipment.value?.shipmentMethodCode === BOPIS_CODE
    ? t("pages.account.order_details.bopis.pickup_address")
    : t("common.titles.shipping_address"),
);

const ordersRoute = computed<RouteLocationRaw>(() => ({
  name: CUSTOMER_ORDERS_ROUTE_NAME,
  params: { organizationId: props.organizationId },
}));

function print() {
  window.print();
}

usePageHead({
  title: computed(() => t("pages.account.order_details.meta.title", [order.value?.number])),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("sales_rep.hub.title") },
  { title: t("sales_rep.my_customers.page.title"), route: { name: MY_CUSTOMERS_ROUTE_NAME } },
  {
    title: customerName.value,
    route: { name: CUSTOMER_PROFILE_ROUTE_NAME, params: { organizationId: props.organizationId } },
  },
  { title: t("sales_rep.customer_orders.breadcrumb"), route: ordersRoute.value },
  { title: t("pages.account.order_details.title", [order.value?.number]) },
]);
</script>

<style scoped lang="scss">
@media print {
  #order-data-widget,
  #line-items-widget {
    :deep(.vc-widget__header-container) {
      @apply hidden;
    }
  }
}
</style>
