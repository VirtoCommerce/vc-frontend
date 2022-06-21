<template>
  <div>
    <!-- Title block -->
    <div class="flex justify-between items-center mx-5 md:mx-0">
      <h2 class="text-gray-800 text-3xl font-bold uppercase" v-t="'pages.account.checkout_defaults.title'" />
    </div>

    <div class="bg-white shadow-sm md:rounded border px-7 py-7 md:px-9 md:py-8">
      <div v-if="!loading" class="flex flex-col lg:w-1/2">
        <div class="font-bold" v-t="'pages.account.checkout_defaults.select_delivery_method_label'"></div>

        <div class="mt-3 md:mt-1 flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-7">
          <VcRadioButton
            id="shipping"
            v-model="checkoutDefaults.deliveryMethod"
            value="shipping"
            :label="$t('pages.account.checkout_defaults.shipping_radio_label')"
          />

          <VcRadioButton
            id="pickup"
            v-model="checkoutDefaults.deliveryMethod"
            value="pickup"
            :label="$t('pages.account.checkout_defaults.pickup_radio_label')"
          />
        </div>

        <VcSelect
          v-model="checkoutDefaults.paymentMethod"
          text-field="code"
          :items="paymentMethods"
          :label="$t('pages.account.checkout_defaults.payment_method_label')"
          :placeholder="$t('pages.account.checkout_defaults.payment_method_placeholder')"
          class="mt-8 w-full"
          size="lg"
        >
          <template #first>{{ $t("pages.account.checkout_defaults.not_selected_placeholder") }}</template>
        </VcSelect>

        <VcSelect
          v-model="checkoutDefaults.shippingMethod"
          :items="shippingMethods"
          :label="$t('pages.account.checkout_defaults.shipping_method_label')"
          :placeholder="$t('pages.account.checkout_defaults.shipping_method_placeholder')"
          class="mt-8 w-full"
          size="lg"
        >
          <template #selected="{ item }">{{ item?.code }} {{ item?.optionName }}</template>
          <template #first>{{ $t("pages.account.checkout_defaults.not_selected_placeholder") }}</template>
          <template #item="{ item }"> {{ item?.code }} {{ item?.optionName }}</template>
        </VcSelect>

        <VcButton class="uppercase mt-8 px-12 self-center lg:self-start" @click="saveDefaults()">
          {{ $t("pages.account.checkout_defaults.update_button") }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserCheckoutDefaults, CheckoutDefaults, CheckoutDefaultsSuccessDialog } from "@/shared/account";
import { computed, onMounted, ref } from "vue";
import { useCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";

const { cart, loading } = useCart();

const shippingMethods = computed(() => cart.value.availableShippingMethods);

const paymentMethods = computed(() => cart.value.availablePaymentMethods);

const { getUserCheckoutDefaults, setUserCheckoutDefaults } = useUserCheckoutDefaults();
const { openPopup } = usePopup();

const checkoutDefaults = ref<CheckoutDefaults>({});

onMounted(() => {
  const savedDefaults = getUserCheckoutDefaults();

  if (savedDefaults) {
    checkoutDefaults.value = savedDefaults;
  }
});

function saveDefaults() {
  setUserCheckoutDefaults(checkoutDefaults.value);
  openPopup({
    component: CheckoutDefaultsSuccessDialog,
  });
}
</script>
