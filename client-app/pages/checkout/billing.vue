<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <BillingDetailsSection />

    <template #sidebar>
      <OrderSummary
        :changing="cartChanging || checkoutChanging"
        :cart="cart!"
        :selected-items="selectedLineItems"
        :no-shipping="allItemsAreDigital"
        footnote
      >
        <template #footer>
          <ProceedTo
            :to="{ name: 'Review' }"
            :disabled="!isValidPayment"
            @click="ga.addPaymentInfo({ ...cart!, items: selectedLineItems }, {}, payment?.paymentGatewayCode)"
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
        </template>
      </OrderSummary>
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { useGoogleAnalytics } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { BillingDetailsSection, OrderSummary, ProceedTo, useCheckout } from "@/shared/checkout";

const {
  changing: cartChanging,
  cart,
  payment,
  selectedLineItems,
  hasValidationErrors,
  allItemsAreDigital,
} = useFullCart();
const { changing: checkoutChanging, isValidPayment } = useCheckout();
const ga = useGoogleAnalytics();
</script>
