<template>
  <VcContainer>
    <VcLayout sidebar-position="right" sticky-sidebar>
      <VcWidget :title="$t('common.labels.orders')">
        <VcTable :columns="columns" :items="items" :description="$t('common.labels.orders')">
          <template #desktop-item="{ item }">
            <tr class="border-b border-neutral-200 last:border-0">
              <td class="px-4 py-3">{{ item.id }}</td>

              <td class="px-4 py-3">{{ item.customer }}</td>

              <td class="px-4 py-3 text-right">{{ item.quantity }}</td>

              <td class="px-4 py-3 text-right">{{ n(item.total, "currency") }}</td>
            </tr>
          </template>
        </VcTable>
      </VcWidget>

      <template #sidebar>
        <div class="mt-4 flex flex-col gap-4 md:mt-0">
          <VcWidget title="Summary">
            <div class="flex flex-col gap-3">
              <VcLabel>{{ $t("common.labels.price") }}</VcLabel>

              <VcTypography tag="div" class="text-lg font-bold">{{ n(sidebarTotal, "currency") }}</VcTypography>

              <div class="mt-2 grid grid-cols-2 gap-3">
                <VcButton color="primary" variant="solid" @click="onBuy">{{ $t("common.buttons.buy_now") }}</VcButton>

                <VcButton color="neutral" variant="outline" @click="onCancel">
                  {{ $t("common.buttons.cancel") }}
                </VcButton>
              </div>

              <VcTypography tag="div" class="mt-2 text-xs text-neutral-600">
                {{ $t("common.messages.mock_data_description") }}
              </VcTypography>
            </div>
          </VcWidget>
        </div>
      </template>
    </VcLayout>
  </VcContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { n, t } = useI18n();

const columns = [
  { id: "id", title: t("common.labels.order") },
  { id: "customer", title: t("common.labels.customer") },
  { id: "quantity", title: t("common.labels.quantity"), align: "right" as const },
  { id: "total", title: t("common.labels.total"), align: "right" as const },
];

const items = [
  { id: "1001", customer: "Alice Johnson", quantity: 3, total: 130 },
  { id: "1002", customer: "Bob Smith", quantity: 1, total: 49 },
  { id: "1003", customer: "Carol Lee", quantity: 5, total: 305.5 },
];

const sidebarTotal = computed(() => items.reduce((acc, it) => acc + it.total, 0));

function onBuy() {
  // mock handler
}

function onCancel() {
  // mock handler
}
</script>
