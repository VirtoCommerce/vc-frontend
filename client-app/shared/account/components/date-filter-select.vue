<template>
  <VcSelect
    v-model="selectedDateFilter"
    :items="dateFilterTypes"
    text-field="label"
    @change="$emit('change', selectedDateFilter)"
  />
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue";
import { useUserOrdersFilter } from "../composables";
import type { DateFilterType } from "@/core/types";

interface IEmits {
  (event: "change", dateFilterType: DateFilterType): void;
}

interface IProps {
  dateFilterType?: DateFilterType;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const { dateFilterTypes } = useUserOrdersFilter();

const { dateFilterType } = toRefs(props);

const selectedDateFilter = ref<DateFilterType>(dateFilterType.value ?? dateFilterTypes.value[0]);
</script>
