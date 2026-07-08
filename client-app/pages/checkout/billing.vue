<template>
  <VcLayout sidebar-position="right" sticky>
    <BillingDetailsSection />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" :no-shipping="allItemsAreDigital" footnote>
        <template #footer>
          <ProceedTo
            :to="{ name: 'Review' }"
            :disabled="!isValidPayment"
            test-id="review-order-button"
            @click="
              analytics('addPaymentInfo', { ...cart!, items: selectedLineItems }, {}, payment?.paymentGatewayCode)
            "
          >
            {{ $t("common.buttons.review_order") }}
          </ProceedTo>

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

          <LoyaltyValidationAlert variant="compact" class="mt-4" />
        </template>
      </OrderSummary>
    </template>
  </VcLayout>
</template>

<script setup lang="ts">
import { useAnalytics } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { BillingDetailsSection, OrderSummary, ProceedTo, useCheckout } from "@/shared/checkout";
import LoyaltyValidationAlert from "@/shared/cart/components/loyalty-validation-alert.vue";

const { cart, payment, selectedLineItems, hasValidationErrors, allItemsAreDigital } = useFullCart();
const { isValidPayment } = useCheckout();
const { analytics } = useAnalytics();
</script>
