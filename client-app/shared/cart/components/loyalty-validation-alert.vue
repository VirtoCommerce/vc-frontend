<template>
  <output v-if="messages.length" aria-live="polite" class="flex flex-col gap-y-2">
    <VcAlert
      v-for="message in messages"
      :key="message.code"
      color="warning"
      :size="variant === 'full' ? 'md' : 'sm'"
      variant="solid-light"
      icon
      :data-test-id="`loyalty-validation-alert-${message.code}`"
    >
      {{ message.text }}
    </VcAlert>
  </output>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useFullCart, getLoyaltyValidationMessages } from "@/shared/cart";
import {
  LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS,
  LOYALTY_VALIDATION_ERROR_COMPACT_MESSAGE_KEYS,
} from "@/shared/cart/enums";

interface IProps {
  // "full" is shown near the "Products in {loyaltyCurrency}" group, "compact" next to the "Total in {loyaltyCurrency}" block.
  variant?: "full" | "compact";
}

const props = withDefaults(defineProps<IProps>(), {
  variant: "full",
});

const { t, te } = useI18n();
const { loyaltyValidationErrors } = useFullCart();

const messages = computed(() =>
  getLoyaltyValidationMessages(loyaltyValidationErrors.value, {
    translate: (key, params) => t(key, params),
    messageKeys:
      props.variant === "compact"
        ? LOYALTY_VALIDATION_ERROR_COMPACT_MESSAGE_KEYS
        : LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS,
    hasTranslation: (key) => te(key),
  }),
);
</script>
