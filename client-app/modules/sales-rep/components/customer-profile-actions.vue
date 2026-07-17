<template>
  <VcWidget :title="t('sales_rep.communication.quick_actions.title')" size="lg" class="customer-profile-actions">
    <VcButton
      class="customer-profile-actions__button"
      prepend-icon="paper-airplane"
      :disabled="!customer"
      @click="openCommunication"
    >
      {{ t("sales_rep.communication.quick_actions.send_message") }}
    </VcButton>
  </VcWidget>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useModal } from "@/shared/modal";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import CustomerCommunicationModal from "./customer-communication-modal.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { openModal } = useModal();
// Apollo dedupes this query by id, so it shares the page header's request (no extra fetch).
const { customer } = useSalesRepCustomer(() => props.organizationId);

function openCommunication(): void {
  openModal({
    component: CustomerCommunicationModal,
    props: {
      organizationId: props.organizationId,
      organizationName: customer.value?.organizationName ?? "",
    },
  });
}
</script>

<style lang="scss">
.customer-profile-actions {
  // Header divider (size=lg drops the built-in one).
  .vc-widget__header-container {
    @apply border-b border-neutral-200;
  }

  &__button {
    @apply w-full;
  }
}
</style>
