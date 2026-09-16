import { computed, onScopeDispose, ref, toValue, watch } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { globals } from "@/core/globals";
import { useSubmitReturnMutation } from "@/modules/returns/api/graphql/mutations/submitReturn";
import { useUpdateReturnMutation } from "@/modules/returns/api/graphql/mutations/updateReturn";
import { useGetReturnQuery } from "@/modules/returns/api/graphql/queries/getReturn";
import { useReturnActions } from "@/modules/returns/composables/useReturnActions";
import { useReturnErrors } from "@/modules/returns/composables/useReturnErrors";
import { useReturnReasons } from "@/modules/returns/composables/useReturnReasons";
import { ATTACHMENTS_REQUIRED_KEY, FILE_UPLOAD_SCOPE, MODULE_ID } from "@/modules/returns/constants";
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
  attachments: ReturnAttachmentFragmentType[];
  attachmentUrls: string[];
};

export function useReturnDraft(returnId: MaybeRefOrGetter<string>) {
  const { result, loading, refetch } = useGetReturnQuery(computed(() => ({ id: toValue(returnId) })));
  const { mutate: updateReturn, loading: saving } = useUpdateReturnMutation();
  const { mutate: submitReturn, loading: submitting } = useSubmitReturnMutation();
  const { requiresComment } = useReturnReasons();
  const { report } = useReturnErrors();
  const { getSettingValue } = useModuleSettings(MODULE_ID);

  const attachmentsRequired = computed(() => getSettingValue(ATTACHMENTS_REQUIRED_KEY) !== false);

  const orderReturn = computed(() => result.value?.return);

  const { canEdit, canSubmit: submitAllowed } = useReturnActions(orderReturn);

  const customerReference = ref("");
  const customerComment = ref("");
  const lines = ref<ReturnDraftLineType[]>([]);

  // Seeded once per return, not kept in sync: the buyer is typing into these and an autosave
  // response must not overwrite a field mid-keystroke. The router reuses this component between
  // two drafts, so the seed has to reopen when the id changes or the previous draft stays on screen.
  let seededReturnId = "";

  watch(
    orderReturn,
    (value) => {
      if (!value || value.id === seededReturnId) {
        return;
      }

      seededReturnId = value.id;
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
    },
    // A cached result is already there when this runs, and without immediate the seed would wait for
    // a change that may never come - leaving an empty form that the next autosave would persist.
    { immediate: true },
  );

  const incompleteLines = computed(() =>
    lines.value.filter(
      (line) =>
        !line.reasonCode ||
        (requiresComment(line.reasonCode) && !line.reasonComment.trim()) ||
        (attachmentsRequired.value && line.attachmentUrls.length === 0),
    ),
  );

  const canSubmit = computed(() => submitAllowed.value && lines.value.length > 0 && incompleteLines.value.length === 0);

  async function save(): Promise<boolean> {
    if (!canEdit.value) {
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
    } catch (error) {
      // Autosave runs unattended on every keystroke, so a rejection must not go unhandled.
      report(error);

      return false;
    }
  }

  let autosaveTimer: ReturnType<typeof setTimeout> | undefined;

  function cancelAutosave(): void {
    clearTimeout(autosaveTimer);
    autosaveTimer = undefined;
  }

  function autosave(): void {
    cancelAutosave();
    autosaveTimer = setTimeout(() => void save(), AUTOSAVE_DELAY);
  }

  // Leaving the page within the debounce window would otherwise run save - and report its error -
  // against a scope that no longer exists.
  onScopeDispose(cancelAutosave);

  function applyReasonToAll(reasonCode: string): void {
    lines.value.forEach((line) => {
      line.reasonCode = reasonCode;
    });

    void autosave();
  }

  async function submit(): Promise<boolean> {
    // A keystroke still waiting on the timer would fire against an already submitted return.
    cancelAutosave();

    if (!(await save())) {
      return false;
    }

    try {
      const submitted = await submitReturn({
        command: { returnId: toValue(returnId) },
        cultureName: globals.cultureName,
      });

      return submitted?.data?.submitReturn?.status === "Requested";
    } catch (error) {
      report(error);

      return false;
    }
  }

  return {
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
    fileUploadScope: FILE_UPLOAD_SCOPE,
    requiresComment,
    autosave,
    save,
    applyReasonToAll,
    submit,
    refetch,
  };
}
