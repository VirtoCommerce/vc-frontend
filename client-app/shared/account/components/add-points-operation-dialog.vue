<template>
  <VcPopup title="Add New Points Operation">
    <div class="flex justify-center items-center px-5 py-10">
      <form @submit="onSubmit">
        <VcInput v-model="reason" name="reason" label="Reason" is-required></VcInput>
        <VcInput v-model="amount" name="amount" label="Amount" type="number" is-required></VcInput>
      </form>
    </div>
    <template #actions="{ close }">
      <VcButton class="uppercase flex-grow lg:flex-grow-0 inline-flex px-4" is-submit @click="addPointsOperation">
        Submit
      </VcButton>
      <VcButton is-outline kind="secondary" class="px-4 uppercase flex-grow lg:flex-grow-0 inline-flex" @click="close">
        Cancel
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup language="ts">
import { VcButton, VcPopup, VcInput } from "@/components";
import { ref } from "vue";
import { useUserBalance } from "@/shared/account";
import { usePopup } from "@/shared/popup";

const { registerPointsOperation, loadBalance, searchBalancePointsOperations } = useUserBalance();
const { closePopup } = usePopup();

const reason = ref(null);
const amount = ref(0);

const addPointsOperation = async () => {
  await registerPointsOperation(reason.value, amount.value);
  closePopup();
  await loadBalance();
  await searchBalancePointsOperations();
};
</script>
