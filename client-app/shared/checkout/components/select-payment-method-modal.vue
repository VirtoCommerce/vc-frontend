<template>
  <VcModal :title="$t('shared.checkout.payment_method_modal.title')">
    <template #actions="{ close }">
      <VcButton min-width="8rem" variant="outline" color="secondary" @click="close">
        {{ $t("shared.checkout.payment_method_modal.cancel_button") }}
      </VcButton>

      <VcButton
        min-width="8rem"
        class="ms-auto"
        @click="
          $emit('result', selectedMethod);
          close();
        "
      >
        {{ $t("shared.checkout.payment_method_modal.ok_button") }}
      </VcButton>
    </template>

    <div class="divide-y rounded border">
      <div
        v-for="method in availableMethods"
        :key="method.code"
        class="flex items-center justify-between space-x-4 px-5 py-6 lg:py-4"
      >
        <VcImage :src="method.logoUrl" class="size-10 object-center" lazy />
        <div class="grow overflow-hidden text-ellipsis">
          {{ $t(`common.methods.payment_by_code.${method.code}`) }}
        </div>
        <div class="flex w-20 items-center justify-end lg:justify-center">
          <div
            v-if="method.code === selectedMethod?.code"
            class="flex size-6 items-center justify-center rounded-full bg-success-600 text-sm text-additional-50"
          >
            <VcIcon :size="16" name="check-bold" />
          </div>

          <VcButton v-else variant="outline" size="sm" class="flex-none" @click="setMethod(method)">
            {{ $t("shared.checkout.payment_method_modal.select_button") }}
          </VcButton>
        </div>
      </div>
    </div>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { PaymentMethodType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "result", value?: PaymentMethodType): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  availableMethods: () => [],
});

interface IProps {
  currentMethodCode?: string;
  availableMethods?: PaymentMethodType[];
  onResult?: () => undefined;
}

const availableMethods = computed(() => props.availableMethods);
const currentMethodCode = computed(() => props.currentMethodCode);

const currentMethod = availableMethods.value.find((item) => item.code === currentMethodCode.value);
const selectedMethod = ref(currentMethod);

function setMethod(method: PaymentMethodType): void {
  selectedMethod.value = method;
}
</script>
