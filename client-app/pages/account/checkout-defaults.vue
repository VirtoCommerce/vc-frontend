<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between">
      <h2 v-t="'pages.account.checkout_defaults.title'" class="text-3xl font-bold uppercase text-neutral-900" />
    </div>

    <VcWidget size="lg">
      <VcLoaderWithText v-if="loading" />

      <div v-else class="flex flex-col lg:w-1/2">
        <div v-t="'pages.account.checkout_defaults.select_delivery_method_label'" class="font-bold"></div>

        <div class="mt-3 flex flex-col space-y-5 md:mt-1 md:flex-row md:space-x-7 md:space-y-0">
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
            <div class="flex items-center gap-3 p-3 text-sm">
              <VcImage
                class="h-12 w-12 rounded-sm bg-[--color-neutral-100]"
                src="/static/icons/placeholders/select-payment.svg"
              />

              {{ $t("common.placeholders.select_payment_method") }}
            </div>
          </template>

          <template #selected="{ item }">
            <div class="flex items-center gap-3 p-3 text-sm">
              <VcImage class="h-12 w-12 rounded-sm" :src="item.logoUrl" />

              {{ $t(`common.methods.payment_by_code.${item.code}`) }}
            </div>
          </template>

          <template #item="{ item }">
            <VcImage class="h-12 w-12 rounded-sm" :src="item.logoUrl" />

            {{ $t(`common.methods.payment_by_code.${item.code}`) }}
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
            <div class="flex items-center gap-3 p-3 text-sm">
              <VcImage
                class="h-12 w-12 rounded-sm bg-[--color-neutral-100]"
                src="/static/icons/placeholders/select-shipping.svg"
              />

              {{ $t("common.placeholders.select_delivery_method") }}
            </div>
          </template>

          <template #selected="{ item }">
            <div class="flex items-center gap-3 p-3 text-sm">
              <VcImage class="h-12 w-12 rounded-sm" :src="item.logoUrl" />

              {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
            </div>
          </template>

          <template #item="{ item }">
            <VcImage class="h-12 w-12 rounded-sm" :src="item.logoUrl" />

            {{ $t(`common.methods.delivery_by_id.${item.id}`) }}
          </template>
        </VcSelect>

        <VcButton :disabled="!isDirty" class="mt-8 self-center lg:self-start" @click="saveDefaults()">
          {{ $t("pages.account.checkout_defaults.update_button") }}
        </VcButton>
      </div>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { clone, isEqual } from "lodash";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { useUserCheckoutDefaults, CheckoutDefaultsSuccessModal } from "@/shared/account";
import { useFullCart } from "@/shared/cart";
import { useModal } from "@/shared/modal";
import type { CheckoutDefaults } from "@/shared/account";

const { t } = useI18n();
const { openModal } = useModal();
const { loading, availableShippingMethods, availablePaymentMethods, forceFetch } = useFullCart();
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

  openModal({
    component: CheckoutDefaultsSuccessModal,
  });
}

forceFetch();
</script>
