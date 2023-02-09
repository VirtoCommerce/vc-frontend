<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 v-t="'pages.account.checkout_defaults.title'" class="text-gray-800 text-3xl font-bold uppercase" />
    </div>

    <div class="bg-white shadow-sm md:rounded border px-7 py-7 md:px-9 md:py-8">
      <VcLoaderWithText v-if="loading" />

      <div v-else class="flex flex-col lg:w-1/2">
        <div v-t="'pages.account.checkout_defaults.select_delivery_method_label'" class="font-bold"></div>

        <div class="mt-3 md:mt-1 flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-7">
          <VcRadioButton
            v-model="localCheckoutDefaults.deliveryMethod"
            value="shipping"
            :label="$t('pages.account.checkout_defaults.shipping_radio_label')"
          />

          <VcRadioButton
            v-model="localCheckoutDefaults.deliveryMethod"
            value="pickup"
            :label="$t('pages.account.checkout_defaults.pickup_radio_label')"
          />
        </div>

        <VcSelect
          v-model="localCheckoutDefaults.paymentMethodCode"
          :items="availablePaymentMethods"
          :label="$t('pages.account.checkout_defaults.payment_method_label')"
          value-field="code"
          class="mt-8 w-full"
          size="auto"
        >
          <template #placeholder>
            <VcSelectItem>
              <VcSelectItemImage src="/static/icons/placeholders/select-payment.svg" class="bg-gray-100/80" />
              <VcSelectItemText>
                {{ $t("common.placeholders.select_payment_method") }}
              </VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #selected="{ item }">
            <VcSelectItem>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ item.code }}</VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #item="{ item }">
            <VcSelectItem bordered>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ item.code }}</VcSelectItemText>
            </VcSelectItem>
          </template>
        </VcSelect>

        <VcSelect
          v-model="localCheckoutDefaults.shippingMethodId"
          :items="availableShippingMethods"
          :label="$t('pages.account.checkout_defaults.shipping_method_label')"
          value-field="id"
          class="mt-8 w-full"
          size="auto"
        >
          <template #placeholder>
            <VcSelectItem>
              <VcSelectItemImage src="/static/icons/placeholders/select-shipping.svg" class="bg-gray-100/80" />
              <VcSelectItemText>
                {{ $t("common.placeholders.select_delivery_method") }}
              </VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #selected="{ item }">
            <VcSelectItem>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ item.code }} {{ item.optionName }}</VcSelectItemText>
            </VcSelectItem>
          </template>

          <template #item="{ item }">
            <VcSelectItem bordered>
              <VcSelectItemImage :src="item.logoUrl" />
              <VcSelectItemText>{{ item.code }} {{ item.optionName }}</VcSelectItemText>
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
