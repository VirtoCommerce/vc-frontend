<template>
  <div class="wishlist-customer-sharing">
    <VcSelect
      :model-value="selected"
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
      lazy
      @change="onPickerChange"
    >
      <template #item="{ item }">
        <span class="wishlist-customer-sharing__option">
          <WishlistSharingAvatar :organization-name="item.organizationName" :image-url="item.imageUrl" />

          <span class="wishlist-customer-sharing__option-meta">
            <span class="wishlist-customer-sharing__option-name">{{ item.organizationName }}</span>

            <span v-if="item.location" class="wishlist-customer-sharing__option-location">{{ item.location }}</span>
          </span>
        </span>
      </template>
    </VcSelect>

    <WishlistSharingRecipients
      v-if="selected.length || clearedRecipients.length"
      :recipients="selected"
      :cleared-count="clearedRecipients.length"
      :disabled="saving"
      @remove="deselect"
      @clear="clearSelection"
      @restore="restoreSelection"
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
import type {
  IWishlistSharingScopeExposeType,
  WishlistSharingScopeSavedContextType,
} from "@/shared/wishlists/composables/useWishlistSharingScopes";

interface IProps {
  targets: SharingTargetType[];
  /** The note saved with the share. */
  message: string;
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

// Seeded once: the draft belongs to the rep, and `<KeepAlive>` carries it across a scope switch.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- see above
const selected = ref<WishlistSharingRecipientType[]>(props.targets.map(toRecipient));

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- see `selected`
const shareMessage = ref(props.message);

const selectedIds = computed(() => new Set(selected.value.map((recipient) => recipient.organizationId)));

const addedIds = computed(() => [...selectedIds.value].filter((id) => !persistedIds.value.has(id)));
const removedIds = computed(() => [...persistedIds.value].filter((id) => !selectedIds.value.has(id)));

const messageChanged = computed(() => shareMessage.value.trim() !== props.message.trim());

const isDirty = computed(() => addedIds.value.length > 0 || removedIds.value.length > 0 || messageChanged.value);

// A granted customer may sit on a page the picker never fetched; listing them keeps the row unticking possible.
const pickerOptions = computed<WishlistSharingRecipientType[]>(() => {
  const missing = props.targets.filter((target) => !findOption(target.id));

  // Merged into the backend's name sort rather than prepended, or a granted customer the page never carried would
  // sit above every option the search box shows.
  return [...missing.map(toRecipient), ...options.value].sort((a, b) =>
    a.organizationName.localeCompare(b.organizationName),
  );
});

const fieldMessage = computed(() => {
  if (failed.value) {
    return t("sales_rep.list_sharing.share_customers_error");
  }

  if (!selected.value.length && persistedIds.value.size) {
    return t("sales_rep.list_sharing.share_empty_hint");
  }

  return "";
});

// Name and subtitle are null once the organization is gone, leaving the id as the only thing to show.
function toRecipient(target: SharingTargetType): WishlistSharingRecipientType {
  return {
    organizationId: target.id,
    organizationName: target.name ?? target.id,
    location: target.subtitle ?? "",
    imageUrl: target.imageUrl ?? "",
  };
}

// The audience the server persisted, so the toast agrees with the card behind the dialog. The draft stands in only
// while the backend still returns no targets (VCST-5925).
function audienceCount(context: WishlistSharingScopeSavedContextType): number {
  return context.targets.length || selected.value.length;
}

// Counts everyone the list reaches; the notified subset is usually smaller.
function notifyShared(count: number): void {
  notifications.success({
    text: t("sales_rep.list_sharing.share_success", { count }, count),
    duration: 10000,
    single: true,
  });
}

// A save that only dropped recipients or reworded the note shared with nobody and notified nobody, so it cannot
// borrow the "List shared with N customers" copy.
function notifySaved(count: number): void {
  notifications.success({
    text: t("sales_rep.list_sharing.share_saved", { count }, count),
    duration: 10000,
    single: true,
  });
}

// One click empties the whole audience, and `targets` is the only other record of it — so the rows are kept in hand
// until the rep does something else with the list.
const clearedRecipients = ref<WishlistSharingRecipientType[]>([]);

function clearSelection(): void {
  clearedRecipients.value = selected.value;
  selected.value = [];
}

function restoreSelection(): void {
  selected.value = clearedRecipients.value;
  clearedRecipients.value = [];
}

function deselect(organizationId: string): void {
  clearedRecipients.value = [];
  selected.value = selected.value.filter((recipient) => recipient.organizationId !== organizationId);
}

// The kit hands back an empty array both for its own clear button and for unticking the last option, so both go
// through `clearSelection` — otherwise emptying the audience from the field would leave no way back. Any other
// change is the rep moving on, which is what retires the offer.
function onPickerChange(next: WishlistSharingRecipientType[]): void {
  if (!next.length && selected.value.length) {
    clearSelection();

    return;
  }

  clearedRecipients.value = [];
  selected.value = next;
}

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

  // One send for the whole set: a member of several of these organizations still receives it once.
  const result = await sendCommunication({
    organizationIds,
    sendEmail: true,
    sendPush: true,
    title: t("sales_rep.list_sharing.share_default_title"),
    message: [body, context.sharingLink].join(SEPARATOR),
  });

  // One send covers many organizations, so the backend repeats a code once per organization; the copy names none
  // of them, which makes the repetition pure noise.
  const details = [...new Set(result.warnings)].map(localizeWarning).filter(Boolean).join(" ");

  if (result.succeeded && !result.warnings.length) {
    notifyShared(audienceCount(context));

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

defineExpose<IWishlistSharingScopeExposeType>({
  // An emptied list is not a way to stop sharing — that is the scope's job.
  canSave: computed(() => selected.value.length > 0),
  dirty: isDirty,
  payload: computed(() => ({
    addSharedWithIds: addedIds.value,
    removeSharedWithIds: removedIds.value,
    message: shareMessage.value.trim(),
  })),
  onSaved: async (context: WishlistSharingScopeSavedContextType) => {
    // Only new recipients are notified; a save that just drops one still has to confirm itself.
    if (!addedIds.value.length) {
      notifySaved(audienceCount(context));

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
    // The leading is spelled out so the two lines total the avatar's 32 and the row stays balanced; the menu item
    // hands down 14/14.
    @apply truncate text-sm/[18px] font-bold text-neutral-950;
  }

  &__option-location {
    // `font-normal` against the kit: `VcMenuItem` bolds the whole row of a selected option, and the second line is
    // Regular in every state.
    @apply truncate text-xs font-normal text-neutral-500;
  }
}
</style>
