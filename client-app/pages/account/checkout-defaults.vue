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
            <h2 class="text-gray-800 text-3xl font-bold uppercase">Checkout defaults</h2>
          </div>
          <div class="bg-white shadow-sm rounded border px-9 py-8">
            <div class="flex flex-col lg:w-1/2">
              <div class="font-bold">Preferred Delivery Method</div>
              <div class="mt-3 md:mt-1 flex flex-col space-y-5 md:space-y-0 md:flex-row md:space-x-7">
                <Radio
                  id="shipping"
                  v-model="checkoutDefaults.deliveryMethod"
                  value="shipping"
                  label="Shipping"
                ></Radio>
                <Radio id="pickup" v-model="checkoutDefaults.deliveryMethod" value="pickup" label="Pickup"></Radio>
              </div>
              <div class="font-bold mt-8">Preferred Payment Method</div>
              <select
                v-model="checkoutDefaults.paymentMethod"
                class="appearance-none rounded px-3 py-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400"
                placeholder="Please select preferred Payment Method"
              >
                <option value=""></option>
                <option v-for="method in paymentMethods" :key="method.code" :value="method">
                  {{ method.code }}
                </option>
              </select>
              <div class="font-bold mt-8">Preferred Shipping Method</div>
              <select
                v-model="checkoutDefaults.shippingMethod"
                class="appearance-none rounded px-3 py-3 text-base leading-none box-border border border-gray-300 w-full outline-none focus:border-gray-400"
                placeholder="Please select preferred Shipping Method"
              >
                <option value=""></option>
                <option v-for="method in shippingMethods" :key="method.id" :value="method">
                  {{ method.code }} {{ method.optionName }}
                </option>
              </select>
              <VcButton class="uppercase mt-8 px-12 self-center lg:self-start" @click="saveDefaults()">Update</VcButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Radio, Button as VcButton } from "@/components";
import { AccountNavigation, useUserCheckoutDefaults, CheckoutDefaults } from "@/shared/account";
import { computed, onMounted, Ref, ref, reactive } from "vue";
import { useCart } from "@/shared/cart";

const { cart, loading } = useCart();

const shippingMethods = computed(() => cart.value.availableShippingMethods);
const paymentMethods = computed(() => cart.value.availablePaymentMethods);

const { getUserCheckoutDefaults, setUserCheckoutDefaults } = useUserCheckoutDefaults();

let checkoutDefaults: Ref<CheckoutDefaults> = ref<CheckoutDefaults>({});

onMounted(() => {
  const savedDefaults = getUserCheckoutDefaults();
  if (savedDefaults) {
    checkoutDefaults.value = savedDefaults;
  }
});

function saveDefaults() {
  setUserCheckoutDefaults(checkoutDefaults.value);
}
</script>
