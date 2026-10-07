<template>
  <VcButton
    :data-test-id="testId"
    :to="to"
    :disabled="disabled"
    :loading="loading"
    full-width
    class="mt-4 print:!hidden"
  >
    <slot />
  </VcButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables/useCheckout";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  disabled?: boolean;
  loading?: boolean;
  to?: RouteLocationRaw;
  testId?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false,
  loading: false,
});

const { loading: loadingCart, changing: changingCart, hasValidationErrors, hasLoyaltyValidationErrors } = useFullCart();
const { loading: loadingCheckout, changing: changingCheckout } = useCheckout();

const loading = computed(() => loadingCart.value || loadingCheckout.value);
const changing = computed(() => changingCart.value || changingCheckout.value);
const disabled = computed(
  () =>
    props.disabled || loading.value || changing.value || hasValidationErrors.value || hasLoyaltyValidationErrors.value,
);
</script>
