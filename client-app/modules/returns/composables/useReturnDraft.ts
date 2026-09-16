import { useDebounceFn } from "@vueuse/core";
import { computed, ref, toValue, watch } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useSubmitReturnMutation } from "@/modules/returns/api/graphql/mutations/submitReturn";
import { useUpdateReturnMutation } from "@/modules/returns/api/graphql/mutations/updateReturn";
import { useGetReturnQuery } from "@/modules/returns/api/graphql/queries/getReturn";
import { useReturnReasons } from "@/modules/returns/composables/useReturnReasons";
import {
  ATTACHMENTS_REQUIRED_KEY,
  DEFAULT_FILE_UPLOAD_SCOPE,
  FILE_UPLOAD_SCOPE_KEY,
  MODULE_ID,
} from "@/modules/returns/constants";
import type { MaybeRefOrGetter } from "vue";

const AUTOSAVE_DELAY = 800;

export type ReturnAttachmentFragmentType = {
  name: string;
  url: string;
  size: number;
  mimeType?: string;
};

export type ReturnDraftLineType = {
  orderLineItemId: string;
  name?: string;
  sku?: string;
  measureUnit?: string;
  quantity: number;
  reasonCode: string;
  reasonComment: string;
  serialNumber: string;
  /** As the server knows them; the uploader owns the live list. */
  attachments: ReturnAttachmentFragmentType[];
  /** What the next save should make the line's files be. */
  attachmentUrls: string[];
};

/**
 * Drives the "add return details" step: reasons, comments and serial numbers on a draft, then
 * handing it to the returns agent.
 */
export function useReturnDraft(returnId: MaybeRefOrGetter<string>) {
  const { result, loading, refetch } = useGetReturnQuery(computed(() => ({ id: toValue(returnId) })));
  const { mutate: updateReturn, loading: saving } = useUpdateReturnMutation();
  const { mutate: submitReturn, loading: submitting } = useSubmitReturnMutation();
  const { requiresComment } = useReturnReasons();
  const { getSettingValue } = useModuleSettings(MODULE_ID);

  const attachmentsRequired = computed(() => getSettingValue(ATTACHMENTS_REQUIRED_KEY) !== false);
  const fileUploadScope = computed(() => String(getSettingValue(FILE_UPLOAD_SCOPE_KEY) ?? DEFAULT_FILE_UPLOAD_SCOPE));

  const orderReturn = computed(() => result.value?.return);
  const isDraft = computed(() => orderReturn.value?.status === "Draft");

  const customerReference = ref("");
  const customerComment = ref("");
  const lines = ref<ReturnDraftLineType[]>([]);

  // Seeded from the server rather than kept in sync with it: the buyer is typing into these, and
  // an autosave response overwriting the field mid-keystroke is exactly what must not happen.
  watch(orderReturn, (value, previous) => {
    if (!value || previous) {
      return;
    }

    customerReference.value = value.customerReference ?? "";
    customerComment.value = value.customerComment ?? "";
    lines.value = (value.items ?? []).map((item) => ({
      orderLineItemId: item.orderLineItemId ?? "",
      name: item.name ?? undefined,
      sku: item.sku ?? undefined,
      measureUnit: item.measureUnit ?? undefined,
      quantity: item.quantity,
      reasonCode: item.reasonCode ?? "",
      reasonComment: item.reasonComment ?? "",
      serialNumber: item.serialNumber ?? "",
      attachments: (item.attachments ?? []).map((attachment) => ({
        name: attachment.name,
        url: attachment.url,
        size: attachment.size,
        mimeType: attachment.mimeType ?? undefined,
      })),
      attachmentUrls: (item.attachments ?? []).map((attachment) => attachment.url),
    }));
  });

  /**
   * Lines the buyer still has to complete. Mirrors what submitReturn enforces, so the button is
   * disabled instead of the server rejecting the attempt.
   */
  const incompleteLines = computed(() =>
    lines.value.filter(
      (line) =>
        !line.reasonCode ||
        (requiresComment(line.reasonCode) && !line.reasonComment.trim()) ||
        (attachmentsRequired.value && line.attachmentUrls.length === 0),
    ),
  );

  const canSubmit = computed(() => isDraft.value && lines.value.length > 0 && incompleteLines.value.length === 0);

  /** Returns whether the draft now matches what the buyer typed. */
  async function save(): Promise<boolean> {
    if (!isDraft.value) {
      return false;
    }

    try {
      await updateReturn({
        command: {
          returnId: toValue(returnId),
          customerReference: customerReference.value,
          customerComment: customerComment.value,
          items: lines.value.map((line) => ({
            orderLineItemId: line.orderLineItemId,
            quantity: line.quantity,
            reasonCode: line.reasonCode || undefined,
            reasonComment: line.reasonComment || undefined,
            serialNumber: line.serialNumber || undefined,
            attachmentUrls: line.attachmentUrls,
          })),
        },
      });

      return true;
    } catch {
      // Autosave runs unattended on every keystroke, so a failed one must not reject into nowhere.
      // The global error link has already shown what went wrong; the buyer keeps typing and the
      // next autosave retries the whole draft anyway.
      return false;
    }
  }

  const autosave = useDebounceFn(save, AUTOSAVE_DELAY);

  /** Applies one reason to every line, the bulk action a long B2B return needs. */
  function applyReasonToAll(reasonCode: string): void {
    lines.value.forEach((line) => {
      line.reasonCode = reasonCode;
    });

    void autosave();
  }

  /** Saves first: the draft must carry what the buyer typed before it is handed over. */
  async function submit(): Promise<boolean> {
    if (!(await save())) {
      // Submitting now would hand over a draft missing whatever the failed save was carrying.
      return false;
    }

    try {
      const submitted = await submitReturn({ command: { returnId: toValue(returnId) } });

      return submitted?.data?.submitReturn?.status === "Requested";
    } catch {
      // RETURN_QUANTITY_UNAVAILABLE and ATTACHMENTS_REQUIRED land here. The draft is untouched and
      // the error link has already said what to fix, so the buyer stays on the page and adjusts.
      return false;
    }
  }

  return {
    loading,
    saving,
    submitting,
    orderReturn,
    isDraft,
    customerReference,
    customerComment,
    lines,
    incompleteLines,
    canSubmit,
    attachmentsRequired,
    fileUploadScope,
    requiresComment,
    autosave,
    save,
    applyReasonToAll,
    submit,
    refetch,
  };
}
