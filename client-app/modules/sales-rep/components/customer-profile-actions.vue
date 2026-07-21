<template>
  <VcWidget :title="t('sales_rep.communication.quick_actions.title')" size="md" class="customer-profile-actions">
    <!-- #default-container is the kit's supported body seam; the grid owns its inset here instead of
         overriding .vc-widget__slot. size=md keeps the header divider natively. -->
    <template #default-container>
      <div class="customer-profile-actions__grid">
        <!-- Order on behalf / Create quote / Schedule call are placeholders until their own tickets land. -->
        <button
          type="button"
          class="customer-profile-actions__tile customer-profile-actions__tile--primary"
          :title="t('sales_rep.communication.quick_actions.order_on_behalf')"
          disabled
        >
          <VcIcon class="customer-profile-actions__icon" name="shopping-bag" :size="24" />

          <span class="customer-profile-actions__label">
            {{ t("sales_rep.communication.quick_actions.order_on_behalf") }}
          </span>
        </button>

        <button
          type="button"
          class="customer-profile-actions__tile customer-profile-actions__tile--secondary"
          :disabled="!customer"
          @click="openCommunication"
        >
          <VcIcon class="customer-profile-actions__icon" name="mail" :size="24" />

          <span class="customer-profile-actions__label">
            {{ t("sales_rep.communication.quick_actions.send_email") }}
          </span>
        </button>

        <button
          type="button"
          class="customer-profile-actions__tile customer-profile-actions__tile--secondary"
          :title="t('sales_rep.communication.quick_actions.create_quote')"
          disabled
        >
          <VcIcon class="customer-profile-actions__icon" name="receipt-tax" :size="24" />

          <span class="customer-profile-actions__label">
            {{ t("sales_rep.communication.quick_actions.create_quote") }}
          </span>
        </button>

        <button
          type="button"
          class="customer-profile-actions__tile customer-profile-actions__tile--secondary"
          :title="t('sales_rep.communication.quick_actions.schedule_call')"
          disabled
        >
          <VcIcon class="customer-profile-actions__icon" name="calendar" :size="24" />

          <span class="customer-profile-actions__label">
            {{ t("sales_rep.communication.quick_actions.schedule_call") }}
          </span>
        </button>
      </div>
    </template>
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
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.customer-profile-actions {
  &__grid {
    // auto-rows-fr keeps both rows the same height even when a label wraps (e.g. "Order on behalf").
    @apply grid grid-cols-2 gap-3 px-5 pb-5 pt-4;

    grid-auto-rows: 1fr;
  }

  &__tile {
    @apply flex h-24 flex-col items-center justify-center gap-2 rounded-[--vc-radius] border-2 px-2 text-center text-sm font-medium leading-tight transition-shadow;

    &:not(:disabled):hover {
      @apply shadow-lg;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-60;
    }
  }

  &__tile--primary {
    @apply border-transparent bg-primary-500 text-additional-50;
  }

  &__tile--secondary {
    @apply border-neutral-200 bg-additional-50 text-neutral-700;

    // Orange icon over a neutral label, per the design.
    .customer-profile-actions__icon {
      @apply text-primary-500;
    }
  }
}
</style>
