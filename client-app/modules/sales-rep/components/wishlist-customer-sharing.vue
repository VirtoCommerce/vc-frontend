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
    >
      <template #item="{ item }">
        <span class="wishlist-customer-sharing__option">
          <WishlistSharingAvatar :organization-name="item.organizationName" />

          <span class="wishlist-customer-sharing__option-meta">
            <span class="wishlist-customer-sharing__option-name">{{ item.organizationName }}</span>

            <span v-if="item.location" class="wishlist-customer-sharing__option-location">{{ item.location }}</span>
          </span>
        </span>
      </template>
    </VcSelect>

    <WishlistSharingRecipients
      v-if="recipients.length"
      :recipients="recipients"
      :disabled="saving"
      @remove="deselect"
      @clear="clearSelection"
    />

    <VcTextarea
      v-if="addedIds.length"
      v-model="shareMessage"
      data-test-id="wishlist-share-message-input"
      :label="t('sales_rep.list_sharing.share_message_label')"
      :placeholder="t('sales_rep.list_sharing.share_message_placeholder')"
      :message="t('sales_rep.list_sharing.share_message_hint')"
      :disabled="saving"
      :max-length="MESSAGE_MAX_LENGTH"
      rows="2"
      counter
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@/shared/notification";
import { useSalesRepCommunication } from "../composables/useSalesRepCommunication";
import { useSalesRepCustomerOptions } from "../composables/useSalesRepCustomerOptions";
import WishlistSharingAvatar from "./wishlist-sharing-avatar.vue";
import WishlistSharingRecipients from "./wishlist-sharing-recipients.vue";
import type { SalesRepCustomerOptionType } from "../composables/useSalesRepCustomerOptions";
import type { WishlistSharingRecipientType } from "../types";
import type { WishlistSharingScopeSavedContextType } from "@/shared/wishlists";

interface IProps {
  /** Customers the list is already shared with. The backend holds a single grant, so only the first one is used. */
  sharedWithIds: string[];
  /** Appended to the notification so the customer can reach the list. */
  sharingLink: string;
  saving?: boolean;
}

const props = defineProps<IProps>();

const { t, te } = useI18n();
const notifications = useNotifications();
const { sendCommunication } = useSalesRepCommunication();
const { options, loading, failed, findOption } = useSalesRepCustomerOptions();

const MESSAGE_MAX_LENGTH = 250;
const SEPARATOR = "\n\n";

const persistedIds = computed(() => new Set(props.sharedWithIds));

// The draft the rep is building. A Set because the grant is about to become plural; today the backend keeps one
// sharing setting per list, so the picker is single-select and this holds at most one id.
// Seeded once deliberately: the draft belongs to the rep, and `<KeepAlive>` in the share dialog is what carries it
// across a scope switch. A later server value must not overwrite what they picked.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- see above
const selected = ref(new Set(props.sharedWithIds));

const shareMessage = ref("");

const selectedOrganizationId = computed<string | undefined>({
  get: () => [...selected.value][0],
  set: (organizationId) => {
    selected.value = new Set(organizationId ? [organizationId] : []);
  },
});

const addedIds = computed(() => [...selected.value].filter((id) => !persistedIds.value.has(id)));
const removedIds = computed(() => [...persistedIds.value].filter((id) => !selected.value.has(id)));

// Only a genuinely different set counts: re-selecting the original (including A -> B -> A) is no change.
const isDirty = computed(() => addedIds.value.length > 0 || removedIds.value.length > 0);

// The backend keeps a single sharing setting per list, so targeting another customer detaches the current one.
const replacesPreviousTarget = computed(() => addedIds.value.length > 0 && persistedIds.value.size > 0);

// VcSelect labels the selection by looking it up in `items`, so a target the picker never loaded — a failed fetch,
// or an ACL past the paging cap — would read as "nothing selected", and re-picking would detach a customer nobody
// meant to touch. The name is unknown for a seeded entry, so the id stands in.
const pickerOptions = computed<SalesRepCustomerOptionType[]>(() => {
  const missing = [...persistedIds.value].filter((id) => !findOption(id));

  return [...missing.map((id) => unknownCustomer(id)), ...options.value];
});

const recipients = computed<WishlistSharingRecipientType[]>(() =>
  [...selected.value].map((id) => findOption(id) ?? unknownCustomer(id)),
);

const fieldMessage = computed(() => {
  if (failed.value) {
    return t("sales_rep.list_sharing.share_customers_error");
  }

  // Emptying the list leaves Save disabled with nothing said, and the way out is on another tab — so say so.
  if (!selected.value.size && persistedIds.value.size) {
    return t("sales_rep.list_sharing.share_empty_hint");
  }

  return replacesPreviousTarget.value ? t("sales_rep.list_sharing.share_replace_hint") : "";
});

function unknownCustomer(organizationId: string): SalesRepCustomerOptionType {
  return { organizationId, organizationName: organizationId, location: "" };
}

function deselect(organizationId: string): void {
  selected.value.delete(organizationId);
}

function clearSelection(): void {
  selected.value.clear();
}

// An unknown code yields nothing, so the caller keeps its own summary instead of repeating it once per code.
function localizeWarning(code: string): string | undefined {
  const key = `sales_rep.communication.warnings.${code}`;

  return te(key) ? t(key) : undefined;
}

async function notifyCustomers(
  organizationIds: string[],
  context: WishlistSharingScopeSavedContextType,
): Promise<void> {
  const body =
    shareMessage.value.trim() || t("sales_rep.list_sharing.share_default_message", { listName: context.listName });

  const results = await Promise.all(
    organizationIds.map((organizationId) =>
      sendCommunication({
        organizationId,
        sendEmail: true,
        sendPush: true,
        title: t("sales_rep.list_sharing.share_default_title"),
        message: [body, context.sharingLink].join(SEPARATOR),
      }),
    ),
  );

  const failures = results.filter((result) => !result.succeeded);
  const codes = [...new Set(results.flatMap((result) => result.warnings))];
  const details = codes.map(localizeWarning).filter(Boolean).join(" ");

  if (!failures.length && !codes.length) {
    notifications.success({
      text: t("sales_rep.list_sharing.share_success"),
      duration: 10000,
      single: true,
    });

    return;
  }

  // The list is already saved, so a delivery problem is a warning about the notification, never a save error.
  const summary =
    failures.length === results.length
      ? t("sales_rep.list_sharing.share_notify_error")
      : t("sales_rep.list_sharing.share_partial");

  notifications.warning({
    text: [summary, details].filter(Boolean).join(" "),
    duration: 10000,
    single: true,
  });
}

defineExpose({
  // One recipient until the backend accepts a set: an emptied list is not a way to stop sharing, that is the
  // scope's job.
  canSave: computed(() => selected.value.size === 1),
  dirty: isDirty,
  payload: computed(() => ({ sharedWithId: selectedOrganizationId.value })),
  onSaved: async (context: WishlistSharingScopeSavedContextType) => {
    if (!addedIds.value.length) {
      return;
    }

    await notifyCustomers(addedIds.value, context);
  },
});
</script>

<style lang="scss">
.wishlist-customer-sharing {
  @apply space-y-4;

  &__option {
    @apply flex min-w-0 grow items-center gap-3;
  }

  &__option-meta {
    @apply flex min-w-0 grow flex-col;
  }

  &__option-name {
    @apply truncate font-bold text-neutral-950;
  }

  &__option-location {
    @apply truncate text-xs text-neutral-500;
  }
}
</style>
