<template>
  <div v-if="order">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <!-- Title block -->
    <div class="mx-5 flex flex-col gap-2.5 lg:mx-0 lg:flex-row lg:justify-between">
      <VcTypography tag="h1" variant="h2" weight="bold">
        {{ $t("pages.account.order_details.title", [order?.number]) }}
      </VcTypography>

      <div class="flex flex-wrap gap-3">
        <VcButton class="min-w-[8.5rem]" variant="outline" prepend-icon="printer" @click="print()">
          {{ $t("common.buttons.print_order") }}
        </VcButton>

        <VcButton
          v-if="showReorderButton"
          :loading="loadingAddItemsToCart"
          class="min-w-[8.5rem]"
          @click="reorderItems"
        >
          {{ $t("common.buttons.reorder_all") }}
        </VcButton>
      </div>
    </div>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <VcSectionWidget :title="$t('shared.cart.products_section.title')" icon="cube" hide-desktop-title>
        <!-- Items grouped by Vendor -->
        <div v-if="$cfg.line_items_group_by_vendor_enabled" class="space-y-5 md:space-y-7">
          <template v-for="(group, vendorId) in orderItemsGroupedByVendor" :key="vendorId">
            <div v-if="group.items.length" class="space-y-3">
              <!-- Vendor -->
              <div class="flex max-w-full flex-wrap gap-x-3">
                <VcVendor :vendor="group.vendor" />
                <VcRating v-if="$cfg.rating_enabled && group.vendor?.rating" :rating="group.vendor.rating" />
              </div>

              <OrderLineItems :items="group.items" />
            </div>
          </template>
        </div>

        <!-- Items not grouped by Vendor -->
        <OrderLineItems v-else :items="orderItems" />
      </VcSectionWidget>

      <AcceptedGifts v-if="giftItems.length" :items="giftItems" />

      <OrderCommentSection v-if="order.comment" :comment="order.comment" readonly />

      <template #sidebar>
        <!-- Order Data Widget -->
        <VcCardWidget :title="$t('common.titles.order_data')" class="order-first" hide-mobile-title>
          <div class="flex flex-col gap-1.5 text-15">
            <p v-if="order.createdDate">
              <span class="font-extrabold"> {{ $t("common.labels.created") }}: </span>
              {{ $d(order.createdDate) }}
            </p>
            <p v-if="order.status" class="flex items-center">
              <span class="mr-2 font-extrabold"> {{ $t("common.labels.status") }}: </span>
              <OrderStatus class="min-w-[7.785rem]" :status="order.status" />
            </p>
          </div>
        </VcCardWidget>

        <!-- Order summary -->
        <OrderSummary :cart="order" :no-shipping="allItemsAreDigital" class="order-last">
          <template #footer>
            <VcButton
              v-if="showPaymentButton"
              class="mt-4"
              full-width
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
        <VcCardWidget v-if="!allItemsAreDigital && shipment" :title="$t('common.titles.shipping_method')" icon="truck">
          <div class="flex items-center gap-4 text-15">
            <VcImage :src="shipment.shippingMethod?.logoUrl" class="h-12 w-12" lazy />

            <span class="min-w-0 break-words">
              {{ $t(`common.methods.delivery_by_id.${shipment.shipmentMethodCode}_${shipment.shipmentMethodOption}`) }}
              ({{ shipment.price?.formattedAmount }})
            </span>
          </div>
        </VcCardWidget>

        <!-- Shipping Address Card -->
        <VcCardWidget
          v-if="!allItemsAreDigital && deliveryAddress"
          :title="$t('common.titles.shipping_address')"
          icon="truck"
        >
          <VcAddressInfo :address="deliveryAddress" class="text-15" />
        </VcCardWidget>

        <!-- Payment Method section -->
        <VcCardWidget v-if="payment?.paymentMethod" :title="$t('common.titles.payment_method')" icon="document-text">
          <div class="flex items-center gap-4 text-15">
            <VcImage :src="payment.paymentMethod.logoUrl" class="h-12 w-12" lazy />
            <span class="min-w-0 break-words">
              {{ $t(`common.methods.payment_by_code.${payment.paymentMethod.code}`) }}
            </span>
          </div>
        </VcCardWidget>
      </template>
    </VcLayoutWithRightSidebar>
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { sumBy } from "lodash";
import moment from "moment";
import { computed, inject, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { useUserOrder, OrderLineItems, OrderStatus } from "@/shared/account";
import { AddBulkItemsToCartResultsModal, getItemsForAddBulkItemsToCartResultsPopup, useCart } from "@/shared/cart";
import { AcceptedGifts, OrderCommentSection, OrderSummary } from "@/shared/checkout";
import { BackButtonInHeader } from "@/shared/layout";
import { usePopup } from "@/shared/popup";
import type { InputNewBulkItemType, OrderLineItemType } from "@/core/api/graphql/types";
import type { LineItemsGroupByVendorType } from "@/core/types/line-items";

interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const config = inject(configInjectionKey, {});
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
  allItemsAreDigital,
  fetchOrder,
  clearOrder,
} = useUserOrder();
const { addBulkItemsToCart } = useCart();
const { openPopup } = usePopup();
const { t, n } = useI18n();

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

const showPaymentButton = computed<boolean>(
  () => !!order.value && (order.value.status === "New" || order.value.status === "Payment required"),
);
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
      listName: t("pages.account.order_details.title", [order.value?.number]),
    },
  });

  loadingAddItemsToCart.value = false;
}

// TODO: Might be better to move somewhere else? Similar functionality in the checkout on the review step
function getGroupContent(group: LineItemsGroupByVendorType<OrderLineItemType>) {
  let vendorContent = "";

  vendorContent += `
    <div class="space-y-3">
      <div class="vc-vendor">
        <svg class="vc-icon vc-icon--size--sm vc-vendor__icon">
          <use href="/static/icons/basic/vendor.svg#icon" />
        </svg>

        <span class="vc-vendor__title">
          ${t("common.labels.vendor")}:

          <span class="${group.vendor?.name || "text-gray-400"}">
            ${group.vendor?.name || t("common.labels.not_available")}
          </span>
        </span>
      </div>


      <div class="overflow-hidden border border-[--color-neutral-100] rounded">
        <table class="w-full border-collapse text-xs">
          <thead class="bg-[--color-neutral-50] font-bold text-left">
            <th class="px-2.5 py-2 w-1/2">
              ${t("common.labels.product_name")}
            </th>
            <th class="px-2.5 py-2 w-1/6">
              ${t("common.labels.sku")}
            </th>
            <th class="px-2.5 py-2 w-1/6">
              ${t("common.labels.price_per_item")}
            </th>
            <th class="px-2.5 py-2 w-1/6">
              ${t("common.labels.quantity")}
            </th>
            <th class="px-2.5 py-2 w-2/6">
              ${t("common.labels.total")}
            </th>
          </thead>

          ${getTableRowsHtml(group.items)}
          <tr class="bg-[--color-additional-50] border-[--color-neutral-100] border-t">
            <td class="px-2.5 py-2 font-bold">${t("common.labels.subtotal")}</td>
            <td class="px-2.5 py-2"></td>
            <td class="px-2.5 py-2"></td>
            <td class="px-2.5 py-2"></td>
            <td class="px-2.5 py-2 font-bold">
              ${n(
                sumBy(group.items, (item: OrderLineItemType) => item.extendedPrice?.amount),
                "currency",
              )}
            </td>
          </tr>
        </table>
      </div>
    </div>
    `;

  return vendorContent;
}

function getTableRowsHtml(items: OrderLineItemType[]) {
  let rows = "";

  items.forEach((item) => {
    rows += `
    <tr class="even:bg-[--color-neutral-50]">
      <td class="px-2.5 py-2">${item.name}</td>
      <td class="px-2.5 py-2">${item.sku}</td>
      <td class="px-2.5 py-2">${item.placedPrice?.formattedAmount}</td>
      <td class="px-2.5 py-2">${item.quantity}</td>
      <td class="px-2.5 py-2">${item.extendedPrice?.formattedAmount}</td>
    </tr>`;
  });

  return rows;
}

function print() {
  const logo = config?.logo_image;
  const htmlStyle = document.documentElement.attributes.getNamedItem("style")?.textContent;
  const styleLinks = Array.from(document.head.querySelectorAll("link[rel=stylesheet], style"))
    .map((el) => el.outerHTML)
    .join("");

  const headerHtml = `
  <header class="flex justify-between items-start">
    <img class="h-7" src="${logo}" alt="">

    <div class="p-2 border border-[--color-neutral-100] rounded text-xs">
      <div class="font-black">${t("common.labels.created_date")}</div>
      <div class="mt-1">${moment().format("DD MMMM YYYY")}</div>
    </div>
  </header>`;

  let contentHtml = "";

  if (config.line_items_group_by_vendor_enabled) {
    orderItemsGroupedByVendor.value.forEach((group) => {
      contentHtml += `
      <div class="space-y-6">
        ${getGroupContent(group)}
      </div>`;
    });
  } else {
    contentHtml += `
    <div class="overflow-hidden border border-[--color-neutral-100] rounded">
      <table class="w-full border-collapse text-xs">
        <thead class="bg-[--color-neutral-50] font-bold text-left">
          <th class="px-2.5 py-2 w-1/2">
            ${t("common.labels.product_name")}
          </th>
          <th class="px-2.5 py-2 w-1/6">
            ${t("common.labels.sku")}
          </th>
          <th class="px-2.5 py-2 w-1/6">
            ${t("common.labels.price_per_item")}
          </th>
          <th class="px-2.5 py-2 w-1/6">
            ${t("common.labels.quantity")}
          </th>
          <th class="px-2.5 py-2 w-2/6">
            ${t("common.labels.total")}
          </th>
        </thead>

        ${getTableRowsHtml(orderItems.value)}
        <tr class="bg-[--color-additional-50] border-[--color-neutral-100] border-t">
          <td class="px-2.5 py-2 font-bold">${t("common.labels.subtotal")}</td>
          <td class="px-2.5 py-2"></td>
          <td class="px-2.5 py-2"></td>
          <td class="px-2.5 py-2"></td>
          <td class="px-2.5 py-2 font-bold">
            ${n(
              sumBy(orderItems.value, (item: OrderLineItemType) => item.extendedPrice?.amount),
              "currency",
            )}
          </td>
        </tr>
      </table>
    </div>`;
  }

  const printWindow = window.open("", "print")!;

  printWindow.document.write(`
  <html style="${htmlStyle}">
    <head>${styleLinks}</head>
    <body class="font-lato">
      <div class="flex flex-col mx-auto h-full min-h-screen w-full max-w-[1024px] p-6 print:p-0">
        ${headerHtml}

        <div class="grow mt-6 px-4 space-y-4">
          <h2 class="text-xl font-bold uppercase">
            ${t("pages.account.order_details.title", [order?.value?.number])}
          </h2>

          ${contentHtml}
        </div>
      </div>
    </body>
  </html>`);

  printWindow.onload = () => {
    setTimeout(() => {
      // TODO: uncomment before merge
      // printWindow.print();
      // printWindow.close();
    }, 500);
  };

  printWindow.document.close();
  printWindow.focus();
}

watchEffect(() => {
  clearOrder();
  fetchOrder({ id: props.orderId });
});
</script>
