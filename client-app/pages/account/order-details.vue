<template>
  <div v-if="order">
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <!-- Title block -->
    <div class="flex flex-col gap-2.5 lg:flex-row lg:justify-between">
      <VcTypography tag="h1">
        {{ $t("pages.account.order_details.title", [order?.number]) }}
      </VcTypography>

      <div class="flex flex-wrap gap-3 print:hidden">
        <VcButton variant="outline" prepend-icon="printer" @click="print()">
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

    <VcLayout sidebar-position="right" sticky-sidebar>
      <VcWidget id="line-items-widget" size="lg" class="print:break-inside-auto">
        <!-- Items grouped by Vendor -->
        <div v-if="$cfg.line_items_group_by_vendor_enabled" class="space-y-5 md:space-y-7">
          <template v-for="(group, vendorId) in orderItemsGroupedByVendor" :key="vendorId">
            <div v-if="group.items.length" class="space-y-3">
              <!-- Vendor -->
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

        <!-- Items not grouped by Vendor -->
        <OrderLineItems v-else :items="orderItems" />
      </VcWidget>

      <AcceptedGifts v-if="giftItems.length" :items="giftItems" class="mt-5" />

      <OrderCommentSection v-if="order.comment" :comment="order.comment" readonly class="mt-5" />

      <template #sidebar>
        <!-- Order Data Widget -->
        <VcWidget id="order-data-widget" :title="$t('common.titles.order_data')" class="order-first mb-5">
          <div class="flex flex-col gap-1.5 text-sm">
            <div v-if="order.createdDate">
              <span class="font-black"> {{ $t("common.labels.created") }}: </span>
              {{ $d(order.createdDate) }}
            </div>

            <div v-if="order.status" class="flex items-center gap-2">
              <span class="font-black"> {{ $t("common.labels.status") }}: </span>

              <OrderStatus size="sm" :status="order.status" :display-value="order.statusDisplayValue" />
            </div>
            <VcAlert
              v-if="order.cancelReason"
              class="mt-2.5"
              :color="String(order.status).toLowerCase() === String(OrderStatusCode.CANCELLED).toLowerCase() ? 'danger' : 'warning'"
              icon="exclamation-circle"
              variant="outline-dark"
            >
              {{ order.cancelReason }}
            </VcAlert>
          </div>
        </VcWidget>

        <div class="space-y-5">
          <!-- Order summary -->
          <OrderSummary
            :cart="order"
            :no-shipping="allItemsAreDigital"
            class="order-last print:order-none print:break-after-page"
          >
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
          <VcWidget v-if="billingAddress" :title="$t('common.titles.billing_address')">
            <AddressInfo :address="billingAddress" class="text-base" />
          </VcWidget>

          <!-- Shipping Method Card -->
          <VcWidget v-if="!allItemsAreDigital && shipment" :title="$t('common.titles.shipping_method')">
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

          <!-- Shipping Address Card -->
          <VcWidget v-if="!allItemsAreDigital && deliveryAddress" :title="shipToTitle">
            <AddressInfo :address="deliveryAddress" class="text-base">
              <template v-if="shipmentType === 'pick_up' && pickupLocation" #actions>
                <div class="flex items-center justify-between gap-2.5 pt-1">
                  <VcButton size="xs" prepend-icon="information-circle" variant="outline" @click="openInfo">
                    {{ $t("pages.account.order_details.bopis.point_info") }}
                  </VcButton>
                </div>
              </template>
            </AddressInfo>
          </VcWidget>

          <!-- Payment Method section -->
          <VcWidget v-if="payment?.paymentMethod" :title="$t('common.titles.payment_method')">
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
  </div>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { OrderStatusCode } from "@/core/constants/order-status.ts";
import { useUserOrder, OrderLineItems, OrderStatus } from "@/shared/account";
import { getItemsForAddBulkItemsToCartResultsModal, useShortCart } from "@/shared/cart";
import { AcceptedGifts, OrderCommentSection, OrderSummary } from "@/shared/checkout";
import { BOPIS_CODE } from "@/shared/checkout/composables/useBopis.ts";
import { AddressInfo, VendorName } from "@/shared/common";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import AddBulkItemsToCartResultsModal from "@/shared/cart/components/add-bulk-items-to-cart-results-modal.vue";
import AddressInfoModal from "@/shared/common/components/address-info-modal.vue";

type ShipmentType = "delivery" | "pick_up";

interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const breakpoints = useBreakpoints(breakpointsTailwind);
const {
  order,
  giftItems,
  orderItems,
  orderItemsGroupedByVendor,
  deliveryAddress,
  pickupLocation,
  billingAddress,
  shipment,
  payment,
  allItemsAreDigital,
  fetchFullOrder,
  clearOrder,
} = useUserOrder();
const { cart, addItemsToCart } = useShortCart();
const { openModal, closeModal } = useModal();
const { t } = useI18n();

const shipmentType = computed<ShipmentType>(() => {
  return shipment.value?.shipmentMethodCode === BOPIS_CODE ? "pick_up" : "delivery";
});

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

const shipmentMethodName = computed<string>(() =>
  t(`common.methods.delivery_by_id.${shipment.value?.shipmentMethodCode}_${shipment.value?.shipmentMethodOption}`),
);
const paymentMethodName = computed(() => payment.value?.paymentMethod?.name);

const shipToTitle = computed(() => {
  return shipmentType.value === "delivery"
    ? t("common.titles.shipping_address")
    : t("pages.account.order_details.bopis.pickup_address");
});

function openInfo() {
  openModal({
    component: AddressInfoModal,
    props: {
      link: coordsToGoogleMapsLink(pickupLocation.value?.geoLocation),
      pickupLocation: pickupLocation,
      onClose: closeModal,
    },
  });
}

function coordsToGoogleMapsLink(geoLocation?: string) {
  if (!geoLocation || !/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(geoLocation)) {
    return;
  }

  return `https://www.google.com/maps?q=${geoLocation}`;
}

async function reorderItems() {
  const items = order.value!.items.filter((item) => !item.isGift);

  loadingAddItemsToCart.value = true;

  await addItemsToCart(items.map(({ productId, quantity }) => ({ productId, quantity })));

  openModal({
    component: AddBulkItemsToCartResultsModal,
    props: {
      items: getItemsForAddBulkItemsToCartResultsModal(items, cart.value!),
      listName: t("pages.account.order_details.title", [order.value?.number]),
    },
  });

  loadingAddItemsToCart.value = false;
}

function print() {
  window.print();
}

watchEffect(() => {
  clearOrder();
  void fetchFullOrder({ id: props.orderId });
});
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
