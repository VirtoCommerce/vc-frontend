<template>
  <span>{{ value?.formattedAmount ?? "N/A" }}</span>
</template>

<script setup lang="ts">
interface IProps {
  value?: Pick<VcMoneyType, "formattedAmount">;
}

defineProps<IProps>();
</script>
