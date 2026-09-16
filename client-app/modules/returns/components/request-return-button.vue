<template>
  <VcButton v-if="hasReturnableItems" variant="outline" prepend-icon="receipt-refund" @click="goToWizard">
    {{ $t("returns.request_button") }}
  </VcButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useGetReturnableItemsQuery } from "@/modules/returns/api/graphql/queries/getReturnableItems";

interface IProps {
  orderId: string;
}

const props = defineProps<IProps>();

const router = useRouter();

// The same query the wizard opens with, so asking here costs the wizard nothing later.
const { result } = useGetReturnableItemsQuery(computed(() => ({ orderId: props.orderId })));

const hasReturnableItems = computed(() => !!result.value?.returnableItems?.some((item) => item.isReturnable));

function goToWizard(): void {
  void router.push({ name: "SelectReturnItems", params: { orderId: props.orderId } });
}
</script>
