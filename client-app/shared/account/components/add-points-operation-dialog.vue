<template>
  <VcPopup :title="$t('shared.account.add_points_operation_dialog.title')">
    <slot name="prepend" v-bind="slotsData" />
    <div class="flex justify-center items-center px-5 py-10">
      <VcInput
        v-model="amount"
        :label="$t('shared.account.add_points_operation_dialog.amount')"
        :error-message="errors.amount"
        type="number"
        is-required
        class="px-5"
      ></VcInput>
      <VcInput
        v-model="reason"
        :label="$t('shared.account.add_points_operation_dialog.reason')"
        :error-message="errors.reason"
        is-required
        class="px-5"
      ></VcInput>
    </div>
    <template #actions="{ close }">
      <VcButton class="uppercase flex-grow lg:flex-grow-0 inline-flex px-4" @click="addPoints">
        <span v-t="'shared.account.add_points_operation_dialog.buttons.add_points_operation'"></span>
      </VcButton>
      <VcButton is-outline kind="secondary" class="px-4 uppercase flex-grow lg:flex-grow-0 inline-flex" @click="close">
        <span v-t="'shared.account.add_points_operation_dialog.buttons.cancel'"></span>
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcButton, VcPopup, VcInput } from "@/components";
import { useUserBalance } from "@/shared/account";
import { usePopup } from "@/shared/popup";
import { computed } from "@vue/runtime-dom";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";

const { addPointsOperation } = useUserBalance();
const { closePopup } = usePopup();
const { errors, validate } = useForm();
const { value: amount } = useField<number>("amount", yup.number().max(100000).min(-100000).not([0]).required());
const { value: reason } = useField<string>("reason", yup.string().max(128).required());

const slotsData = computed(() => ({
  errors,
  validate,
}));

const emit = defineEmits(["result"]);

const addPoints = async () => {
  await addPointsOperation(reason.value, amount.value);
  emit("result");
  closePopup();
};
</script>
