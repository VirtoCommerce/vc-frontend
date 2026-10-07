<template>
  <ProceedTo
    :disabled="hasOnlyUnselectedLineItems"
    :loading="submitting"
    test-id="create-requisition-button"
    @click="createRequisition"
  >
    {{ $t("punchout.create_requisition") }}
  </ProceedTo>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";
import { useFullCart } from "@/shared/cart";
import { useNotifications } from "@/shared/notification";
import { createPunchoutRequisition } from "../api/graphql";
import { submitPunchoutOrderMessage } from "../utils/submitPunchoutOrderMessage";
import ProceedTo from "@/shared/checkout/components/proceed-to.vue";

// Shipping and payment are the procurement system's part, so only the cart itself has to be valid
const { hasOnlyUnselectedLineItems } = useFullCart();
const notifications = useNotifications();
const { t } = useI18n();

const submitting = ref(false);

async function createRequisition() {
  submitting.value = true;

  try {
    const response = await createPunchoutRequisition();
    const { url, formField, cxml, errorCode } = response ?? {};

    if (url && formField && cxml && !errorCode) {
      // The page is being replaced, so the button stays busy instead of inviting a second submit
      submitPunchoutOrderMessage({ url, formField, cxml });
      return;
    }

    Logger.error("createRequisition: punchout requisition failed", errorCode);
  } catch (e) {
    Logger.error("createRequisition", e);
  }

  notifications.error({
    text: t("punchout.errors.create_requisition_failed"),
    duration: 15000,
    single: true,
  });
  submitting.value = false;
}
</script>
