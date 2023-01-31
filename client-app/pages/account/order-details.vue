<template>
  <!-- Order Details -->
  <div v-if="order">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex flex-col gap-1.5 justify-between sm:flex-row">
      <VcTypography tag="h1" variant="h2" weight="bold">
        {{ $t("pages.account.order_details.title", [order?.number]) }}
      </VcTypography>
      <div class="flex justify-between gap-x-5">
        <!-- US-3534 -->
        <!-- <VcButton class="!hidden lg:!inline-flex uppercase px-3" is-outline>
          <VcIcon size="sm" name="printer" class="mr-2" />
          <span>{{ $t("pages.account.order_details.print_order_button") }}</span>
        </VcButton> -->
        <VcButton
          v-if="showReorderButton"
          :is-waiting="loadingAddItemsToCart"
          class="uppercase flex-1 w-full px-4"
          @click="reorderItems"
        >
          {{ $t("pages.account.order_details.reorder_all_button") }}
        </VcButton>
      </div>
    </div>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <!-- Items grouped by Vendor -->
      <VcSectionWidget v-if="$cfg.line_items_group_by_vendor_enabled">
        <div class="space-y-8">
          <template v-for="(group, vendorId) in orderItemsGroupedByVendor" :key="vendorId">
            <div v-if="group.items.length">
              <!-- Vendor -->
              <VcVendor v-if="group.vendor" :vendor="group.vendor" class="pb-3"></VcVendor>
              <OrderLineItems :items="group.items" />
            </div>
          </template>
        </div>
      </VcSectionWidget>

      <!-- Items not grouped by Vendor -->
      <VcSectionWidget v-else>
        <OrderLineItems :items="orderItems" />
      </VcSectionWidget>

      <!-- Gifts section -->
      <AcceptedGifts :items="giftItems" />

      <!-- Order comment section -->
      <VcSectionWidget
        v-if="order?.comment"
        :title="$t('pages.account.order_details.order_comment_section.title')"
        icon="document-text"
        class="order-last"
      >
        <p class="break-words text-15" v-for="line in order?.comment?.split('\n')" :key="line">{{ line }}</p>
      </VcSectionWidget>

      <template #sidebar>
        <!-- Order Data Widget -->
        <VcCardWidget :title="$t('pages.account.order_details.order_data_card.title')" class="order-first">
          <div class="flex flex-col space-y-1.5 text-15">
            <p v-if="order.createdDate">
              <span class="font-extrabold">
                {{ $t("pages.account.order_details.order_data_card.creates_label") }}
              </span>
              {{ $d(order.createdDate, "long") }}
            </p>
            <p class="flex items-center" v-if="order.status">
              <span class="font-extrabold mr-2">
                {{ $t("pages.account.order_details.order_data_card.status_label") }}
              </span>
              <TableStatusBadge :status="order.status" />
            </p>
          </div>
        </VcCardWidget>

        <!-- Order summary -->
        <OrderSummary v-if="order" :cart="order" class="order-last">
          <template #footer>
            <VcButton
              v-if="showPaymentButton"
              class="uppercase w-full mt-4"
              @click="$router.push({ name: 'OrderPayment', params: { orderId } })"
            >
              {{ $t("pages.account.order_details.pay_now_button") }}
            </VcButton>
          </template>
        </OrderSummary>

        <!-- Billing Address Widget -->
        <VcCardWidget :title="$t('pages.account.order_details.billing_address_card.title')" icon="truck">
          <VcAddressInfo :address="billingAddress" />
        </VcCardWidget>

        <!-- Shipping Method Card -->
        <VcCardWidget :title="$t('pages.account.order_details.shipping_method_card.title')" icon="truck">
          <div class="flex items-center gap-4 text-15">
            <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />

            <span>
              {{ order?.shipments?.[0]?.shipmentMethodCode }} {{ order?.shipments?.[0]?.shipmentMethodOption }} ({{
                order?.shipments?.[0]?.price?.formattedAmount
              }})
            </span>
          </div>
        </VcCardWidget>

        <!-- Shipping Address Card -->
        <VcCardWidget :title="$t('pages.account.order_details.shipping_address_card.title')" icon="truck">
          <VcAddressInfo :address="deliveryAddress" />
        </VcCardWidget>

        <!-- Payment Details Card -->
        <VcCardWidget :title="$t('pages.account.order_details.payment_details_card.title')" icon="truck">
          <div class="flex flex-col space-y-1.5 text-15">
            <p>
              <span class="font-extrabold">{{
                $t("pages.account.order_details.payment_details_card.payment_number_label")
              }}</span>
              {{ order?.inPayments?.[0]?.number }}
            </p>

            <p class="overflow-x-hidden break-words">
              <span class="font-extrabold">{{
                $t("pages.account.order_details.payment_details_card.payment_type_label")
              }}</span>
              {{ order?.inPayments?.[0]?.gatewayCode }}
            </p>
          </div>

          <div class="mt-3">
            <VcButton class="px-2 py-1 uppercase !text-xs !h-auto" is-outline is-disabled>
              {{ $t("pages.account.order_details.payment_details_card.view_invoice_button") }}
            </VcButton>
          </div>
        </VcCardWidget>

        <!-- Payment method section -->
        <VcCardWidget
          v-if="order?.inPayments[0]?.paymentMethod"
          :title="$t('pages.account.order_details.payment_method_card.title')"
          icon="document-text"
        >
          <div class="flex flex-row items-center space-x-4">
            <VcImage src="/static/images/checkout/invoice.svg" class="h-12 w-12" lazy />
            <span class="break-words">{{ order?.inPayments[0]?.paymentMethod?.typeName }}</span>
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
import { usePageHead } from "@/core";
import { InputNewBulkItemType, OrderLineItemType, Vendor as VendorType } from "@/xapi";
import { AcceptedGifts, OrderSummary } from "@/shared/checkout";
import { BackButtonInHeader } from "@/shared/layout";
import { useUserOrder, OrderLineItems } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddBulkItemsToCartResultsModal, getItemsForAddBulkItemsToCartResultsPopup, useCart } from "@/shared/cart";

type TGroupItem = { items: OrderLineItemType[]; vendor?: VendorType };
type TGroupedItems = Record<string, TGroupItem>;

const props = defineProps({
  orderId: {
    type: String,
    default: "",
  },
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const { order, deliveryAddress, billingAddress, fetchOrder, clearOrder } = useUserOrder();
const { addBulkItemsToCart } = useCart();
const { openPopup } = usePopup();
const { t } = useI18n();

usePageHead({
  title: computed(() => t("pages.account.order_details.meta.title", [order.value?.number])),
});

const isMobile = breakpoints.smaller("lg");
const loadingAddItemsToCart = ref(false);

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  { title: t("pages.account.order_details.title", [order.value?.number]) },
]);

const showPaymentButton = computed<boolean>(() => !!order.value && order.value.status === "New");
const showReorderButton = computed<boolean>(() => !!order.value && order.value.status === "Completed");

const giftItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => item.isGift));
const orderItems = computed<OrderLineItemType[]>(() => (order.value?.items || []).filter((item) => !item.isGift));

const orderItemsGroupedByVendor = computed<TGroupItem[]>(() => {
  // NOTE: The group without the vendor should be displayed last.
  const groupWithoutVendor: TGroupItem = { items: [] };
  const map: TGroupedItems = {};

  orderItems.value.forEach((item) => {
    const vendor = item.product?.vendor;

    if (vendor) {
      const vendorId = vendor.id;

      map[vendorId] = map[vendorId] || { vendor, items: [] };
      map[vendorId].items.push(item);
    } else {
      groupWithoutVendor.items.push(item);
    }
  });

  const result = Object.values(map)
    // Sort by Vendor
    .sort((a, b) => a.vendor!.name.localeCompare(b.vendor!.name));

  // Add the group without the vendor to the end.
  result.push(groupWithoutVendor);

  return result;
});

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
