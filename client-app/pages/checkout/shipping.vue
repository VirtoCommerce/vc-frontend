<template>
  <VcLayoutWithRightSidebar is-sidebar-sticky>
    <ShippingDetailsSection />

    <OrderCommentSection v-if="$cfg.checkout_comment_enabled" v-model:comment="comment" />

    <template #sidebar>
      <OrderSummary :cart="cart!" :selected-items="selectedLineItems" footnote>
        <template #footer>
          <ProceedTo :to="{ name: 'Billing' }" :disabled="!isValidShipment">
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
import { useFullCart } from "@/shared/cart/composables/useFullCart";
import { OrderCommentSection, OrderSummary, ProceedTo, ShippingDetailsSection, useCheckout } from "@/shared/checkout";

const { cart, selectedLineItems, hasValidationErrors } = useFullCart();
const { comment, isValidShipment } = useCheckout();
</script>
