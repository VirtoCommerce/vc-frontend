<template>
  <ProceedTo
    :disabled="hasOnlyUnselectedLineItems || hasIncompleteSections"
    :loading="isSubmitting"
    test-id="create-requisition-button"
    @click="createAndSubmitPunchoutRequisition"
  >
    {{ $t("punchout.create_requisition") }}
  </ProceedTo>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { useFullCart } from "@/shared/cart";
import { useCheckoutSections } from "@/shared/checkout";
import { useNotifications } from "@/shared/notification";
import { createPunchoutRequisition } from "../api/graphql";
import { usePunchoutRequisition } from "../composables/usePunchoutRequisition";
import {
  isKnownRequisitionErrorCode,
  REQUISITION_ERROR_MESSAGE_KEYS,
  REQUISITION_FAILED_MESSAGE_KEY,
} from "../constants";
import { submitPunchoutOrderMessage } from "../utils/submitPunchoutOrderMessage";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

const { hasOnlyUnselectedLineItems } = useFullCart();
// Only the sections punchout keeps on the checkout have to be complete, the rest is the procurement system's part
const { hasIncompleteSections } = useCheckoutSections();
const notifications = useNotifications();
const { t } = useI18n();

const { isSubmitting, setSubmitting } = usePunchoutRequisition();

async function createAndSubmitPunchoutRequisition() {
  if (isSubmitting.value) {
    return;
  }

  setSubmitting(true);
  let errorMessageKey: string = REQUISITION_FAILED_MESSAGE_KEY;

  try {
    const response = await createPunchoutRequisition();
    const { url, formField, cxml, errorCode } = response ?? {};

    if (url && formField && cxml && !errorCode) {
      // The page is being replaced, so the button stays busy instead of inviting a second submit
      submitPunchoutOrderMessage({ url, formField, cxml });
      return;
    }

    if (isKnownRequisitionErrorCode(errorCode)) {
      errorMessageKey = REQUISITION_ERROR_MESSAGE_KEYS[errorCode];
    }

    Logger.error("createAndSubmitPunchoutRequisition: punchout requisition failed", errorCode);
  } catch (e) {
    Logger.error("createAndSubmitPunchoutRequisition", e);
  }

  notifications.error({
    text: t(errorMessageKey),
    duration: 15000,
    singleInGroup: true,
    group: "punchout",
  });
  setSubmitting(false);
}
</script>
