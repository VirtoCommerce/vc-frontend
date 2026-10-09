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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
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
  (event: "reinitialize"): void;
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
let scriptLoaded = false;

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
  // If the Datatrans script is already loaded, skip re-adding it
  if (scriptLoaded) {
    loading.value = false;
    ready.value = true;
    return;
  }

  scriptElement = document.createElement("script");
  scriptElement.src = url;

  scriptElement.onload = () => {
    scriptLoaded = true;
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
      loading.value = false;
    },
    closed: () => {
      // User closed the popup without completing payment.
      // Datatrans transactionIds are single-use — we must request a fresh one for retry.
      Logger.info("Datatrans Lightbox closed by user");
      loading.value = true;
      ready.value = false;
      emit("reinitialize");
    },
    error: (data) => {
      Logger.error("Datatrans Lightbox error", data);
      loading.value = false;
      showError(data.message ?? t("shared.payment.bank_card_form.user_error_message"));
      emit("fail", data.message);
    },
  });
}

// When the parent provides a fresh transactionId (after reinitialize), re-enable the button
watch(
  () => props.transactionId,
  (newId) => {
    if (newId) {
      loading.value = false;
      ready.value = true;
    }
  },
);

function showError(message: string) {
  notifications.error({
    text: message,
    duration: 10000,
    single: true,
  });
}

onUnmounted(() => {
  // Don't remove the script — it can be reused across retries
});
</script>
