<template>
  <div class="wishlist-customer-sharing">
    <VcSelect
      v-model="selected"
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
      multiple
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
      v-if="selected.length"
      :recipients="selected"
      :disabled="saving"
      @remove="deselect"
      @clear="clearSelection"
    />

    <VcTextarea
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
import type { WishlistSharingRecipientType } from "../types";
import type { SharingTargetType } from "@/core/api/graphql/types";
import type { WishlistSharingScopeSavedContextType } from "@/shared/wishlists";

interface IProps {
  /** Customers the list is already shared with, with name and city resolved by this module's backend. */
  targets: SharingTargetType[];
  /** The note saved with the share, shown again when the dialog is reopened. */
  message: string;
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

const persistedIds = computed(() => new Set(props.targets.map((target) => target.id)));

// The draft the rep is building. `VcSelect` in multiple mode carries whole items, which is what the recipients list
// wants anyway — so no second lookup for a row's name and city.
// Seeded once deliberately: the draft belongs to the rep, and `<KeepAlive>` in the share dialog is what carries it
// across a scope switch. A later server value must not overwrite what they picked.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- see above
const selected = ref<WishlistSharingRecipientType[]>(props.targets.map(toRecipient));

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- seeded once, same reason as `selected`
const shareMessage = ref(props.message);

const selectedIds = computed(() => new Set(selected.value.map((recipient) => recipient.organizationId)));

const addedIds = computed(() => [...selectedIds.value].filter((id) => !persistedIds.value.has(id)));
const removedIds = computed(() => [...persistedIds.value].filter((id) => !selectedIds.value.has(id)));

const messageChanged = computed(() => shareMessage.value.trim() !== props.message.trim());

// Only a genuinely different set counts: re-selecting the original (including A -> B -> A) is no change.
const isDirty = computed(() => addedIds.value.length > 0 || removedIds.value.length > 0 || messageChanged.value);

// A customer already granted may sit on a page the picker never fetched, or on none at all once the ACL changed.
// Listing them keeps their checkbox ticked, so unticking is possible from the dropdown and not only from the rows.
const pickerOptions = computed<WishlistSharingRecipientType[]>(() => {
  const missing = props.targets.filter((target) => !findOption(target.id));

  return [...missing.map(toRecipient), ...options.value];
});

const fieldMessage = computed(() => {
  if (failed.value) {
    return t("sales_rep.list_sharing.share_customers_error");
  }

  // Emptying the list leaves Save disabled with nothing said, and the way out is on another tab — so say so.
  if (!selected.value.length && persistedIds.value.size) {
    return t("sales_rep.list_sharing.share_empty_hint");
  }

  return "";
});

// The backend leaves both null when the module owning the scope cannot resolve the principal — a deleted
// organization, most likely — and the id is the only thing left to show.
function toRecipient(target: SharingTargetType): WishlistSharingRecipientType {
  return {
    organizationId: target.id,
    organizationName: target.name ?? target.id,
    location: target.subtitle ?? "",
  };
}

function deselect(organizationId: string): void {
  selected.value = selected.value.filter((recipient) => recipient.organizationId !== organizationId);
}

function clearSelection(): void {
  selected.value = [];
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

  // One send for the whole set: the backend fans out to every member of every organization, and a member of several
  // of them still receives it once.
  const result = await sendCommunication({
    organizationIds,
    sendEmail: true,
    sendPush: true,
    title: t("sales_rep.list_sharing.share_default_title"),
    message: [body, context.sharingLink].join(SEPARATOR),
  });

  const details = result.warnings.map(localizeWarning).filter(Boolean).join(" ");

  if (result.succeeded && !result.warnings.length) {
    notifications.success({
      text: t("sales_rep.list_sharing.share_success", { count: organizationIds.length }, organizationIds.length),
      duration: 10000,
      single: true,
    });

    return;
  }

  // The list is already saved, so a delivery problem is a warning about the notification, never a save error.
  const summary = result.succeeded
    ? t("sales_rep.list_sharing.share_partial")
    : t("sales_rep.list_sharing.share_notify_error");

  notifications.warning({
    text: [summary, details].filter(Boolean).join(" "),
    duration: 10000,
    single: true,
  });
}

defineExpose({
  // An emptied list is not a way to stop sharing — that is the scope's job, and the hint above says so.
  canSave: computed(() => selected.value.length > 0),
  dirty: isDirty,
  payload: computed(() => ({
    addSharedWithIds: addedIds.value,
    removeSharedWithIds: removedIds.value,
    message: shareMessage.value.trim(),
  })),
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
