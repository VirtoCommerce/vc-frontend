<template>
  <VcWidget v-if="pendingInvites.length" :title="$t('shared.account.pending_invites_widget.title')">
    <template #default-container>
      <ul class="divide-y px-[--p-x] pb-5 pt-4">
        <li
          v-for="invite in pendingInvites"
          :key="invite.id"
          class="flex flex-col items-start gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <span class="font-bold">{{ invite.name }}</span>

          <div class="flex gap-2">
            <VcButton
              size="sm"
              variant="outline"
              color="secondary"
              :aria-label="`${$t('shared.account.pending_invites_widget.reject_button')} ${invite.name}`"
              :disabled="!!processingOrgId || loading"
              :loading="processingOrgId === invite.id"
              @click="reject(invite.id)"
            >
              {{ $t("shared.account.pending_invites_widget.reject_button") }}
            </VcButton>

            <VcButton
              size="sm"
              :aria-label="`${$t('shared.account.pending_invites_widget.accept_button')} ${invite.name}`"
              :disabled="!!processingOrgId || loading"
              :loading="processingOrgId === invite.id"
              @click="accept(invite.id)"
            >
              {{ $t("shared.account.pending_invites_widget.accept_button") }}
            </VcButton>
          </div>
        </li>
      </ul>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useUserPendingInvites } from "@/shared/account/composables/useUserPendingInvites";
import { useNotifications } from "@/shared/notification";

const { t } = useI18n();
const notifications = useNotifications();
const { pendingInvites, loading, acceptInvite, rejectInvite } = useUserPendingInvites();

// `loading` from the composable is shared across every pending invite — track which row is
// actually being acted on separately, so accepting one invite doesn't spin every row's buttons.
const processingOrgId = ref<string | null>(null);

async function accept(organizationId: string): Promise<void> {
  processingOrgId.value = organizationId;

  try {
    await acceptInvite(organizationId);

    notifications.success({
      text: t("shared.account.pending_invites_widget.invite_accepted"),
      duration: 10000,
      single: true,
    });
  } catch {
    notifications.error({
      text: t("shared.account.pending_invites_widget.action_failed"),
      duration: 5000,
      single: true,
    });
  } finally {
    processingOrgId.value = null;
  }
}

async function reject(organizationId: string): Promise<void> {
  processingOrgId.value = organizationId;

  try {
    await rejectInvite(organizationId);

    notifications.success({
      text: t("shared.account.pending_invites_widget.invite_rejected"),
      duration: 10000,
      single: true,
    });
  } catch {
    notifications.error({
      text: t("shared.account.pending_invites_widget.action_failed"),
      duration: 5000,
      single: true,
    });
  } finally {
    processingOrgId.value = null;
  }
}
</script>
