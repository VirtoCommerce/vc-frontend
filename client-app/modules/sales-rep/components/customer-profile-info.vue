<template>
  <LayoutWidget :title="t('sales_rep.customer_profile.info.title')" size="md" class="customer-profile-info">
    <!-- Read-only per design (no edit action). -->
    <VcEmptyView v-if="!rows.length && !loading" :text="t('sales_rep.customer_profile.info.empty')" icon="user" />

    <dl v-else class="customer-profile-info__list">
      <div v-for="row in rows" :key="row.key" class="customer-profile-info__row">
        <dt class="customer-profile-info__label">
          <VcIcon class="customer-profile-info__icon" :name="row.icon" :size="15" />
          {{ t(row.labelKey) }}
        </dt>

        <dd class="customer-profile-info__value">{{ row.value }}</dd>
      </div>
    </dl>
  </LayoutWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesRepCustomer } from "../composables/useSalesRepCustomer";
import LayoutWidget from "./layout-widget.vue";

interface IProps {
  organizationId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
// Apollo dedupes this query by id, so sharing it with the page header costs no extra request.
const { customer, loading } = useSalesRepCustomer(() => props.organizationId);

// Only fields the backend returns; blank values are dropped so no label renders empty.
const rows = computed(() => {
  const details = customer.value;
  if (!details) {
    return [];
  }

  return [
    {
      key: "contact",
      labelKey: "sales_rep.customer_profile.info.primary_contact",
      icon: "user",
      value: details.primaryContactName,
    },
    { key: "phone", labelKey: "sales_rep.customer_profile.info.phone", icon: "phone", value: details.phone },
    {
      key: "account_type",
      labelKey: "sales_rep.customer_profile.info.account_type",
      icon: "office-building",
      value: details.accountType,
    },
    {
      key: "ship_to",
      labelKey: "sales_rep.customer_profile.info.ship_to",
      icon: "location-marker",
      value: details.shipTo,
    },
  ].filter((row) => row.value);
});
</script>

<style lang="scss">
.customer-profile-info {
  &__row {
    @apply flex items-baseline justify-between gap-4 border-b border-neutral-100 py-3 last:border-b-0;
  }

  &__label {
    @apply flex flex-none items-center gap-2 text-sm text-neutral-500;
  }

  &__icon {
    @apply text-neutral-400;
  }

  &__value {
    @apply min-w-0 text-end text-sm font-medium text-neutral-900 [word-break:break-word];
  }
}
</style>
