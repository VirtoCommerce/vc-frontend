<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <VcSectionWidget :title="$t('common.titles.review_order')" icon="clipboard-copy-1">
      <VcButton class="min-w-[8.5rem]" variant="outline" prepend-icon="printer" @click="print()">
        {{ $t("common.buttons.print_order") }}
      </VcButton>
      <!-- Items grouped by Vendor -->
      <div v-if="$cfg.line_items_group_by_vendor_enabled" class="space-y-5 md:space-y-7">
        <template v-for="(group, vendorId) in lineItemsGroupedByVendor" :key="vendorId">
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
      <OrderLineItems v-else :items="cart!.items" />

      <div class="divide-y lg:divide-y-0">
        <!-- Shipping details -->
        <div v-if="!allItemsAreDigital" class="mt-6 flex flex-col gap-6 md:mt-8 lg:flex-row lg:gap-8">
          <div class="lg:w-3/5">
            <VcLabel>
              {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
            </VcLabel>

            <div class="grow divide-y rounded border">
              <VcAddressSelection :address="shipment?.deliveryAddress" class="min-h-[4.625rem] px-3 py-1.5" readonly />
            </div>
          </div>

          <VcSelect
            :model-value="shippingMethodId"
            :label="$t('shared.checkout.shipping_details_section.labels.shipping_method')"
            :items="availableShippingMethods"
            value-field="id"
            size="auto"
            class="lg:w-2/5"
            readonly
          >
            <template #selected="{ item }">
              <VcSelectItem>
                <VcSelectItemImage :src="item.logoUrl" />
                <VcSelectItemText>
                  {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
                </VcSelectItemText>
              </VcSelectItem>
            </template>
          </VcSelect>
        </div>

        <!-- Payment details -->
        <div class="mb-2 mt-6 flex flex-col gap-6 pt-5 md:mt-8 lg:flex-row lg:gap-8 lg:pt-0">
          <div class="lg:w-3/5">
            <VcLabel>
              {{ $t("shared.checkout.billing_details_section.labels.billing_address") }}
            </VcLabel>

            <div class="grow divide-y rounded border">
              <VcAddressSelection :address="billingAddress" class="min-h-[4.625rem] px-3 py-1.5" readonly />
            </div>
          </div>

          <div class="space-y-3 lg:w-2/5">
            <VcSelect
              :model-value="payment?.paymentGatewayCode"
              :label="$t('shared.checkout.billing_details_section.labels.payment_method')"
              :items="availablePaymentMethods"
              value-field="code"
              size="auto"
              readonly
            >
              <template #selected="{ item }">
                <VcSelectItem>
                  <VcSelectItemImage :src="item.logoUrl" />
                  <VcSelectItemText>{{ $t(`common.methods.payment_by_code.${item.code}`) }}</VcSelectItemText>
                </VcSelectItem>
              </template>
            </VcSelect>

            <VcInput
              v-if="isPurchaseOrderNumberEnabled"
              :model-value="purchaseOrderNumber"
              name="purchaseOrderNumber"
              readonly
            />
          </div>
        </div>
      </div>
    </VcSectionWidget>

    <AcceptedGifts v-if="cart?.gifts?.length" :items="cart.gifts" />

    <OrderCommentSection v-if="comment" :comment="comment" readonly />

    <template #sidebar>
      <OrderSummary :cart="cart!" :no-shipping="allItemsAreDigital" footnote>
        <template #footer>
          <!-- Promotion code -->
          <transition name="slide-fade-top" mode="in-out" appear>
            <VcActionInput
              v-if="couponCode"
              :model-value="couponCode"
              :label="$t('common.labels.promotion_code')"
              class="mt-4"
              disabled
              readonly
            />
          </transition>

          <VcButton
            :disabled="isDisabledOrderCreation"
            :loading="creatingOrder"
            full-width
            class="mt-4"
            @click="createOrder"
          >
            {{ $t("common.buttons.place_order") }}
          </VcButton>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="hasValidationErrors" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
              {{ $t("common.messages.something_went_wrong") }}
            </VcAlert>
          </transition>
        </template>
      </OrderSummary>
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { sumBy } from "lodash";
import moment from "moment";
import { computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useGoogleAnalytics } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { OrderLineItems } from "@/shared/account";
import { useCart, useCoupon } from "@/shared/cart";
import { AcceptedGifts, OrderCommentSection, OrderSummary, useCheckout } from "@/shared/checkout";
import type { CartAddressType, LineItemType } from "@/core/api/graphql/types";
import type { LineItemsGroupByVendorType } from "@/core/types";

const config = inject(configInjectionKey, {});
const { t, n } = useI18n();

const router = useRouter();
const {
  cart,
  shipment,
  payment,
  lineItemsGroupedByVendor,
  availableShippingMethods,
  availablePaymentMethods,
  hasValidationErrors,
  allItemsAreDigital,
  fetchFullCart,
} = useCart();
const {
  billingAddressEqualsShipping,
  comment,
  purchaseOrderNumber,
  isPurchaseOrderNumberEnabled,
  canPayNow,
  isValidCheckout,
  createOrderFromCart,
} = useCheckout();
const { couponCode } = useCoupon();

const creatingOrder = ref(false);

const isDisabledOrderCreation = computed<boolean>(() => !isValidCheckout.value);

const shippingMethodId = computed(
  () => shipment.value?.shipmentMethodCode + "_" + shipment.value?.shipmentMethodOption,
);
const billingAddress = computed<CartAddressType | undefined>(() =>
  !allItemsAreDigital.value && billingAddressEqualsShipping.value
    ? shipment.value?.deliveryAddress
    : payment.value?.billingAddress,
);

const ga = useGoogleAnalytics();

async function createOrder(): Promise<void> {
  creatingOrder.value = true;

  const order = await createOrderFromCart();

  if (order) {
    ga.placeOrder(order);
    await router.replace({ name: canPayNow.value ? "CheckoutPayment" : "CheckoutCompleted" });
  }

  await fetchFullCart();

  creatingOrder.value = false;
}

// TODO: Might be better to move somewhere else? Similar functionality in the Order Details Page
function getGroupContent(group: LineItemsGroupByVendorType<LineItemType>) {
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
                sumBy(group.items, (item: LineItemType) => item.extendedPrice?.amount),
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

function getTableRowsHtml(items: LineItemType[]) {
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
    lineItemsGroupedByVendor.value.forEach((group) => {
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

        ${getTableRowsHtml(cart.value!.items || [])}
        <tr class="bg-[--color-additional-50] border-[--color-neutral-100] border-t">
          <td class="px-2.5 py-2 font-bold">${t("common.labels.subtotal")}</td>
          <td class="px-2.5 py-2"></td>
          <td class="px-2.5 py-2"></td>
          <td class="px-2.5 py-2"></td>
          <td class="px-2.5 py-2 font-bold">
            ${n(
              sumBy(cart.value!.items || [], (item: LineItemType) => item.extendedPrice?.amount),
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
            ${t("common.labels.cart")}
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
</script>
