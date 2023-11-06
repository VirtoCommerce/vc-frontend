<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <ShippingDetailsSection
      :methods="availableShippingMethods"
      :shipment="shipment"
      :disabled="loading"
      @change:address="onDeliveryAddressChange"
      @change:method="setShippingMethod"
    />

    <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" footnote>
        <template #footer>
          <VcButton :to="{ name: 'Billing', replace: true }" :disabled="isDisabledNextStep" full-width class="mt-4">
            {{ $t("common.buttons.go_to_billing") }}
          </VcButton>

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
import { computed } from "vue";
import { useCart } from "@/shared/cart";
import { OrderCommentSection, OrderSummary, ShippingDetailsSection, useCheckout } from "@/shared/checkout";

const { loading, cart, selectedLineItems, shipment, hasValidationErrors, availableShippingMethods } = useCart();
const { comment, isValidShipment, onDeliveryAddressChange, setShippingMethod } = useCheckout();

const isDisabledNextStep = computed<boolean>(
  () => loading.value || hasValidationErrors.value || !isValidShipment.value,
);
</script>
