<template>
  <div v-if="messages.length" role="alert" aria-live="polite" class="flex flex-col gap-y-2">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useFullCart } from "@/shared/cart";
import {
  LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS,
  LOYALTY_VALIDATION_ERROR_COMPACT_MESSAGE_KEYS,
} from "@/shared/cart/enums";
import type { NamedValue } from "vue-i18n";

interface IProps {
  // "full" is shown near the "Products in PTS" group, "compact" next to the "Total in PTS" block.
  variant?: "full" | "compact";
}

const props = withDefaults(defineProps<IProps>(), {
  variant: "full",
});

const { t, te } = useI18n();
const { loyaltyValidationErrors } = useFullCart();

const messageKeys = computed(() =>
  props.variant === "compact" ? LOYALTY_VALIDATION_ERROR_COMPACT_MESSAGE_KEYS : LOYALTY_VALIDATION_ERROR_MESSAGE_KEYS,
);

const messages = computed(() =>
  loyaltyValidationErrors.value.reduce<{ code: string; text: string }[]>((acc, error) => {
    const code = error.errorCode;
    if (!code) {
      return acc;
    }

    const messageKey = messageKeys.value[code];
    if (!messageKey || !te(messageKey)) {
      return acc;
    }

    const params = (error.errorParameters ?? []).reduce<Record<string, string>>((result, param) => {
      if (param?.key) {
        result[param.key] = param.value ?? "";
      }
      return result;
    }, {});

    acc.push({ code, text: t(messageKey, params as NamedValue) });
    return acc;
  }, []),
);
</script>
