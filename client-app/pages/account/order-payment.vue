<template>
  <div v-if="order">
    <VcBreadcrumbs :items="breadcrumbs" class="mx-5 md:mx-0" />

    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase">
        {{
          success || failure
            ? $t("pages.account.order_payment.processed_title", [order.number])
            : $t("pages.account.order_payment.title")
        }}
      </h2>
    </div>

    <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
      <!-- Main section -->
      <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
        <div class="bg-white md:rounded border shadow-sm px-9 py-6">
          <!-- Successful payment -->
          <PaymentSuccess v-if="success" class="-mx-9 -my-6">
            <template #actions>
              <VcButton
                :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
                class="px-5 uppercase"
                is-outline
              >
                <i class="fas fa-arrow-left -ml-1 mr-2.5" />
                {{ $t("pages.account.order_payment.back_to_order_button") }}
              </VcButton>

              <VcButton :to="{ name: 'Orders', replace: true }" class="px-5 uppercase w-40">
                {{ $t("pages.account.order_payment.orders_list_button") }}
              </VcButton>
            </template>
          </PaymentSuccess>

          <!-- Payment failure -->
          <PaymentFailure v-else-if="failure" class="-mx-9 -my-6">
            <template #actions>
              <VcButton class="px-5 uppercase md:w-40" @click="tryAgain">
                {{ $t("pages.account.order_payment.try_again_button") }}
              </VcButton>
            </template>
          </PaymentFailure>

          <!-- Initialization Error -->
          <template v-else-if="initializationError">
            <VcAlert type="error" class="mb-5" icon>{{ initializationError }}</VcAlert>

            <div class="flex flex-col md:flex-row gap-x-5 gap-y-4">
              <VcButton
                :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
                class="px-5 uppercase"
                is-outline
              >
                <i class="fas fa-arrow-left -ml-1 mr-2.5" />
                {{ $t("pages.account.order_payment.back_to_order_button") }}
              </VcButton>

              <VcButton class="px-5 uppercase md:w-40" @click="tryAgain">
                {{ $t("pages.account.order_payment.try_again_button") }}
              </VcButton>
            </div>
          </template>

          <!-- Payment Methods -->
          <template v-else-if="initialized">
            <AuthorizeNetPaymentProcessing
              v-if="isAuthorizeNetPaymentMethod"
              :order="order"
              :parameters="parameters"
              @success="success = true"
              @fail="failure = true"
            />
          </template>

          <!-- Initialization Loader -->
          <div v-else class="flex items-center gap-2">
            <VcLoader class="inline-block h-6 w-6 text-[color:var(--color-primary)]" />

            <span class="font-extrabold animate-pulse">
              {{ $t("pages.account.order_payment.loading_text") }}
            </span>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col px-5 mb-7 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
        <OrderSummary :cart="order" class="mb-5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watchEffect } from "vue";
import { KeyValueType } from "@core/api/graphql/types";
import { IBreadcrumbs, VcAlert, VcButton, VcBreadcrumbs, VcLoader } from "@/components";
import { OrderSummary } from "@/shared/checkout";
import { AuthorizeNetPaymentProcessing, PaymentActionType, PaymentFailure, PaymentSuccess } from "@/shared/payment";
import { useI18n } from "vue-i18n";
import { initializePayment } from "@core/api/graphql/cart";
import { useUserOrder } from "@/shared/account";
import { useRouter } from "vue-router";

const props = defineProps({
  orderId: {
    type: String,
    default: "",
  },
});

const initialized = ref(false);
const success = ref(false);
const failure = ref(false);
const parameters = shallowRef<KeyValueType[]>([]);
const initializationError = ref("");

const { t } = useI18n();
const { order, loadOrder } = useUserOrder();
const router = useRouter();

const breadcrumbs = computed<IBreadcrumbs[]>(() => [
  { title: t("common.links.home"), route: { name: "Home" } },
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  {
    title: t("pages.account.order_payment.processed_title", [order.value?.number]),
    route: { name: "OrderDetails", params: { orderId: props.orderId } },
  },
  { title: t("pages.account.order_payment.breadcrumb_title") },
]);

const isAuthorizeNetPaymentMethod = computed<boolean>(() =>
  (order.value?.inPayments[0]?.gatewayCode?.toLowerCase() ?? "").includes("authorizenet")
);

function tryAgain() {
  location.reload();
}

async function initPayment() {
  // If the order is paid
  if (order.value?.inPayments[0]?.isApproved) {
    await router.replace({ name: "OrderDetails", params: { orderId: props.orderId } });
    return;
  }

  const {
    isSuccess,
    paymentActionType,
    actionRedirectUrl,
    publicParameters = [],
    errorMessage = "",
  } = await initializePayment({
    orderId: order.value!.id,
    paymentId: order.value!.inPayments[0].id,
  });

  if (!isSuccess) {
    initializationError.value = errorMessage;
    return;
  }

  parameters.value = publicParameters;

  if (paymentActionType === PaymentActionType.Redirection && actionRedirectUrl) {
    location.href = actionRedirectUrl;
  }

  initialized.value = true;
}

watchEffect(() => {
  if (props.orderId === order.value?.id) {
    initPayment();
  } else {
    loadOrder({ id: props.orderId });
  }
});
</script>
