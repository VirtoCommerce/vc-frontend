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

    <template v-if="isNewTarget">
      <VcTextarea
        v-model="shareMessage"
        data-test-id="wishlist-share-message-input"
        :label="t('sales_rep.list_sharing.share_message_label')"
        :placeholder="t('sales_rep.list_sharing.share_message_placeholder')"
        :disabled="saving"
        rows="3"
        counter
        :max-length="messageMaxLength"
      />

      <fieldset>
        <VcLabel class="wishlist-customer-sharing__channels-label">
          {{ t("sales_rep.list_sharing.share_channels_label") }}
        </VcLabel>

        <div class="wishlist-customer-sharing__channels">
          <VcCheckbox v-model="sendEmail" :disabled="saving" test-id="wishlist-share-email-checkbox">
            {{ t("sales_rep.list_sharing.share_email_label") }}
          </VcCheckbox>

          <VcCheckbox v-model="sendPush" :disabled="saving" test-id="wishlist-share-push-checkbox">
            {{ t("sales_rep.list_sharing.share_push_label") }}
          </VcCheckbox>
        </div>
      </fieldset>
    </template>
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
  /** The customer this list is already published to, as persisted. */
  sharedWithId?: string;
  /** Built by the modal; appended to the notification so the customer can reach the list. */
  sharingLink: string;
  saving?: boolean;
}

const props = defineProps<IProps>();

const { t, te } = useI18n();
const notifications = useNotifications();
const { sendCommunication } = useSalesRepCommunication();
const { options, loading, failed } = useSalesRepCustomerOptions(true);

// The backend rejects a combined message over 1000 chars, and the link is appended to whatever the rep writes.
// Measuring the actual link (its host varies per store) keeps a long domain from silently pushing an otherwise-valid
// message over the limit.
const NOTIFICATION_MESSAGE_LIMIT = 1000;
const SEPARATOR = "\n\n";

// Read through a ref so seeding below doesn't count as losing prop reactivity; the value is only ever a starting point.
const persistedTarget = toRef(props, "sharedWithId");
// Pre-filled from the persisted target so re-opening a shared list shows the customer it went to.
const selectedOrganizationId = ref<string | undefined>(persistedTarget.value ?? undefined);
const shareMessage = ref("");
// Both channels on by default: publishing to a customer is pointless if they hear about it on neither. Unlike the
// rep's standalone "Send a message" modal, clearing both is allowed here — the list just saves without notifying.
const sendEmail = ref(true);
const sendPush = ref(true);

const messageMaxLength = computed(() => NOTIFICATION_MESSAGE_LIMIT - props.sharingLink.length - SEPARATOR.length);

// Messaging is offered only when this edit sets a genuinely NEW target vs. what was persisted: newly shared, or moved
// to a different customer. Re-selecting the original (including A -> B -> A) counts as no change.
const isNewTarget = computed(
  () => !!selectedOrganizationId.value && selectedOrganizationId.value !== (persistedTarget.value ?? undefined),
);

// The backend keeps a single sharing setting per list, so targeting another customer detaches the current one.
const replacesPreviousTarget = computed(() => isNewTarget.value && !!persistedTarget.value);

// VcSelect derives the selected label from `items`, falling back to the placeholder when it finds nothing. Since the
// options are capped, a target that is over the cap or lost to a failed fetch would render as "nothing selected" — and
// re-picking would then detach a customer the rep never meant to touch. Seeding keeps the selection visible; the name
// is unknown for a seeded entry, so the id stands in for it.
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

// Localizes a backend warning code. An unknown code yields nothing, so the caller keeps its own summary alone instead
// of repeating it once per code.
function localizeWarning(code: string): string | undefined {
  const key = `sales_rep.communication.warnings.${code}`;

  return te(key) ? t(key) : undefined;
}

async function notifyCustomer(organizationId: string, context: WishlistSharingScopeSavedContextType): Promise<void> {
  // The rep's own text replaces the default body; the link is always appended so the customer can reach the list.
  const body =
    shareMessage.value.trim() || t("sales_rep.list_sharing.share_default_message", { listName: context.listName });

  const result = await sendCommunication({
    organizationId,
    sendEmail: sendEmail.value,
    sendPush: sendPush.value,
    title: t("sales_rep.list_sharing.share_default_title"),
    message: [body, context.sharingLink].join(SEPARATOR),
  });

  // Per-channel detail, when the backend named a reason we can translate.
  const details = result.warnings.map(localizeWarning).filter(Boolean).join(" ");
  // The list itself is already saved; a delivery problem is a warning about the notification, never a save error.
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
  // A customer is mandatory for this scope, so an empty picker must not let the list be saved into it.
  canSave: computed(() => !!selectedOrganizationId.value),
  // Picking a different customer is a change the modal's own form cannot see.
  dirty: isNewTarget,
  payload: computed(() => ({ sharedWithId: selectedOrganizationId.value })),
  onSaved: async (context: WishlistSharingScopeSavedContextType) => {
    if (!isNewTarget.value || !selectedOrganizationId.value || !(sendEmail.value || sendPush.value)) {
      return;
    }

    await notifyCustomer(selectedOrganizationId.value, context);
  },
});
</script>

<style lang="scss">
.wishlist-customer-sharing {
  @apply space-y-4;

  &__channels-label {
    @apply mb-2;
  }

  &__channels {
    @apply flex flex-col gap-2;
  }
}
</style>
