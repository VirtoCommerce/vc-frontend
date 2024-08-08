<template>
  <VcButton data-test-id="proceed-to-button" :to="to" :disabled="disabled" full-width class="mt-4 print:!hidden">
    <slot />
  </VcButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout/composables";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  disabled?: boolean;
  to?: RouteLocationRaw;
}

const props = withDefaults(defineProps<IProps>(), {
  disabled: false,
});

const { loading: loadingCart, changing: changingCart, hasValidationErrors } = useFullCart();
const { loading: loadingCheckout, changing: changingCheckout } = useCheckout();

const loading = computed(() => loadingCart.value || loadingCheckout.value);
const changing = computed(() => changingCart.value || changingCheckout.value);
const disabled = computed(() => props.disabled || loading.value || changing.value || hasValidationErrors.value);
</script>
