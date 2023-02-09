<template>
  <!-- Order Details -->
  <div v-if="order">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <!-- Title block -->
    <div class="flex flex-col gap-2.5 lg:flex-row lg:justify-between">
      <VcTypography tag="h1" variant="h2" weight="bold">
        {{ $t("pages.account.order_details.title", [order?.number]) }}
      </VcTypography>

      <div class="flex flex-wrap gap-3">
        <!-- US-3534 -->
        <!-- <VcButton class="uppercase px-3 min-w-[8.5rem]" is-outline>
          <VcIcon size="sm" name="printer" class="mr-2" />
          <span>{{ $t("common.buttons.print_order") }}</span>
        </VcButton> -->

        <VcButton
          v-if="showReorderButton"
          :is-waiting="loadingAddItemsToCart"
          class="uppercase px-3 min-w-[8.5rem]"
          @click="reorderItems"
        >
          {{ $t("common.buttons.reorder_all") }}
        </VcButton>
      </div>
    </div>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <VcSectionWidget :title="$t('shared.cart.products_section.title')" icon="cube" hide-desktop-title>
        <!-- Items grouped by Vendor -->
        <div v-if="$cfg.line_items_group_by_vendor_enabled" class="space-y-8">
          <template v-for="(group, vendorId) in orderItemsGroupedByVendor" :key="vendorId">
            <div v-if="group.items.length" class="space-y-3">
              <!-- Vendor -->
              <div class="flex flex-wrap gap-x-3 max-w-full">
                <VcVendor :vendor="group.vendor" />
                <VcRating v-if="$cfg.rating_enabled && group.vendor?.rating" :rating="group.vendor.rating" />
              </div>

              <OrderLineItems :items="group.items" />
            </div>
          </template>
        </div>

        <OrderLineItems v-else :items="orderItems" />
      </VcSectionWidget>

      <!-- Gifts section -->
      <AcceptedGifts :items="giftItems" />

      <!-- Order comment section -->
      <VcSectionWidget
        v-if="order.comment"
        :title="$t('common.titles.order_comment')"
        icon="document-text"
        class="order-last"
      >
        <p v-for="line in order?.comment?.split('\n')" :key="line" class="break-words text-15">{{ line }}</p>
      </VcSectionWidget>

      <template #sidebar>
        <!-- Order Data Widget -->
        <VcCardWidget :title="$t('common.titles.order_data')" class="order-first" hide-mobile-title>
          <div class="flex flex-col gap-1.5 text-15">
            <p v-if="order.createdDate">
              <span class="font-extrabold"> {{ $t("common.labels.creates") }}: </span>
              {{ $d(order.createdDate, "long") }}
            </p>
            <p v-if="order.status" class="flex items-center">
              <span class="font-extrabold mr-2"> {{ $t("common.labels.status") }}: </span>
              <TableStatusBadge :status="order.status" />
            </p>
          </div>
        </VcCardWidget>

        <!-- Order summary -->
        <OrderSummary :cart="order" class="order-last">
          <template #footer>
            <VcButton
              v-if="showPaymentButton"
              class="uppercase w-full mt-4"
              @click="$router.push({ name: 'OrderPayment', params: { orderId } })"
            >
              {{ $t("common.buttons.pay_now") }}
            </VcButton>
          </template>
        </OrderSummary>

        <!-- Billing Address Widget -->
        <VcCardWidget v-if="billingAddress" :title="$t('common.titles.billing_address')" icon="truck">
          <VcAddressInfo :address="billingAddress" class="text-15" />
        </VcCardWidget>

        <!-- Shipping Method Card -->
        <VcCardWidget v-if="shipment" :title="$t('common.titles.shipping_method')" icon="truck">
          <div class="flex items-center gap-4 text-15">
            <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />

            <span class="min-w-0 break-words">
              {{ shipment.shipmentMethodCode }} {{ shipment.shipmentMethodOption }} ({{
                shipment.price?.formattedAmount
              }})
            </span>
          </div>
        </VcCardWidget>

        <!-- Shipping Address Card -->
        <VcCardWidget v-if="deliveryAddress" :title="$t('common.titles.shipping_address')" icon="truck">
          <VcAddressInfo :address="deliveryAddress" class="text-15" />
        </VcCardWidget>

        <!-- Payment Details Card -->
        <VcCardWidget v-if="payment" :title="$t('common.titles.payment_details')" icon="truck">
          <div class="space-y-1.5 text-15">
            <p>
              <span class="font-extrabold">{{ $t("common.labels.payment_number") }}:</span>
              {{ payment.number }}
            </p>

            <p class="break-words">
              <span class="font-extrabold">{{ $t("common.labels.payment_type") }}:</span>
              {{ payment.gatewayCode }}
            </p>
          </div>

          <div class="mt-3">
            <VcButton class="px-2 py-1 uppercase !text-xs !h-auto" is-outline is-disabled>
              {{ $t("common.buttons.view_invoice") }}
            </VcButton>
          </div>
        </VcCardWidget>

        <!-- Payment Method section -->
        <VcCardWidget v-if="payment?.paymentMethod" :title="$t('common.titles.payment_method')" icon="document-text">
          <div class="flex items-center gap-4 text-15">
            <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
            <span class="min-w-0 break-words">{{ payment.paymentMethod.typeName }}</span>
          </div>
        </VcCardWidget>
      </template>
    </VcLayoutWithRightSidebar>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useBreadcrumbs, usePageHead } from "@/core";
import { InputNewBulkItemType } from "@/xapi";
import { AcceptedGifts, OrderSummary } from "@/shared/checkout";
import { BackButtonInHeader } from "@/shared/layout";
import { useUserOrder, OrderLineItems } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddBulkItemsToCartResultsModal, getItemsForAddBulkItemsToCartResultsPopup, useCart } from "@/shared/cart";

const props = defineProps({
  orderId: {
    type: String,
    default: "",
  },
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const {
  order,
  giftItems,
  orderItems,
  orderItemsGroupedByVendor,
  deliveryAddress,
  billingAddress,
  shipment,
  payment,
  fetchOrder,
  clearOrder,
} = useUserOrder();
const { addBulkItemsToCart } = useCart();
const { openPopup } = usePopup();
const { t } = useI18n();

usePageHead({
  title: computed(() => t("pages.account.order_details.meta.title", [order.value?.number])),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  { title: t("pages.account.order_details.title", [order.value?.number]) },
]);

const isMobile = breakpoints.smaller("lg");
const loadingAddItemsToCart = ref(false);

const showPaymentButton = computed<boolean>(() => !!order.value && order.value.status === "New");
const showReorderButton = computed<boolean>(() => !!order.value && order.value.status === "Completed");

async function reorderItems() {
  const items = order.value!.items!.filter((item) => !item.isGift);
  const inputBulkItems = items.map<InputNewBulkItemType>((item) => ({ productSku: item.sku, quantity: item.quantity }));

  loadingAddItemsToCart.value = true;

  const resultItems = await addBulkItemsToCart(inputBulkItems);

  openPopup({
    component: AddBulkItemsToCartResultsModal,
    props: {
      items: getItemsForAddBulkItemsToCartResultsPopup(items, resultItems),
    },
  });

  loadingAddItemsToCart.value = false;
}

watchEffect(() => {
  clearOrder();
  fetchOrder({ id: props.orderId });
});
</script>
