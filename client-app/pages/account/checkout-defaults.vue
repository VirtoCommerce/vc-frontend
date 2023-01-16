<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.checkout_defaults.title'" />
    </div>

    <div class="bg-white shadow-sm md:rounded border px-7 py-7 md:px-9 md:py-8">
      <VcLoaderWithText v-if="loading" />

      <div v-else class="flex flex-col lg:w-1/2">
        <div class="font-bold" v-t="'pages.account.checkout_defaults.select_delivery_method_label'"></div>

        <div class="mt-3 md:mt-1 flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-7">
          <VcRadioButton
            id="shipping"
            v-model="localCheckoutDefaults.deliveryMethod"
            value="shipping"
            :label="$t('pages.account.checkout_defaults.shipping_radio_label')"
          />

          <VcRadioButton
            id="pickup"
            v-model="localCheckoutDefaults.deliveryMethod"
            value="pickup"
            :label="$t('pages.account.checkout_defaults.pickup_radio_label')"
          />
        </div>

        <VcSelect
          v-model="localCheckoutDefaults.paymentMethodCode"
          :items="paymentMethods"
          :label="$t('pages.account.checkout_defaults.payment_method_label')"
          :placeholder="$t('pages.account.checkout_defaults.payment_method_placeholder')"
          text-field="code"
          value-field="code"
          class="mt-8 w-full"
          size="lg"
        >
          <template #first>{{ $t("pages.account.checkout_defaults.not_selected_placeholder") }}</template>
        </VcSelect>

        <VcSelect
          v-model="localCheckoutDefaults.shippingMethodId"
          :items="shippingMethods"
          :label="$t('pages.account.checkout_defaults.shipping_method_label')"
          :placeholder="$t('pages.account.checkout_defaults.shipping_method_placeholder')"
          value-field="id"
          class="mt-8 w-full"
          size="lg"
        >
          <template #selected="{ item }">{{ item?.code }} {{ item?.optionName }}</template>
          <template #first>{{ $t("pages.account.checkout_defaults.not_selected_placeholder") }}</template>
          <template #item="{ item }"> {{ item?.code }} {{ item?.optionName }}</template>
        </VcSelect>

        <VcButton
          :is-disabled="!isDirty"
          class="uppercase mt-8 px-12 self-center lg:self-start"
          @click="saveDefaults()"
        >
          {{ $t("pages.account.checkout_defaults.update_button") }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { clone, isEqual } from "lodash";
import { PaymentMethodType, ShippingMethodType } from "@/xapi/types";
import { usePopup } from "@/shared/popup";
import { usePageHead } from "@/core/composables";
import { useCart } from "@/shared/cart";
import { useUserCheckoutDefaults, CheckoutDefaults, CheckoutDefaultsSuccessDialog } from "@/shared/account";

const { t } = useI18n();
const { openPopup } = usePopup();
const { cart, loading, fetchCart } = useCart();
const { getUserCheckoutDefaults, setUserCheckoutDefaults } = useUserCheckoutDefaults();

usePageHead({
  title: t("pages.account.checkout_defaults.meta.title"),
});

const savedCheckoutDefaults = ref<CheckoutDefaults>(getUserCheckoutDefaults());
const localCheckoutDefaults = ref<CheckoutDefaults>(clone(savedCheckoutDefaults.value));

const shippingMethods = computed<ShippingMethodType[]>(() => cart.value.availableShippingMethods ?? []);
const paymentMethods = computed<PaymentMethodType[]>(() => cart.value.availablePaymentMethods ?? []);

const isDirty = computed<boolean>(() => !isEqual(savedCheckoutDefaults.value, localCheckoutDefaults.value));

function saveDefaults() {
  setUserCheckoutDefaults(localCheckoutDefaults.value);

  savedCheckoutDefaults.value = clone(localCheckoutDefaults.value);

  openPopup({
    component: CheckoutDefaultsSuccessDialog,
  });
}

fetchCart();
</script>
