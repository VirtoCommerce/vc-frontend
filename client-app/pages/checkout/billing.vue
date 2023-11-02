<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <BillingDetailsSection
      v-model:address-equals-shipping-address="billingAddressEqualsShipping"
      v-model:purchase-order-number="purchaseOrderNumber"
      :purchase-order-number-enabled="isPurchaseOrderNumberEnabled"
      :methods="availablePaymentMethods"
      :payment="payment"
      :shipment="allItemsAreDigital ? undefined : shipment"
      :disabled="loading"
      @change:address="onBillingAddressChange"
      @change:method="setPaymentMethod"
    />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
        <template #footer>
          <VcButton :to="{ name: 'Review', replace: true }" :disabled="isDisabledNextStep" full-width class="mt-4">
            {{ $t("common.buttons.review_order") }}
          </VcButton>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="!isValidPayment" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
              {{ $t("common.messages.fill_all_required") }}
            </VcAlert>
          </transition>

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
import { computed } from "vue";
import { useCart } from "@/shared/cart";
import { BillingDetailsSection, OrderSummary, useCheckout } from "@/shared/checkout";

const {
  loading,
  cart,
  selectedLineItems,
  shipment,
  payment,
  hasValidationErrors,
  availablePaymentMethods,
  allItemsAreDigital,
} = useCart();
const {
  purchaseOrderNumber,
  billingAddressEqualsShipping,
  isValidPayment,
  isValidCheckout,
  isPurchaseOrderNumberEnabled,
  onBillingAddressChange,
  setPaymentMethod,
} = useCheckout();

const isDisabledNextStep = computed<boolean>(() => loading.value || !isValidCheckout.value);
</script>
