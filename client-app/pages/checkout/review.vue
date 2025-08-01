<template>
  <VcLayout sidebar-position="right" sticky-sidebar>
    <VcWidget
      id="line-items-widget"
      :title="$t('common.titles.review_order')"
      prepend-icon="clipboard-list"
      size="lg"
      class="print:break-inside-auto"
    >
      <!-- Items grouped by Vendor -->
      <div v-if="$cfg.line_items_group_by_vendor_enabled" class="space-y-5 md:space-y-7">
        <template v-for="(group, vendorId) in selectedLineItemsGroupedByVendor" :key="vendorId">
          <div v-if="group.items.length" class="space-y-3">
            <!-- Vendor -->
            <div class="flex max-w-full gap-2 max-xs:flex-col">
              <VendorName :name="group.vendor?.name" class="min-w-0" />

              <VcRating
                v-if="$cfg.vendor_rating_enabled && group.vendor?.rating"
                :review-count="group.vendor?.rating?.reviewCount"
                :value="group.vendor?.rating?.value"
                size="xs"
              />
            </div>

            <OrderLineItems :items="group.items" />
          </div>
        </template>
      </div>

      <!-- Items not grouped by Vendor -->
      <OrderLineItems v-else :items="selectedLineItems" />

      <div class="divide-y lg:divide-y-0 print:divide-y-0">
        <!-- Shipping details -->
        <div v-if="!allItemsAreDigital" class="mt-6 flex flex-col gap-6 md:mt-8 lg:flex-row lg:gap-8">
          <div class="lg:w-3/5 print:break-inside-avoid">
            <VcLabel>
              {{ $t("shared.checkout.shipping_details_section.labels.shipping_address") }}
            </VcLabel>

            <div class="grow divide-y rounded border print:border-none">
              <AddressSelection
                :address="shipment?.deliveryAddress"
                class="min-h-[4.625rem] px-3 py-1.5 print:min-h-0 print:px-0"
                readonly
              />
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
              <div class="flex items-center gap-3 p-3 text-sm print:px-0 print:py-1.5">
                <VcImage class="size-12 rounded-sm print:hidden" :src="item.logoUrl" />

                {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
              </div>
            </template>
          </VcSelect>
        </div>

        <!-- Payment details -->
        <div class="mb-2 mt-6 flex flex-col gap-6 pt-5 md:mt-8 lg:flex-row lg:gap-8 lg:pt-0">
          <div class="lg:w-3/5 print:break-inside-avoid">
            <VcLabel>
              {{ $t("shared.checkout.billing_details_section.labels.billing_address") }}
            </VcLabel>

            <div class="grow divide-y rounded border print:border-none">
              <AddressSelection
                :address="billingAddress"
                class="min-h-[4.625rem] px-3 py-1.5 print:min-h-0 print:px-0"
                readonly
              />
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
                <div class="flex items-center gap-3 p-3 text-sm print:px-0 print:py-1.5">
                  <VcImage class="size-12 rounded-sm print:hidden" :src="item.logoUrl" />

                  {{ item.name }}
                </div>
              </template>
            </VcSelect>

            <VcInput
              v-if="isPurchaseOrderNumberEnabled && purchaseOrderNumber"
              :model-value="purchaseOrderNumber"
              name="purchaseOrderNumber"
              readonly
            />
          </div>
        </div>
      </div>
    </VcWidget>

    <AcceptedGifts v-if="cart?.gifts?.length" :items="cart.gifts" class="mt-5" />

    <OrderCommentSection v-if="comment" :comment="comment" readonly class="mt-5" />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
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

          <PlaceOrder />

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="hasValidationErrors" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
              {{ $t("common.messages.something_went_wrong") }}
            </VcAlert>
          </transition>
        </template>
      </OrderSummary>

      <!-- Order actions -->
      <VcWidget :title="$t('common.titles.other_actions')" class="mt-5 print:hidden">
        <VcButton full-width variant="outline" prepend-icon="printer" @click="print()">
          {{ $t("common.buttons.print_order") }}
        </VcButton>
      </VcWidget>
    </template>
  </VcLayout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { OrderLineItems } from "@/shared/account";
import { useFullCart, useCoupon } from "@/shared/cart";
import { AcceptedGifts, PlaceOrder, OrderCommentSection, OrderSummary, useCheckout } from "@/shared/checkout";
import { AddressSelection, VendorName } from "@/shared/common";

const {
  cart,
  shipment,
  payment,
  selectedLineItems,
  selectedLineItemsGroupedByVendor,
  availableShippingMethods,
  availablePaymentMethods,
  hasValidationErrors,
  allItemsAreDigital,
} = useFullCart();
const { comment, billingAddress, purchaseOrderNumber, isPurchaseOrderNumberEnabled } = useCheckout();
const { couponCode } = useCoupon();

const shippingMethodId = computed(
  () => shipment.value?.shipmentMethodCode + "_" + shipment.value?.shipmentMethodOption,
);

function print() {
  window.print();
}
</script>

<style scoped lang="scss">
@media print {
  #line-items-widget {
    :deep(.vc-widget__header-container) {
      @apply hidden;
    }
  }
}
</style>
