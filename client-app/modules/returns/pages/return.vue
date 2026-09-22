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

            <span>{{ statusLabel(orderReturn.status, orderReturn.statusDisplayValue) }}</span>
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

        <div v-if="orderReturn.rejectReason" class="mt-5 flex flex-col">
          <span class="text-sm text-neutral-400">{{ $t("return_details.reject_reason") }}</span>

          <span>{{ orderReturn.rejectReason }}</span>
        </div>

        <template v-if="cancelAction" #footer>
          <VcTooltip v-if="!cancelAction.isAvailable" placement="top">
            <template #trigger>
              <VcButton color="danger" variant="outline" size="sm" disabled>
                {{ $t("return_details.cancel_button") }}
              </VcButton>
            </template>

            <template #content>
              {{ codeText("action_unavailable", cancelAction.unavailableReason) }}
            </template>
          </VcTooltip>

          <VcButton v-else color="danger" variant="outline" size="sm" @click="openCancelModal">
            {{ $t("return_details.cancel_button") }}
          </VcButton>
        </template>
      </VcWidget>

      <VcWidget :title="$t('return_details.items_section')" size="lg" class="mt-5">
        <template #default-container>
          <VcTable
            :items="items"
            :description="$t('return_details.table_description')"
            hide-default-footer
            mobile-breakpoint="lg"
          >
            <template #mobile-item="{ item }">
              <div class="return-details__card">
                <ReturnItemSummary :item="item" @download="onDownload" />

                <div class="return-details__card-row">
                  <span class="text-sm text-neutral-400">{{ $t("return_details.columns.requested") }}</span>

                  <span>{{ item.quantity }}</span>
                </div>

                <div class="return-details__card-row">
                  <span class="text-sm text-neutral-400">{{ $t("return_details.columns.approved") }}</span>

                  <span v-if="!isDecided(item.itemState)" class="text-neutral-400">&mdash;</span>

                  <span v-else>{{ item.approvedQuantity }}</span>
                </div>

                <div v-if="item.rejectReason" class="return-details__card-row">
                  <span class="text-sm text-neutral-400">{{ $t("return_details.reject_reason") }}</span>

                  <span>{{ item.rejectReason }}</span>
                </div>
              </div>
            </template>

            <VcTableColumn id="item" v-slot="{ item }" :title="$t('returns.select_items.columns.item')">
              <ReturnItemSummary :item="item" @download="onDownload" />
            </VcTableColumn>

            <VcTableColumn
              id="requested"
              v-slot="{ item }"
              :title="$t('return_details.columns.requested')"
              align="right"
            >
              {{ item.quantity }}
            </VcTableColumn>

            <VcTableColumn id="approved" v-slot="{ item }" :title="$t('return_details.columns.approved')" align="right">
              <span v-if="!isDecided(item.itemState)" class="text-neutral-400">&mdash;</span>

              <span v-else>{{ item.approvedQuantity }}</span>

              <div v-if="item.rejectReason" class="text-sm text-danger-500">
                {{ item.rejectReason }}
              </div>
            </VcTableColumn>
          </VcTable>
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
import { useReturnActions } from "@/modules/returns/composables/useReturnActions";
import { useReturnErrors } from "@/modules/returns/composables/useReturnErrors";
import { useReturnStatusLabel } from "@/modules/returns/composables/useReturnStatusLabel";
import { downloadFile } from "@/shared/files";
import { BackButtonInHeader } from "@/shared/layout";
import { useModal } from "@/shared/modal";
import CancelReturnModal from "@/modules/returns/components/cancel-return-modal.vue";
import ReturnItemSummary from "@/modules/returns/components/return-item-summary.vue";

interface IProps {
  returnId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);

const { openModal } = useModal();

const { loading, orderReturn } = useReturn(toRef(props, "returnId"));

const { cancelAction } = useReturnActions(orderReturn);

const { statusLabel } = useReturnStatusLabel();

const { codeText } = useReturnErrors();

// Mapped once per result rather than per render, and field by field: spreading the fragment would
// leave its mimeType sitting next to the contentType the uploader actually reads.
const items = computed(() =>
  (orderReturn.value?.items ?? []).map((item) => ({
    ...item,
    files: (item.attachments ?? []).map<IAttachedFile>((attachment) => ({
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      contentType: attachment.mimeType ?? undefined,
      status: "attached",
    })),
  })),
);

function onDownload(file: FileType): void {
  if (file.url) {
    void downloadFile(file.url, file.name);
  }
}

// 0 is how the schema spells a rejected line, so an undecided one must not show a number.
function isDecided(itemState: string | undefined): boolean {
  return itemState === "Approved" || itemState === "Rejected";
}

function openCancelModal(): void {
  openModal({
    component: CancelReturnModal,
    props: {
      returnId: props.returnId,
      returnNumber: orderReturn.value?.number ?? "",
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

<style lang="scss">
.return-details {
  &__card {
    @apply flex flex-col gap-1 border-b border-neutral-200 p-6;
  }

  &__card-row {
    @apply mt-2 flex items-center justify-between gap-3;
  }
}
</style>
