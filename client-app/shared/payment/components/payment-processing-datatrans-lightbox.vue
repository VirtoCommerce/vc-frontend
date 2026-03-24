<template>
  <div class="flex flex-col items-center py-2">
    <!-- Lock icon -->
    <div class="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-6 text-primary-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />

        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="mb-2 text-lg font-semibold">
      {{ $t("shared.payment.datatrans_lightbox.title") }}
    </h3>

    <!-- Description -->
    <p class="mb-6 max-w-sm text-center text-sm text-neutral-500">
      {{ $t("shared.payment.datatrans_lightbox.description") }}
    </p>

    <!-- Pay button with amount -->
    <VcButton
      :loading="loading"
      :disabled="!ready"
      class="min-w-52"
      data-test-id="pay-now-button"
      @click="openLightbox"
    >
      {{ $t("shared.payment.bank_card_form.pay_now_button") }}
      <template v-if="orderTotal"> &middot; {{ orderTotal }} </template>
    </VcButton>

    <!-- Policies -->
    <div class="mt-4">
      <PaymentPolicies />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import PaymentPolicies from "./payment-policies.vue";
import type { CustomerOrderType } from "@/core/api/graphql/types";

declare const Datatrans: {
  startPayment(options: {
    transactionId: string;
    opened?: () => void;
    loaded?: () => void;
    closed?: () => void;
    error?: (data: { message?: string; detail?: string }) => void;
  }): void;
};

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  transactionId: string;
  clientScript: string;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();
const notifications = useNotifications();

const loading = ref(true);
const ready = ref(false);

const orderTotal = computed(() => props.order.total?.formattedAmount);

let scriptElement: HTMLScriptElement | null = null;

onMounted(() => {
  if (!props.clientScript || !props.transactionId) {
    showError(t("shared.payment.bank_card_form.user_error_message"));
    loading.value = false;
    emit("fail");
    return;
  }

  loadScript(props.clientScript);
});

function loadScript(url: string) {
  scriptElement = document.createElement("script");
  scriptElement.src = url;

  scriptElement.onload = () => {
    loading.value = false;
    ready.value = true;
  };

  scriptElement.onerror = () => {
    loading.value = false;
    showError(t("shared.payment.bank_card_form.user_error_message"));
    emit("fail");
  };

  document.head.appendChild(scriptElement);
}

function openLightbox() {
  if (!props.transactionId) {
    showError(t("shared.payment.bank_card_form.user_error_message"));
    emit("fail");
    return;
  }

  loading.value = true;

  Datatrans.startPayment({
    transactionId: props.transactionId,
    opened: () => {
      Logger.info("Datatrans Lightbox opened");
    },
    loaded: () => {
      Logger.info("Datatrans Lightbox loaded");
    },
    closed: () => {
      // User closed the popup without completing payment
      Logger.info("Datatrans Lightbox closed by user");
      loading.value = false;
    },
    error: (data) => {
      Logger.error("Datatrans Lightbox error", data);
      loading.value = false;
      showError(data.message ?? t("shared.payment.bank_card_form.user_error_message"));
      emit("fail", data.message);
    },
  });

  // Note: On successful payment, Datatrans redirects the browser to the returnUrl.
  // The "closed" callback only fires when the user manually closes the popup.
}

function showError(message: string) {
  notifications.error({
    text: message,
    duration: 10000,
    single: true,
  });
}

onUnmounted(() => {
  if (scriptElement) {
    scriptElement.remove();
    scriptElement = null;
  }
});
</script>
