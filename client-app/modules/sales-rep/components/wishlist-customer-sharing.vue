<template>
  <div class="wishlist-customer-sharing">
    <VcSelect
      v-model="selectedOrganizationId"
      test-id-dropdown="wishlist-share-customer-select"
      :label="t('sales_rep.list_sharing.share_customers_label')"
      :placeholder="t('sales_rep.list_sharing.share_customers_placeholder')"
      :disabled="saving || loading"
      :items="pickerOptions"
      :error="failed"
      :message="fieldMessage"
      text-field="organizationName"
      value-field="organizationId"
      required
      autocomplete
      clearable
    />

    <VcTextarea
      v-if="isNewTarget"
      v-model="shareMessage"
      data-test-id="wishlist-share-message-input"
      :label="t('sales_rep.list_sharing.share_message_label')"
      :placeholder="t('sales_rep.list_sharing.share_message_placeholder')"
      :disabled="saving"
      rows="3"
      counter
      :max-length="messageMaxLength"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@/shared/notification";
import { useSalesRepCommunication } from "../composables/useSalesRepCommunication";
import { useSalesRepCustomerOptions } from "../composables/useSalesRepCustomerOptions";
import type { SalesRepCustomerOptionType } from "../composables/useSalesRepCustomerOptions";
import type { WishlistSharingScopeSavedContextType } from "@/shared/wishlists";

interface IProps {
  sharedWithId?: string;
  /** Appended to the notification so the customer can reach the list. */
  sharingLink: string;
  saving?: boolean;
}

const props = defineProps<IProps>();

const { t, te } = useI18n();
const notifications = useNotifications();
const { sendCommunication } = useSalesRepCommunication();
const { options, loading, failed } = useSalesRepCustomerOptions();

// The backend rejects a combined message over 1000 chars. Measuring the actual link (its host varies per store) keeps
// a long domain from pushing an otherwise-valid message over the limit.
const NOTIFICATION_MESSAGE_LIMIT = 1000;
const SEPARATOR = "\n\n";

const persistedTarget = toRef(props, "sharedWithId");
const selectedOrganizationId = ref<string | undefined>(persistedTarget.value ?? undefined);
const shareMessage = ref("");

const messageMaxLength = computed(() => NOTIFICATION_MESSAGE_LIMIT - props.sharingLink.length - SEPARATOR.length);

// Only a genuinely new target counts: re-selecting the original (including A -> B -> A) is no change.
const isNewTarget = computed(
  () => !!selectedOrganizationId.value && selectedOrganizationId.value !== (persistedTarget.value ?? undefined),
);

// The backend keeps a single sharing setting per list, so targeting another customer detaches the current one.
const replacesPreviousTarget = computed(() => isNewTarget.value && !!persistedTarget.value);

// VcSelect labels the selection by looking it up in `items`, which are capped — a target over the cap or lost to a
// failed fetch would read as "nothing selected", and re-picking would detach a customer nobody meant to touch. The
// name is unknown for a seeded entry, so the id stands in.
const pickerOptions = computed<SalesRepCustomerOptionType[]>(() => {
  const target = persistedTarget.value;

  if (!target || options.value.some((option) => option.organizationId === target)) {
    return options.value;
  }

  return [{ organizationId: target, organizationName: target }, ...options.value];
});

const fieldMessage = computed(() => {
  if (failed.value) {
    return t("sales_rep.list_sharing.share_customers_error");
  }

  return replacesPreviousTarget.value ? t("sales_rep.list_sharing.share_replace_hint") : "";
});

// An unknown code yields nothing, so the caller keeps its own summary instead of repeating it once per code.
function localizeWarning(code: string): string | undefined {
  const key = `sales_rep.communication.warnings.${code}`;

  return te(key) ? t(key) : undefined;
}

async function notifyCustomer(organizationId: string, context: WishlistSharingScopeSavedContextType): Promise<void> {
  const body =
    shareMessage.value.trim() || t("sales_rep.list_sharing.share_default_message", { listName: context.listName });

  const result = await sendCommunication({
    organizationId,
    sendEmail: true,
    sendPush: true,
    title: t("sales_rep.list_sharing.share_default_title"),
    message: [body, context.sharingLink].join(SEPARATOR),
  });

  const details = result.warnings.map(localizeWarning).filter(Boolean).join(" ");
  // The list is already saved, so a delivery problem is a warning about the notification, never a save error.
  const summary = result.succeeded
    ? t("sales_rep.list_sharing.share_partial")
    : t("sales_rep.list_sharing.share_notify_error");

  if (!result.succeeded || result.warnings.length) {
    notifications.warning({
      text: [summary, details].filter(Boolean).join(" "),
      duration: 10000,
      single: true,
    });

    return;
  }

  notifications.success({
    text: t("sales_rep.list_sharing.share_success"),
    duration: 10000,
    single: true,
  });
}

defineExpose({
  canSave: computed(() => !!selectedOrganizationId.value),
  dirty: isNewTarget,
  payload: computed(() => ({ sharedWithId: selectedOrganizationId.value })),
  onSaved: async (context: WishlistSharingScopeSavedContextType) => {
    if (!isNewTarget.value || !selectedOrganizationId.value) {
      return;
    }

    await notifyCustomer(selectedOrganizationId.value, context);
  },
});
</script>

<style lang="scss">
.wishlist-customer-sharing {
  @apply space-y-4;
}
</style>
