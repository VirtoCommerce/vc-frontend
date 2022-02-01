<template>
  <div class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 lg:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase">Checkout Defaults</h2>
          </div>
          <div class="bg-white shadow-sm rounded border px-7 py-7 md:px-9 md:py-8">
            <div v-if="!loading" class="flex flex-col lg:w-1/2">
              <div class="font-bold">Preferred Delivery Method</div>
              <div class="mt-3 md:mt-1 flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-7">
                <VcRadioButton
                  id="shipping"
                  v-model="checkoutDefaults.deliveryMethod"
                  value="shipping"
                  label="Shipping"
                />
                <VcRadioButton id="pickup" v-model="checkoutDefaults.deliveryMethod" value="pickup" label="Pickup" />
              </div>
              <VcSelect
                v-model="checkoutDefaults.paymentMethod"
                item-text-key="code"
                :items="paymentMethods"
                label="Preferred Payment Method"
                placeholder="Please select preferred Payment Method"
                class="mt-8 w-full"
              />
              <VcSelect
                v-model="checkoutDefaults.shippingMethod"
                :items="shippingMethods"
                label="Preferred Shipping Method"
                placeholder="Please select preferred Shipping Method"
                class="mt-8 w-full"
              >
                <template #selected="{ item }">{{ item?.code }} {{ item?.optionName }}</template>
                <template #item="{ item }">
                  <template v-if="item">{{ item?.code }} {{ item?.optionName }} </template>
                  <template v-else> &nbsp; </template>
                </template>
              </VcSelect>
              <VcButton class="uppercase mt-8 px-12 self-center lg:self-start" @click="saveDefaults()">Update</VcButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcRadioButton, Button as VcButton, VcSelect } from "@/components";
import {
  AccountNavigation,
  useUserCheckoutDefaults,
  CheckoutDefaults,
  CheckoutDefaultsSuccessDialog,
} from "@/shared/account";
import { computed, onMounted, Ref, ref, reactive } from "vue";
import { useCart } from "@/shared/cart";
import { usePopup } from "@/shared/popup";
import { ShippingMethodType, PaymentMethodType } from "@/core/api/graphql/types";

const { cart, loading } = useCart();

const shippingMethods = computed(() => {
  const result: Array<ShippingMethodType | undefined> = [undefined];

  if (cart.value.availableShippingMethods?.length) {
    result.push(...cart.value.availableShippingMethods);
  }

  return result;
});

const paymentMethods = computed(() => {
  const result: Array<PaymentMethodType | undefined> = [undefined];

  if (cart.value.availablePaymentMethods?.length) {
    result.push(...cart.value.availablePaymentMethods);
  }

  return result;
});

const { getUserCheckoutDefaults, setUserCheckoutDefaults } = useUserCheckoutDefaults();
const { openPopup } = usePopup();

let checkoutDefaults: Ref<CheckoutDefaults> = ref<CheckoutDefaults>({});

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
