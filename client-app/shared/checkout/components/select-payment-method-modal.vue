<template>
  <VcPopup :title="$t('shared.checkout.payment_method_dialog.title')">
    <template #actions="{ close }">
      <VcButton variant="outline" color="secondary" @click="close">
        {{ $t("shared.checkout.payment_method_dialog.cancel_button") }}
      </VcButton>

      <VcButton
        class="ms-auto"
        @click="
          $emit('result', selectedMethod);
          close();
        "
      >
        {{ $t("shared.checkout.payment_method_dialog.ok_button") }}
      </VcButton>
    </template>

    <template v-for="method in availableMethods" :key="method.code">
      <div class="flex items-center justify-between space-x-4 border-b border-gray-300 px-5 py-6 lg:py-4">
        <VcImage :src="method.logoUrl" class="h-10 w-10 object-center" lazy />
        <div class="grow overflow-hidden text-ellipsis">
          {{ $t(`common.methods.payment_by_code.${method.code}`) }}
        </div>
        <div class="flex w-20 items-center justify-end lg:justify-center">
          <div
            v-if="method.code === selectedMethod?.code"
            class="flex h-6 w-6 items-center justify-center rounded-full bg-[--color-success-600] text-sm text-[--color-additional-50]"
          >
            <VcIcon :size="16" name="check-bold" />
          </div>

          <VcButton v-else variant="outline" size="sm" class="flex-none" @click="setMethod(method)">
            {{ $t("shared.checkout.payment_method_dialog.select_button") }}
          </VcButton>
        </div>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { PaymentMethodType } from "@/core/api/graphql/types";
import type { PropType } from "vue";

defineEmits(["result"]);

const props = defineProps({
  currentMethodCode: {
    type: String,
    default: undefined,
  },

  availableMethods: {
    type: Array as PropType<PaymentMethodType[]>,
    default: () => [],
  },

  onResult: {
    type: Function,
    default: undefined,
  },
});

const currentMethod = props.availableMethods.find((item) => item.code === props.currentMethodCode);
const selectedMethod = ref(currentMethod);

function setMethod(method: PaymentMethodType): void {
  selectedMethod.value = method;
}
</script>
