<template>
  <div v-if="order">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0 -mb-3">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{ $t("pages.account.order_details.title", [order?.number]) }}
      </h2>
    </div>

    <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
      <!-- Main section -->
      <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
        <!-- Items grouped by Vendor -->
        <div
          v-if="$cfg.line_items_group_by_vendor_enabled"
          class="bg-white lg:mb-6 lg:rounded -mx-5 md:mx-0 lg:shadow-md-x lg:pt-5 lg:px-7"
        >
          <template v-for="(group, vendorId) in orderItemsGroupedByVendor" :key="vendorId">
            <div
              v-if="group.items.length"
              class="bg-white shadow-light-lg mb-4 px-7 pt-4 lg:mb-0 lg:pb-5 lg:px-0 lg:pt-0 lg:rounded lg:shadow-none"
            >
              <!-- Vendor -->
              <div class="pb-3 font-bold text-15">
                <span class="mr-1">{{ $t("pages.account.order_details.vendor_label") }}:</span>
                <Vendor v-if="group.vendor" :vendor="group.vendor" class="inline-flex flex-row items-end gap-x-3" />
                <span v-else class="text-gray-400" v-t="`pages.account.order_details.empty_vendor_label`" />
              </div>

              <OrderLineItems :items="group.items" class="lg:rounded" />
            </div>
          </template>
        </div>

        <!-- Items not grouped by Vendor -->
        <div v-else class="bg-white lg:mb-6 lg:rounded -mx-5 md:mx-0 lg:shadow-md-x lg:pt-5 lg:px-7">
          <div class="bg-white shadow-light-lg mb-4 p-7 lg:mb-0 lg:pb-5 lg:px-0 lg:pt-0 lg:rounded lg:shadow-none">
            <OrderLineItems :items="orderItems" class="lg:rounded" />
          </div>
        </div>

        <!-- Gifts section -->
        <AcceptedGifts :items="giftItems" />

        <!-- Order comment section -->
        <VcSection v-if="order?.comment" class="shadow-inner mt-5 p-6 lg:shadow" content-classes="pt-4">
          <template #title>
            <h3 class="text-24 font-bold uppercase mb-4">
              {{ $t("pages.account.order_details.order_comment_section.title") }}
            </h3>
          </template>
          <p class="break-words text-15" v-for="line in order?.comment?.split('\n')" :key="line">{{ line }}</p>
        </VcSection>

        <div class="shadow-inner h-1 lg:hidden"></div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
        <VcButton
          v-if="showPaymentButton"
          class="uppercase w-full mb-5"
          @click="$router.push({ name: 'OrderPayment', params: { orderId } })"
        >
          {{ $t("pages.account.order_details.pay_now_button") }}
        </VcButton>

        <!-- Order summary -->
        <OrderSummary v-if="order" :cart="order" class="mb-5" />

        <VcButton
          v-if="showReorderButton"
          :is-waiting="loadingAddItemsToCart"
          class="uppercase w-full mb-5"
          @click="reorderItems"
        >
          {{ $t("pages.account.order_details.reorder_all_button") }}
        </VcButton>

        <VcCard
          :title="$t('pages.account.order_details.shipping_address_card.title')"
          class="mb-5"
          is-collapsible
          shadow
        >
          <div class="flex flex-col space-y-1.5 text-sm">
            <span class="font-extrabold">{{ deliveryAddress?.firstName }} {{ deliveryAddress?.lastName }}</span>
            <p>
              {{ deliveryAddress?.countryCode }}
              {{ deliveryAddress?.regionName }}
              {{ deliveryAddress?.city }}
              {{ deliveryAddress?.line1 }}
              {{ deliveryAddress?.postalCode }}
            </p>
            <p v-if="deliveryAddress?.phone">
              <span class="font-extrabold" v-t="'pages.account.order_details.shipping_address_card.phone_label'" />
              {{ deliveryAddress?.phone }}
            </p>
            <p v-if="deliveryAddress?.email">
              <span class="font-extrabold" v-t="'pages.account.order_details.shipping_address_card.email_label'" />
              {{ deliveryAddress?.email }}
            </p>
          </div>
        </VcCard>

        <VcCard
          :title="$t('pages.account.order_details.shipping_method_card.title')"
          class="mb-5"
          is-collapsible
          shadow
        >
          <div class="flex items-center space-x-4 text-sm">
            <VcImage src="/static/images/checkout/fedex.svg" class="h-12 w-12" lazy />

            <span>
              {{ order?.shipments?.[0]?.shipmentMethodCode }} {{ order?.shipments?.[0]?.shipmentMethodOption }} ({{
                order?.shipments?.[0]?.price?.formattedAmount
              }})
            </span>
          </div>
        </VcCard>

        <VcCard
          :title="$t('pages.account.order_details.payment_details_card.title')"
          class="mb-5"
          is-collapsible
          shadow
        >
          <div class="flex flex-col space-y-1.5 text-sm">
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
        </VcCard>

        <VcCard
          :title="$t('pages.account.order_details.billing_address_card.title')"
          class="mb-5"
          is-collapsible
          shadow
        >
          <div class="flex flex-col space-y-1.5 text-sm">
            <span class="font-extrabold">{{ billingAddress?.firstName }} {{ billingAddress?.lastName }}</span>
            <p>
              {{ billingAddress?.countryCode }}
              {{ billingAddress?.regionName }}
              {{ billingAddress?.city }}
              {{ billingAddress?.line1 }}
              {{ billingAddress?.postalCode }}
            </p>

            <p v-if="billingAddress?.phone">
              <span class="font-extrabold">
                {{ $t("pages.account.order_details.billing_address_card.phone_label") }}
              </span>
              {{ billingAddress?.phone }}
            </p>

            <p v-if="billingAddress?.email">
              <span class="font-extrabold">
                {{ $t("pages.account.order_details.billing_address_card.email_label") }}
              </span>
              {{ billingAddress?.email }}
            </p>
          </div>
        </VcCard>

        <!-- US-3534 -->
        <!-- <div class="flex justify-center">
          <VcButton kind="secondary" class="!hidden lg:!inline-flex uppercase px-3" is-outline @click="window.print()">
            <i class="fas fa-print mr-2" />
            {{ $t("pages.account.order_details.print_order_button") }}
          </VcButton>
        </div> -->
      </div>
    </div>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useBreadcrumbs, usePageHead } from "@/core";
import { InputNewBulkItemType, OrderLineItemType, CommonVendor } from "@/xapi";
import { AcceptedGifts, OrderSummary } from "@/shared/checkout";
import { BackButtonInHeader } from "@/shared/layout";
import { useUserOrder, OrderLineItems } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { AddBulkItemsToCartResultsModal, getItemsForAddBulkItemsToCartResultsPopup, useCart } from "@/shared/cart";
import { Vendor } from "@/shared/catalog";

type TGroupItem = { items: OrderLineItemType[]; vendor?: CommonVendor };
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

const breadcrumbs = useBreadcrumbs([
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
