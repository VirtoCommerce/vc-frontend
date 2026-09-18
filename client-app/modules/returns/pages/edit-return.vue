<template>
  <div>
    <BackButtonInHeader v-if="isMobile" @click="$router.back()" />

    <VcBreadcrumbs :items="breadcrumbs" class="hidden lg:block" />

    <VcTypography tag="h1">{{ $t("return_edit.title") }}</VcTypography>

    <VcEmptyView v-if="!loading && !orderReturn" :text="$t('return_details.not_found_message')" icon="outline-order" />

    <VcEmptyView v-else-if="!loading && !canEdit" :text="$t('return_edit.not_editable_message')" icon="outline-order" />

    <template v-else-if="orderReturn">
      <VcWidget :title="$t('return_edit.details_section')" size="lg">
        <div class="grid gap-5 lg:grid-cols-2">
          <VcInput v-model="customerReference" :label="$t('return_details.customer_reference')" @blur="autosave()" />

          <VcInput v-model="customerComment" :label="$t('return_details.customer_comment')" @blur="autosave()" />
        </div>
      </VcWidget>

      <VcWidget v-if="lines.length > 1" :title="$t('return_edit.bulk_section')" size="lg" class="mt-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
          <VcSelect
            v-model="bulkReason"
            class="lg:w-96"
            :items="reasons"
            value-field="code"
            text-field="localizedName"
            :label="$t('return_edit.apply_to_all', { count: lines.length })"
          />

          <VcButton :disabled="!bulkReason" variant="outline" @click="applyReasonToAll(bulkReason)">
            {{ $t("return_edit.apply") }}
          </VcButton>
        </div>
      </VcWidget>

      <!-- Keyed by draft as well as line: the route reuses this page between drafts, and two drafts
           of one order share line ids. On a bare line key Vue would keep the uploader instance, whose
           file list is seeded once and never replaced, so the previous draft's photos would stay on
           screen and ride the next autosave. -->
      <VcWidget
        v-for="line in lines"
        :key="`${returnId}:${line.orderLineItemId}`"
        :title="line.name ?? ''"
        size="lg"
        class="mt-5"
      >
        <p class="mb-4 text-sm text-neutral-400">
          {{ [line.sku, line.measureUnit].filter(Boolean).join(" · ") }}
        </p>

        <div class="mb-4 flex flex-wrap items-center gap-3">
          <ReturnQuantityInput
            :model-value="line.quantity"
            :max="maxQuantity(line)"
            :label="$t('return_edit.quantity_for', { name: line.name })"
            @update:model-value="onQuantityChanged(line, $event)"
          />

          <span class="text-sm text-neutral-400">
            {{ $t("return_edit.available", { quantity: maxQuantity(line) }) }}
          </span>
        </div>

        <!-- The one failure a correctly filled draft can still hit, and the only place it can be fixed. -->
        <VcAlert
          v-if="unavailableLineId === line.orderLineItemId"
          color="danger"
          variant="soft"
          size="sm"
          class="mb-4"
          icon
        >
          {{ $t("returns.errors.RETURN_QUANTITY_UNAVAILABLE") }}
        </VcAlert>

        <div class="grid gap-5 lg:grid-cols-2">
          <VcSelect
            v-model="line.reasonCode"
            :items="reasons"
            value-field="code"
            text-field="localizedName"
            :label="$t('return_edit.reason')"
            required
            @change="autosave()"
          />

          <VcInput v-model="line.serialNumber" :label="$t('return_edit.serial_number')" @blur="autosave()" />
        </div>

        <VcTextarea
          v-model="line.reasonComment"
          class="mt-5"
          :label="$t('return_edit.reason_comment')"
          :required="requiresComment(line.reasonCode)"
          @blur="autosave()"
        />

        <div class="mt-5">
          <span class="text-sm text-neutral-400">
            {{ attachmentsRequired ? $t("return_edit.files_required") : $t("return_edit.files") }}
          </span>

          <ReturnLineAttachments
            class="mt-2"
            :attachments="line.attachments"
            :scope="fileUploadScope"
            @update:urls="onAttachmentsChanged(line, $event)"
            @update:settled="setUploadState(line, 'settled', $event)"
            @update:failed="setUploadState(line, 'failed', $event)"
          />
        </div>
      </VcWidget>

      <div class="mt-5 flex items-center justify-between">
        <span class="text-sm text-neutral-400">
          {{ saving ? $t("return_edit.saving") : $t("return_edit.saved_automatically") }}
        </span>

        <VcButton :disabled="!canSubmit || uploadsPending || uploadsFailed" :loading="submitting" @click="onSubmit">
          {{ $t("return_edit.submit") }}
        </VcButton>
      </div>

      <p v-if="uploadsPending" class="mt-2 text-right text-sm text-warning-700">
        {{ $t("return_edit.uploads_pending") }}
      </p>

      <p v-if="uploadsFailed" class="mt-2 text-right text-sm text-danger-700">
        {{ $t("return_edit.uploads_failed") }}
      </p>

      <template v-for="(count, cause) in incompleteCounts" :key="cause">
        <p v-if="count" class="mt-2 text-right text-sm text-warning-700">
          {{ $t(`return_edit.incomplete.${cause}`, { count }) }}
        </p>
      </template>
    </template>

    <VcLoaderOverlay :visible="loading" fixed-spinning />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs } from "@/core/composables";
import { usePageHead } from "@/core/composables/usePageHead";
import { useReturnDraft } from "@/modules/returns/composables/useReturnDraft";
import { useReturnReasons } from "@/modules/returns/composables/useReturnReasons";
import { BackButtonInHeader } from "@/shared/layout";
import type { ReturnDraftLineType } from "@/modules/returns/types";
import ReturnLineAttachments from "@/modules/returns/components/return-line-attachments.vue";
import ReturnQuantityInput from "@/modules/returns/components/return-quantity-input.vue";

interface IProps {
  returnId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);

usePageHead({
  title: t("return_edit.title"),
});

const { reasons } = useReturnReasons();

const {
  loading,
  saving,
  submitting,
  orderReturn,
  canEdit,
  customerReference,
  customerComment,
  lines,
  incompleteCounts,
  canSubmit,
  maxQuantity,
  unavailableLineId,
  attachmentsRequired,
  fileUploadScope,
  requiresComment,
  autosave,
  applyReasonToAll,
  submit,
} = useReturnDraft(toRef(props, "returnId"));

const bulkReason = ref("");

// Keyed by line: the uploader lives per line and only it knows whether its files have settled.
// The router reuses this component between drafts, so a line the next draft does not carry would
// leave a stale flag behind. Lines it does carry re-report themselves, since the widget key
// includes the draft.
const uploadState = ref<Record<string, { settled: boolean; failed: boolean }>>({});

watch(
  () => props.returnId,
  () => {
    uploadState.value = {};
  },
);

// A failed file is neither attached nor uploaded, so it reads as unsettled too. Without excluding
// it the buyer gets both warnings at once and the one that says "still uploading" is a lie.
const uploadsPending = computed(() =>
  Object.values(uploadState.value).some((state) => !state.settled && !state.failed),
);

const uploadsFailed = computed(() => Object.values(uploadState.value).some((state) => state.failed));

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("returns.menu.link.title"), route: { name: "Returns" } },
  { title: t("return_edit.title") },
]);

const isMobile = breakpoints.smaller("lg");

function setUploadState(line: ReturnDraftLineType, key: "settled" | "failed", value: boolean): void {
  const state = (uploadState.value[line.orderLineItemId] ??= { settled: true, failed: false });
  state[key] = value;
}

function onQuantityChanged(line: ReturnDraftLineType, quantity: number): void {
  line.quantity = quantity;
  unavailableLineId.value = "";
  void autosave();
}

function onAttachmentsChanged(line: ReturnDraftLineType, urls: string[]): void {
  line.attachmentUrls = urls;
  void autosave();
}

async function onSubmit(): Promise<void> {
  if (await submit()) {
    await router.push({ name: "Return", params: { returnId: props.returnId } });
  }
}
</script>
