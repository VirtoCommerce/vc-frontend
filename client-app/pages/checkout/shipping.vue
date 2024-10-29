<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <ShippingDetailsSection />

    <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" />

    <template #sidebar>
      <OrderSummary
        :changing="cartChanging || checkoutChanging"
        :cart="cart!"
        :selected-items="selectedLineItems"
        footnote
      >
        <template #footer>
          <ProceedTo
            :to="{ name: 'Billing' }"
            :disabled="!isValidShipment"
            @click="ga.addShippingInfo({ ...cart!, items: selectedLineItems }, {}, shipment?.shipmentMethodOption)"
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
        </template>
      </OrderSummary>
    </template>
  </VcLayoutWithRightSidebar>
</template>

<script setup lang="ts">
import { useGoogleAnalytics } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { OrderCommentSection, OrderSummary, ProceedTo, ShippingDetailsSection, useCheckout } from "@/shared/checkout";

const { changing: cartChanging, cart, shipment, selectedLineItems, hasValidationErrors } = useFullCart();
const { changing: checkoutChanging, comment, isValidShipment } = useCheckout();
const ga = useGoogleAnalytics();
</script>
