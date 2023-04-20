<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <VcSectionWidget :title="$t('common.titles.review_order')" icon="clipboard-copy-1">
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
      <OrderLineItems v-else :items="cart.items" />

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
        <div class="mt-6 mb-2 flex flex-col gap-6 pt-5 md:mt-8 lg:flex-row lg:gap-8 lg:pt-0">
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
              v-if="purchaseOrderNumber"
              :model-value="purchaseOrderNumber"
              name="purchaseOrderNumber"
              readonly
            />
          </div>
        </div>
      </div>
    </VcSectionWidget>

    <AcceptedGifts v-if="cart.gifts?.length" :items="cart.gifts" />

    <OrderCommentSection v-if="comment" :comment="comment" readonly />

    <template #sidebar>
      <OrderSummary :cart="cart" :with-shipping-cost="!allItemsAreDigital" footnote>
        <template #footer>
          <!-- Purchase order number -->
          <VcActionInput
            v-if="purchaseOrderNumberOld"
            :model-value="purchaseOrderNumberOld"
            :label="$t('common.labels.purchase_order_number')"
            class="mt-4"
            disabled
            readonly
          />

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
            :is-disabled="isDisabledOrderCreation"
            :is-waiting="creatingOrder"
            class="mt-4 w-full uppercase"
            @click="createOrder"
          >
            {{ $t("common.buttons.place_order") }}
          </VcButton>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="hasValidationErrors" type="warning" class="mt-4" icon>
              {{ $t("common.messages.something_went_wrong") }}
            </VcAlert>
          </transition>
        </template>
      </OrderSummary>
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { OrderLineItems } from "@/shared/account";
import { useCart, useCoupon, usePurchaseOrderNumber } from "@/shared/cart";
import { AcceptedGifts, OrderCommentSection, OrderSummary, useCheckout } from "@/shared/checkout";
import type { CartAddressType } from "@/xapi/types";

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
  fetchCart,
} = useCart();
const { billingAddressEqualsShipping, comment, canPayNow, isValidCheckout, createOrderFromCart, purchaseOrderNumber } =
  useCheckout();
const { purchaseOrderNumber: purchaseOrderNumberOld } = usePurchaseOrderNumber();
const { couponCode } = useCoupon();

const creatingOrder = ref(false);

const isDisabledOrderCreation = computed<boolean>(() => !isValidCheckout.value);

const shippingMethodId = computed(
  () => shipment.value?.shipmentMethodCode + "_" + shipment.value?.shipmentMethodOption
);
const billingAddress = computed<CartAddressType | undefined>(() =>
  !allItemsAreDigital.value && billingAddressEqualsShipping.value
    ? shipment.value?.deliveryAddress
    : payment.value?.billingAddress
);

async function createOrder(): Promise<void> {
  creatingOrder.value = true;

  const order = await createOrderFromCart();

  if (order) {
    await router.replace({ name: canPayNow.value ? "CheckoutPayment" : "CheckoutCompleted" });
  }

  await fetchCart();

  creatingOrder.value = false;
}
</script>
