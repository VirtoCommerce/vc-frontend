<template>
  <div>
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <VcTypography tag="h1">{{ $t("return_details.title", [orderReturn?.number ?? ""]) }}</VcTypography>

    <VcEmptyView v-if="!loading && !orderReturn" :text="$t('return_details.not_found_message')" icon="outline-order" />

    <template v-else-if="orderReturn">
      <VcWidget :title="$t('return_details.summary_section')" size="lg">
        <div class="grid grid-cols-2 gap-y-4 lg:grid-cols-4">
          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">{{ $t("returns.list.columns.status") }}</span>

            <span>{{ orderReturn.status }}</span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">{{ $t("returns.list.columns.date") }}</span>

            <span>{{ $d(new Date(orderReturn.createdDate)) }}</span>
          </div>

          <div class="flex flex-col">
            <span class="text-sm text-neutral-400">{{ $t("return_details.order_number") }}</span>

            <span>{{ orderReturn.orderNumber }}</span>
          </div>

          <div v-if="orderReturn.customerReference" class="flex flex-col">
            <span class="text-sm text-neutral-400">{{ $t("return_details.customer_reference") }}</span>

            <span>{{ orderReturn.customerReference }}</span>
          </div>
        </div>

        <div v-if="orderReturn.customerComment" class="mt-5 flex flex-col">
          <span class="text-sm text-neutral-400">{{ $t("return_details.customer_comment") }}</span>

          <span>{{ orderReturn.customerComment }}</span>
        </div>

        <div v-if="orderReturn.cancelReason" class="mt-5 flex flex-col">
          <span class="text-sm text-neutral-400">{{ $t("return_details.cancel_reason") }}</span>

          <span>{{ orderReturn.cancelReason }}</span>
        </div>

        <template v-if="isCancellable" #footer>
          <VcButton color="danger" variant="outline" size="sm" @click="openCancelModal">
            {{ $t("return_details.cancel_button") }}
          </VcButton>
        </template>
      </VcWidget>

      <VcWidget :title="$t('return_details.items_section')" size="lg" class="mt-5">
        <template #default-container>
          <table class="w-full">
            <thead>
              <tr class="border-b border-neutral-200 text-sm text-neutral-400">
                <th class="p-5 text-left font-normal">{{ $t("returns.select_items.columns.item") }}</th>

                <th class="p-5 text-right font-normal">{{ $t("return_details.columns.requested") }}</th>

                <th class="p-5 text-right font-normal">{{ $t("return_details.columns.approved") }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in orderReturn.items" :key="item.id" class="border-b border-neutral-200">
                <td class="p-5">
                  <div>{{ item.name }}</div>

                  <div class="text-sm text-neutral-400">
                    {{ [item.sku, item.measureUnit].filter(Boolean).join(" · ") }}
                  </div>

                  <div v-if="item.reasonComment" class="text-sm text-neutral-400">{{ item.reasonComment }}</div>
                </td>

                <td class="p-5 text-right">{{ item.quantity }}</td>

                <td class="p-5 text-right">
                  <span v-if="item.itemState === 'Requested'" class="text-neutral-400">&mdash;</span>

                  <span v-else>{{ item.approvedQuantity }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </VcWidget>
    </template>

    <VcLoaderOverlay :visible="loading" fixed-spinning />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { useReturn } from "@/modules/returns/composables/useReturn";
import { CANCELLABLE_STATUSES } from "@/modules/returns/constants";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import CancelReturnModal from "@/modules/returns/components/cancel-return-modal.vue";

interface IProps {
  returnId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);

const { openModal } = useModal();

const { loading, orderReturn, refetch } = useReturn(toRef(props, "returnId"));

// Mirrors CancellableStatuses on the server. The button is a shortcut, not the rule — the mutation
// refuses anything else regardless of what the page decided to show.
const isCancellable = computed(() => CANCELLABLE_STATUSES.includes(orderReturn.value?.status ?? ""));

function openCancelModal(): void {
  openModal({
    component: CancelReturnModal,
    props: {
      returnId: props.returnId,
      returnNumber: orderReturn.value?.number ?? "",

      async onResult(): Promise<void> {
        await refetch();
      },
    },
  });
}

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("returns.menu.link.title"), route: { name: "Returns" } },
  { title: t("return_details.title", [orderReturn.value?.number ?? ""]) },
]);

const isMobile = breakpoints.smaller("lg");
</script>
