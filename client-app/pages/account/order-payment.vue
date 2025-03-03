<template>
  <div v-if="order">
    <VcEmptyPage
      v-if="executed"
      :icon="success ? 'outline-payment-successful' : 'outline-payment-failed'"
      image="basket.jpg"
      :status-color="success ? 'success' : 'danger'"
      :has-bg-image="false"
      bg-color="transparent"
      no-padding
    >
      <!-- Successful payment -->
      <template v-if="success">
        <VcTypography tag="h1" class="order-first mb-3">
          {{ $t("pages.account.order_payment.success.title") }}
        </VcTypography>

        <VcTypography tag="h4">
          {{ $t("pages.account.order_payment.processed_title", [order.number]) }}
        </VcTypography>

        <div class="gap-x-4 md:flex">
          <div class="text-sm">
            <span class="font-bold">
              {{ $t("pages.account.order_payment.order_date") }}
            </span>
            {{ $d(order.createdDate) }}
          </div>

          <div class="text-sm">
            <span class="font-bold">
              {{ $t("pages.account.order_payment.status_label") }}
            </span>

            {{ order.statusDisplayValue }}
          </div>
        </div>

        <p class="mb-8 mt-4 max-w-md text-base">
          {{ $t("pages.account.order_payment.success.text") }}
        </p>

        <div class="flex flex-wrap justify-center gap-5 sm:justify-start">
          <VcButton
            :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
            variant="outline"
            prepend-icon="chevron-left"
          >
            {{ $t("pages.account.order_payment.back_to_order_button") }}
          </VcButton>

          <VcButton :to="{ name: 'Orders', replace: true }" class="sm:min-w-40">
            {{ $t("pages.account.order_payment.orders_list_button") }}
          </VcButton>

          <VcButton :external-link="continue_shopping_link">
            {{ $t("pages.account.order_payment.continue_shopping_button") }}
          </VcButton>
        </div>
      </template>

      <!-- Payment failure -->
      <template v-else-if="failure">
        <VcTypography tag="h1" class="order-first mb-3">
          {{ $t("pages.account.order_payment.failure.title") }}
        </VcTypography>

        <VcTypography tag="h4">
          {{ $t("pages.account.order_payment.processed_title", [order.number]) }}
        </VcTypography>

        <!-- Subtitle block -->
        <div class="gap-x-4 md:flex">
          <div class="text-sm">
            <span class="font-bold">
              {{ $t("pages.account.order_payment.order_date") }}
            </span>
            {{ $d(order.createdDate) }}
          </div>

          <div class="text-sm">
            <span class="font-bold">
              {{ $t("pages.account.order_payment.status_label") }}
            </span>

            {{ order.statusDisplayValue }}
          </div>
        </div>

        <div class="mb-8 mt-4 max-w-md text-base">
          {{ $t("pages.account.order_payment.failure.text") }}
        </div>

        <div class="flex flex-wrap justify-center gap-3 sm:justify-start">
          <VcButton min-width="12rem" prepend-icon="reset" @click="tryAgain">
            {{ $t("pages.account.order_payment.try_again_button") }}
          </VcButton>

          <VcButton
            :to="{ name: 'OrderDetails', params: { orderId }, replace: true }"
            variant="outline"
            prepend-icon="chevron-left"
          >
            {{ $t("pages.account.order_payment.back_to_order_button") }}
          </VcButton>
        </div>
      </template>
    </VcEmptyPage>

    <template v-else>
      <VcBreadcrumbs :items="breadcrumbs" />

      <VcTypography tag="h1" class="mb-5 mt-3">
        {{ $t("pages.account.order_payment.title") }}
      </VcTypography>

      <VcLayout sidebar-position="right">
        <VcWidget size="lg">
          <!-- region Billing address -->
          <h5 class="mb-1 font-black">
            {{ $t("pages.account.order_payment.billing_address_label") }}
          </h5>

          <div class="mb-6 rounded border">
            <div class="flex flex-row justify-between space-x-3 p-4 md:p-5">
              <!-- TODO: create an atom component to display address -->
              <div class="min-w-0 text-sm">
                <span class="line-clamp-2 font-black">
                  {{ payment?.billingAddress?.firstName }}
                  {{ payment?.billingAddress?.lastName }}
                </span>

                <p class="line-clamp-3">
                  {{ payment?.billingAddress?.countryCode }}
                  {{ payment?.billingAddress?.regionName }}
                  {{ payment?.billingAddress?.city }}
                  {{ payment?.billingAddress?.line1 }}
                  {{ payment?.billingAddress?.line2 }}
                  {{ payment?.billingAddress?.postalCode }}
                </p>

                <p class="truncate">
                  <span class="font-black">
                    {{ $t("pages.account.order_payment.phone_label") }}
                  </span>
                  {{ payment?.billingAddress?.phone }}
                </p>

                <p class="truncate">
                  <span class="font-black">
                    {{ $t("pages.account.order_payment.email_label") }}
                  </span>
                  {{ payment?.billingAddress?.email }}
                </p>
              </div>

              <div class="self-start md:self-center">
                <VcButton
                  :disabled="loading"
                  :loading="changeAddressLoading"
                  size="sm"
                  variant="outline"
                  class="!hidden self-start md:!inline-flex"
                  @click="showEditAddressModal"
                >
                  {{ $t("pages.account.order_payment.edit_button") }}
                </VcButton>

                <VcButton
                  :disabled="loading"
                  class="md:!hidden"
                  size="sm"
                  icon="edit"
                  variant="outline"
                  @click="loading ? null : showEditAddressModal()"
                />
              </div>
            </div>
          </div>
          <!-- endregion Billing address -->

          <!-- region Payment method -->
          <h5 class="mb-1 font-black">
            {{ $t("pages.account.order_payment.payment_method_label") }}
          </h5>

          <div class="rounded border">
            <div class="flex flex-row items-center justify-between space-x-3 p-4 shadow-lg md:p-5">
              <div class="min-w-0 truncate">
                <template v-if="isPaymentAvailable && payment?.paymentMethod">
                  <VcImage
                    :src="payment.paymentMethod.logoUrl"
                    class="mr-3.5 inline-block size-8 object-center md:size-9"
                    lazy
                  />

                  <span>{{ $t(`common.methods.payment_by_code.${payment.paymentMethod.code}`) }}</span>
                </template>
                <template v-else>
                  <VcImage src="select-payment.svg" class="mr-3.5 inline-block size-10 object-center md:size-12" lazy />

                  <span>{{ $t("common.placeholders.select_payment_method") }}</span>
                </template>
              </div>

              <div>
                <VcButton
                  :disabled="loading"
                  :loading="changeMethodLoading"
                  size="sm"
                  variant="outline"
                  class="!hidden self-start px-5 font-bold uppercase md:!inline-flex"
                  @click="showChangePaymentMethodModal"
                >
                  {{ $t("pages.account.order_payment.edit_button") }}
                </VcButton>

                <VcButton
                  :disabled="loading"
                  class="md:!hidden"
                  size="sm"
                  icon="edit"
                  variant="outline"
                  @click="loading ? null : showChangePaymentMethodModal()"
                />
              </div>
            </div>

            <div class="p-5 md:p-6">
              <PaymentProcessingRedirection
                v-if="paymentMethodType === PaymentActionType.Redirection"
                :order="order"
                :disabled="loading"
              />

              <template v-else-if="isPaymentAvailable">
                <PaymentProcessingManual v-if="paymentMethodCode === 'DefaultManualPaymentMethod'" />

                <PaymentProcessingAuthorizeNet
                  v-if="paymentMethodCode === 'AuthorizeNetPaymentMethod'"
                  :order="order"
                  :disabled="loading"
                  @success="success = true"
                  @fail="failure = true"
                />

                <PaymentProcessingSkyflow
                  v-if="paymentMethodCode === 'SkyflowPaymentMethod'"
                  :order="order"
                  @success="success = true"
                  @fail="failure = true"
                />

                <PaymentProcessingCyberSource
                  v-if="paymentMethodCode === 'CyberSourcePaymentMethod'"
                  :order="order"
                  @success="success = true"
                  @fail="failure = true"
                />
              </template>
              <template v-else>
                {{ $t("pages.account.order_payment.failure.title") }}
                <ContactAdministratorLink />.
              </template>
            </div>
          </div>
          <!-- endregion Payment method -->
        </VcWidget>

        <!-- Sidebar -->
        <template #sidebar>
          <OrderSummary :cart="order" />
        </template>
      </VcLayout>
    </template>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { computed, ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs, usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { useUserOrder } from "@/shared/account";
import { OrderSummary, SelectPaymentMethodModal } from "@/shared/checkout";
import { ContactAdministratorLink } from "@/shared/common";
import { useModal } from "@/shared/modal";
import { PaymentActionType, PaymentProcessingManual, PaymentProcessingRedirection } from "@/shared/payment";
import type { MemberAddressType, OrderPaymentMethodType, PaymentInType } from "@/core/api/graphql/types";
import type { Optional } from "utility-types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";
import PaymentProcessingAuthorizeNet from "@/shared/payment/components/payment-processing-authorize-net.vue";
import PaymentProcessingCyberSource from "@/shared/payment/components/payment-processing-cyber-source.vue";
import PaymentProcessingSkyflow from "@/shared/payment/components/payment-processing-skyflow.vue";

interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const success = ref(false);
const failure = ref(false);
const changeAddressLoading = ref(false);
const changeMethodLoading = ref(false);

const { t } = useI18n();
const { loading, order, fetchShortOrder, fetchFullOrder, addOrUpdatePayment } = useUserOrder();
const { openModal, closeModal } = useModal();
const router = useRouter();

usePageHead({
  title: computed(() => [
    t("pages.account.order_details.meta.title", [order.value?.number]),
    t("pages.account.order_payment.meta.title"),
  ]),
});

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("common.links.orders"), route: { name: "Orders" } },
  {
    title: t("pages.account.order_payment.processed_title", [order.value?.number]),
    route: { name: "OrderDetails", params: { orderId: props.orderId } },
  },
  { title: t("pages.account.order_payment.breadcrumb_title") },
]);

const isPaymentAvailable = computed(() => {
  return order.value?.availablePaymentMethods?.some((method) => {
    return method.code === payment.value?.paymentMethod?.code;
  });
});

const executed = computed<boolean>(() => success.value || failure.value);
const payment = computed<PaymentInType | undefined>(() => order.value?.inPayments?.[0]);
const paymentMethodType = computed<number | undefined>(() => payment.value?.paymentMethod?.paymentMethodType);
const paymentMethodCode = computed<string | undefined>(() => payment.value?.paymentMethod?.code);

function tryAgain() {
  location.reload();
}

function showEditAddressModal() {
  openModal({
    component: AddOrUpdateAddressModal,
    props: {
      address: payment.value?.billingAddress,
      async onResult(address: Optional<MemberAddressType, "isFavorite" | "isDefault" | "description">) {
        closeModal();
        changeAddressLoading.value = true;

        const billingAddress = cloneDeep(address);
        delete billingAddress.isFavorite;
        delete billingAddress.isDefault;
        delete billingAddress.description;

        await addOrUpdatePayment({
          orderId: props.orderId,
          payment: {
            id: payment.value!.id,
            billingAddress,
          },
        });

        changeAddressLoading.value = false;
      },
    },
  });
}

function showChangePaymentMethodModal(): void {
  openModal({
    component: SelectPaymentMethodModal,
    props: {
      currentMethodCode: payment.value?.gatewayCode,
      availableMethods: order.value?.availablePaymentMethods,
      async onResult(method: OrderPaymentMethodType) {
        if (payment.value?.gatewayCode === method.code) {
          return;
        }

        changeMethodLoading.value = true;

        await addOrUpdatePayment({
          orderId: props.orderId,
          payment: {
            id: payment.value!.id,
            paymentGatewayCode: method.code,
          },
        });

        changeMethodLoading.value = false;
      },
    },
  });
}

watch(success, async (value) => {
  if (value) {
    await fetchShortOrder({ id: props.orderId });
  }
});

watchEffect(async () => {
  if (props.orderId !== order.value?.id) {
    await fetchFullOrder({ id: props.orderId });
  } else if (order.value?.inPayments?.[0]?.isApproved) {
    // If the order is paid
    await router.replace({ name: "OrderDetails", params: { orderId: props.orderId } });
  }
});
</script>
