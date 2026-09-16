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

      <VcWidget v-for="line in lines" :key="line.orderLineItemId" :title="line.name ?? ''" size="lg" class="mt-5">
        <p class="mb-4 text-sm text-neutral-400">
          {{ [line.sku, line.measureUnit].filter(Boolean).join(" · ") }} ·
          {{ $t("return_edit.returning", { quantity: line.quantity }) }}
        </p>

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
          />
        </div>
      </VcWidget>

      <div class="mt-5 flex items-center justify-between">
        <span class="text-sm text-neutral-400">
          {{ saving ? $t("return_edit.saving") : $t("return_edit.saved_automatically") }}
        </span>

        <VcButton :disabled="!canSubmit" :loading="submitting" @click="onSubmit">
          {{ $t("return_edit.submit") }}
        </VcButton>
      </div>

      <p v-if="incompleteLines.length" class="mt-2 text-right text-sm text-warning-700">
        {{ $t("return_edit.incomplete_hint", { count: incompleteLines.length }) }}
      </p>
    </template>

    <VcLoaderOverlay :visible="loading" fixed-spinning />
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { useBreadcrumbs } from "@/core/composables";
import { usePageHead } from "@/core/composables/usePageHead";
import { useReturnDraft } from "@/modules/returns/composables/useReturnDraft";
import { useReturnReasons } from "@/modules/returns/composables/useReturnReasons";
import { BackButtonInHeader } from "@/shared/layout";
import type { ReturnDraftLineType } from "@/modules/returns/types";
import ReturnLineAttachments from "@/modules/returns/components/return-line-attachments.vue";

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
  incompleteLines,
  canSubmit,
  attachmentsRequired,
  fileUploadScope,
  requiresComment,
  autosave,
  applyReasonToAll,
  submit,
} = useReturnDraft(toRef(props, "returnId"));

const bulkReason = ref("");

const breadcrumbs = useBreadcrumbs(() => [
  { title: t("common.links.account"), route: { name: "Account" } },
  { title: t("returns.menu.link.title"), route: { name: "Returns" } },
  { title: t("return_edit.title") },
]);

const isMobile = breakpoints.smaller("lg");

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
