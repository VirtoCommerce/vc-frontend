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
      <OrderSummary :cart="cart!" :no-shipping="allItemsAreDigital" footnote>
        <template #footer>
          <!-- Purchase order number -->
          <transition name="slide-fade-top" mode="in-out" appear>
            <VcActionInput
              v-if="$cfg.checkout_purchase_order_enabled"
              v-model="purchaseOrderNumberOld"
              :label="$t('common.labels.purchase_order_number')"
              :placeholder="$t('common.placeholders.purchase_order_number')"
              :applied="purchaseOrderNumberIsApplied"
              :disabled="loading"
              :max-length="128"
              class="mt-4"
              @apply="setPurchaseOrderNumber"
              @deny="removePurchaseOrderNumber"
            />
          </transition>

          <VcButton :route="{ name: 'Review', replace: true }" :disabled="isDisabledNextStep" full-width class="mt-4">
            {{ $t("common.buttons.review_order") }}
          </VcButton>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="!isValidPayment" type="warning" class="mt-4" icon>
              {{ $t("common.messages.fill_all_required") }}
            </VcAlert>
          </transition>

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
import { computed } from "vue";
import { useCart, usePurchaseOrderNumber } from "@/shared/cart";
import { BillingDetailsSection, OrderSummary, useCheckout } from "@/shared/checkout";

const { loading, cart, shipment, payment, hasValidationErrors, availablePaymentMethods, allItemsAreDigital } =
  useCart();
const {
  purchaseOrderNumber,
  billingAddressEqualsShipping,
  isValidPayment,
  isValidCheckout,
  isPurchaseOrderNumberEnabled,
  onBillingAddressChange,
  setPaymentMethod,
} = useCheckout();
const {
  purchaseOrderNumber: purchaseOrderNumberOld,
  purchaseOrderNumberIsApplied,
  setPurchaseOrderNumber,
  removePurchaseOrderNumber,
} = usePurchaseOrderNumber();

const isDisabledNextStep = computed<boolean>(() => loading.value || !isValidCheckout.value);
</script>
