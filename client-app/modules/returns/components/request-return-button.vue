<template>
  <!-- Held in place while the answer is in flight, so resolving it does not shift Print and Reorder. -->
  <VcButton
    v-if="eligible && (loading || hasReturnableItems)"
    variant="outline"
    prepend-icon="receipt-refund"
    :loading="loading"
    :disabled="loading"
    class="min-w-[10.5rem]"
    @click="goToWizard"
  >
    {{ $t("returns.request_button") }}
  </VcButton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useGetReturnableItemsQuery } from "@/modules/returns/api/graphql/queries/getReturnableItems";
import { useReturnPolicy } from "@/modules/returns/composables/useReturnPolicy";

interface IProps {
  orderId: string;
  orderStatus?: string;
}

const props = defineProps<IProps>();

const router = useRouter();

const { allowsOrderStatus } = useReturnPolicy();

// Asked on every order page otherwise, and the answer is almost always "nothing returnable".
// The store decides which statuses a return may come from, so the gate reads that rather than
// hardcoding one.
const eligible = computed(() => allowsOrderStatus(props.orderStatus));

// The same query the wizard opens with, so asking here costs the wizard nothing later.
const { result, loading } = useGetReturnableItemsQuery(
  computed(() => ({ orderId: props.orderId })),
  eligible,
);

const hasReturnableItems = computed(() => !!result.value?.returnableItems?.some((item) => item.isReturnable));

function goToWizard(): void {
  void router.push({ name: "SelectReturnItems", params: { orderId: props.orderId } });
}
</script>
