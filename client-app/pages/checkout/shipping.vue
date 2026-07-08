<template>
  <VcLayout sidebar-position="right" sticky>
    <ShippingDetailsSection />

    <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" class="mt-5" />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" footnote>
        <template #footer>
          <ProceedTo
            :to="{ name: 'Billing' }"
            :disabled="!isValidShipment"
            test-id="billing-button"
            @click="
              analytics('addShippingInfo', { ...cart!, items: selectedLineItems }, {}, shipment?.shipmentMethodOption)
            "
          >
            {{ $t("common.buttons.go_to_billing") }}
          </ProceedTo>

          <transition name="slide-fade-top" mode="out-in" appear>
            <VcAlert v-show="!isValidShipment" color="warning" size="sm" variant="solid-light" class="mt-4" icon>
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
import { OrderCommentSection, OrderSummary, ProceedTo, ShippingDetailsSection, useCheckout } from "@/shared/checkout";
import LoyaltyValidationAlert from "@/shared/cart/components/loyalty-validation-alert.vue";

const { cart, shipment, selectedLineItems, hasValidationErrors } = useFullCart();
const { comment, isValidShipment } = useCheckout();
const { analytics } = useAnalytics();
</script>
