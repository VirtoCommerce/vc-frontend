<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <BillingDetailsSection
      v-model:address-equals-shipping-address="billingAddressEqualsShipping"
      v-model:purchase-order-number="_purchaseOrderNumber"
      :methods="availablePaymentMethods"
      :payment="payment"
      :shipment="shipment"
      :disabled="loading"
      @change:address="onBillingAddressChange"
      @change:method="setPaymentMethod"
    />

    <template #sidebar>
      <OrderSummary :cart="cart" footnote>
        <template #footer>
          <!-- Purchase order number -->
          <transition name="slide-fade-top" mode="in-out" appear>
            <VcActionInput
              v-if="$cfg.checkout_purchase_order_enabled"
              v-model="purchaseOrderNumber"
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

          <VcButton
            :to="{ name: 'Review', replace: true }"
            :is-disabled="isDisabledNextStep"
            class="mt-4 w-full uppercase"
          >
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

const { loading, cart, shipment, payment, hasValidationErrors, availablePaymentMethods } = useCart();
const {
  billingAddressEqualsShipping,
  isValidPayment,
  isValidCheckout,
  onBillingAddressChange,
  setPaymentMethod,
  _purchaseOrderNumber,
} = useCheckout();
const { purchaseOrderNumber, purchaseOrderNumberIsApplied, setPurchaseOrderNumber, removePurchaseOrderNumber } =
  usePurchaseOrderNumber();

const isDisabledNextStep = computed<boolean>(() => loading.value || !isValidCheckout.value);
</script>
