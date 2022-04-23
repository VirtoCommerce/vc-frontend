<template>
  <div class="flex flex-col">
    <div class="flex flex-col lg:flex-row lg:space-x-14">
      <div class="flex flex-col space-y-4">
        <div class="font-bold text-gray-400">Status filter</div>
        <VcCheckbox class="" v-for="status in statuses" :key="status" v-model="selectedStatuses" :value="status">
          {{ status }}
        </VcCheckbox>
      </div>
      <div class="flex flex-col space-y-2">
        <div class="font-bold text-gray-400">Created date</div>
        <div>
          <VcDateSelector v-model="startDate" label="Start date"></VcDateSelector>
        </div>
        <div>
          <VcDateSelector v-model="endDate" label="End date"></VcDateSelector>
        </div>
      </div>
    </div>
    <div class="mt-8 flex justify-end space-x-3">
      <VcButton class="uppercase px-8" kind="secondary" is-outline size="sm">{{ $t("common.buttons.reset") }}</VcButton>
      <VcButton class="uppercase px-8" size="sm">Apply</VcButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { VcCheckbox, VcDateSelector, VcButton } from "@/components";
import { Ref, ref } from "vue";
const statuses = ["New", "Processed", "Panding", "Canceled"];
const selectedStatuses: Ref<string[]> = ref([]);
const startDate: Ref<string | undefined> = ref(undefined);
const endDate: Ref<string | undefined> = ref(undefined);
</script>
