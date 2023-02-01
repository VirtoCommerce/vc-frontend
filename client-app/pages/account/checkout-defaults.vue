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
          :items="availablePaymentMethods"
          :label="$t('pages.account.checkout_defaults.payment_method_label')"
          text-field="code"
          value-field="code"
          class="mt-8 w-full"
          size="lg"
        >
          <template #placeholder>
            <VcSelectItem>
              <VcSelectImage src="/static/icons/placeholder/select-payment.svg" />
              <VcSelectText>
                {{ $t("common.placeholders.not_selected_payment_method") }}
              </VcSelectText>
            </VcSelectItem>
          </template>

          <template #selected="{ item }">
            <VcSelectItem>
              <VcSelectImage :src="item.logoUrl" />
              <VcSelectText>
                {{ item?.code }}
              </VcSelectText>
            </VcSelectItem>
          </template>

          <template #item="{ item }">
            <VcSelectItem bordered>
              <VcSelectImage :src="item.logoUrl" />
              <VcSelectText>
                {{ item?.code }}
              </VcSelectText>
            </VcSelectItem>
          </template>
        </VcSelect>

        <VcSelect
          v-model="localCheckoutDefaults.shippingMethodId"
          :items="availableShippingMethods"
          :label="$t('pages.account.checkout_defaults.shipping_method_label')"
          value-field="id"
          class="mt-8 w-full"
          size="lg"
        >
          <template #placeholder>
            <VcSelectItem>
              <VcSelectImage src="/static/icons/placeholder/select-shipping.svg" />
              <VcSelectText>
                {{ $t("common.placeholders.not_selected_shippping_method") }}
              </VcSelectText>
            </VcSelectItem>
          </template>

          <template #selected="{ item }">
            <VcSelectItem>
              <VcSelectImage :src="item.logoUrl" />
              <VcSelectText>
                {{ `${item?.code} ${item?.optionName}` }}
              </VcSelectText>
            </VcSelectItem>
          </template>

          <template #item="{ item }">
            <VcSelectItem bordered>
              <VcSelectImage :src="item.logoUrl" />
              <VcSelectText>
                {{ `${item?.code} ${item?.optionName}` }}
              </VcSelectText>
            </VcSelectItem>
          </template>
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
import { usePopup } from "@/shared/popup";
import { usePageHead } from "@/core/composables";
import { useCart } from "@/shared/cart";
import { useUserCheckoutDefaults, CheckoutDefaults, CheckoutDefaultsSuccessDialog } from "@/shared/account";

const { t } = useI18n();
const { openPopup } = usePopup();
const { loading, availableShippingMethods, availablePaymentMethods, fetchCart } = useCart();
const { getUserCheckoutDefaults, setUserCheckoutDefaults } = useUserCheckoutDefaults();

usePageHead({
  title: t("pages.account.checkout_defaults.meta.title"),
});

const savedCheckoutDefaults = ref<CheckoutDefaults>(getUserCheckoutDefaults());
const localCheckoutDefaults = ref<CheckoutDefaults>(clone(savedCheckoutDefaults.value));

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
