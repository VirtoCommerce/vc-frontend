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

          <!-- Main content -->
          <template v-else>
            <!-- Billing address section -->
            <CheckoutLabeledBlock :label="$t('pages.account.order_payment.billing_address_label')">
              <!-- TODO: create an atom component to display address -->
              <div class="truncate">
                <span class="font-extrabold">
                  {{ payment?.billingAddress?.firstName }}
                  {{ payment?.billingAddress?.lastName }}
                </span>

                <p>
                  {{ payment?.billingAddress?.countryCode }}
                  {{ payment?.billingAddress?.regionName }}
                  {{ payment?.billingAddress?.city }} {{ payment?.billingAddress?.line1 }}
                  {{ payment?.billingAddress?.postalCode }}
                </p>

                <p>
                  <span class="font-extrabold" v-t="'pages.account.order_payment.phone_label'" />
                  {{ payment?.billingAddress?.phone }}
                </p>

                <p>
                  <span class="font-extrabold" v-t="'pages.account.order_payment.email_label'" />
                  {{ payment?.billingAddress?.email }}
                </p>
              </div>

              <!--
              <div>
                <VcButton size="sm" is-outline class="px-5 self-start uppercase font-bold">
                  {{ $t("pages.account.order_payment.edit_button") }}
                </VcButton>
              </div>
              -->
            </CheckoutLabeledBlock>

            <h5 class="mb-1 font-extrabold" v-t="'shared.payment.payment_method_section.header'" />

            <!-- Loader -->
            <div v-if="!initialized" class="flex items-center gap-2 rounded border px-6 py-5">
              <VcLoader class="inline-block h-6 w-6 text-[color:var(--color-primary)]" />

              <span class="font-extrabold animate-pulse">
                {{ $t("shared.payment.payment_method_section.loading_text") }}
              </span>
            </div>

            <!-- Initialization Error -->
            <template v-else-if="initializationError">
              <p class="mb-6 rounded border px-6 py-5 font-bold text-[color:var(--color-danger)]">
                {{ initializationError }}
              </p>

              <div class="flex flex-col md:flex-row gap-x-5 gap-y-4">
                <VcButton
                  :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
                  class="px-4 uppercase"
                  is-outline
                >
                  <i class="fas fa-arrow-left -ml-1 mr-2.5" />
                  {{ $t("pages.account.order_payment.back_to_order_button") }}
                </VcButton>

                <VcButton class="px-5 uppercase md:w-32" @click="tryAgain">
                  {{ $t("pages.account.order_payment.try_again_button") }}
                </VcButton>
              </div>
            </template>

            <PaymentProcessingAuthorizeNet
              v-else-if="isAuthorizeNetPaymentMethod"
              :order="order"
              :parameters="parameters"
              @success="success = true"
              @fail="failure = true"
            >
              <template #header>
                <div class="px-6 py-5 shadow-lg">
                  <svg width="43" height="37" class="inline-block text-gray-400 opacity-80 mr-5">
                    <use href="/static/images/payment/bank-card.svg#main" />
                  </svg>

                  <span>{{ $t("pages.account.order_payment.bank_card_title") }}</span>
                </div>
              </template>

              <template #footer="slotData">
                <div class="flex flex-col md:flex-row items-center justify-between gap-x-10 mt-6">
                  <p class="text-sm text-gray-500">
                    {{ $t("shared.payment.payment_method_section.accept_terms_text") }}

                    <router-link
                      to="/agreement"
                      class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
                    >
                      {{ $t("shared.payment.payment_method_section.user_agreement_link") }}
                    </router-link>

                    {{ $t("shared.payment.payment_method_section.processing_personal_data_text") }}

                    <router-link
                      to="/policy"
                      class="text-[color:var(--color-link)] hover:text-[color:var(--color-link-hover)]"
                    >
                      {{ $t("shared.payment.payment_method_section.privacy_policy_link") }}
                    </router-link>
                  </p>

                  <VcButton
                    :is-disabled="!slotData.valid"
                    :is-waiting="slotData.loading"
                    @click="slotData.submit"
                    size="lg"
                    class="shrink-0 uppercase w-48"
                  >
                    {{ $t("shared.payment.payment_method_section.pay_now_button") }}
                  </VcButton>
                </div>
              </template>
            </PaymentProcessingAuthorizeNet>
          </template>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="flex flex-col px-5 mb-6 order-first md:px-0 lg:mb-0 lg:order-1 lg:w-1/4">
        <OrderSummary :cart="order" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watchEffect } from "vue";
import { KeyValueType, PaymentInType } from "@/xapi/graphql/types";
import { CheckoutLabeledBlock, OrderSummary } from "@/shared/checkout";
import { PaymentProcessingAuthorizeNet, PaymentActionType, PaymentFailure, PaymentSuccess } from "@/shared/payment";
import { useI18n } from "vue-i18n";
import { initializePayment } from "@/xapi/graphql/cart";
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

const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments[0]);

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
  (payment.value?.gatewayCode?.toLowerCase() ?? "").includes("authorizenet")
);

function tryAgain() {
  location.reload();
}

async function initPayment() {
  // If the order is paid
  if (payment.value?.isApproved) {
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
    paymentId: payment.value!.id,
  });

  if (!isSuccess) {
    initializationError.value = errorMessage;
    initialized.value = true;
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
