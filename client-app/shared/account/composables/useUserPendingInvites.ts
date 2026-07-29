import { createGlobalState } from "@vueuse/core";
import { onMounted, readonly, ref } from "vue";
import { getPendingOrganizationInvites } from "@/core/api/graphql/account";
import {
  acceptOrganizationInvite as _acceptOrganizationInvite,
  rejectOrganizationInvite as _rejectOrganizationInvite,
} from "@/core/api/graphql/organization";
import { Logger } from "@/core/utilities";
import { ContactStatus } from "@/shared/company/types";
import { useUser } from "./useUser";
import { useUserOrganizations } from "./useUserOrganizations";
import type { PendingOrganizationInviteType } from "@/core/api/graphql/account";

const PAGE_SIZE = 50;

function _useUserPendingInvites() {
  const pendingInvites = ref<PendingOrganizationInviteType[]>([]);
  const loading = ref(false);
  const initialized = ref(false);

  async function fetchPendingInvites(): Promise<void> {
    loading.value = true;

    try {
      const invites: PendingOrganizationInviteType[] = [];
      let after: string | undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const result = await getPendingOrganizationInvites({
          first: PAGE_SIZE,
          after,
          statuses: [ContactStatus.Invited],
        });
        invites.push(...result.items);
        hasNextPage = result.pageInfo.hasNextPage && !!result.pageInfo.endCursor;
        after = result.pageInfo.endCursor;
      }

      pendingInvites.value = invites;
      initialized.value = true;
    } catch (e) {
      Logger.error(`${_useUserPendingInvites.name}.${fetchPendingInvites.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function acceptInvite(organizationId: string): Promise<void> {
    loading.value = true;

    try {
      await _acceptOrganizationInvite(organizationId);
    } catch (e) {
      Logger.error(`${_useUserPendingInvites.name}.${acceptInvite.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    // Invite is already accepted server-side — these refreshes are independent, so one failing
    // (already logged by each call) must not skip the others or fail this call.
    const { reset: resetOrganizations, search } = useUserOrganizations();
    resetOrganizations();
    const { fetchUser } = useUser();

    await Promise.allSettled([fetchPendingInvites(), search(), fetchUser()]);
  }

  async function rejectInvite(organizationId: string): Promise<void> {
    loading.value = true;

    try {
      await _rejectOrganizationInvite(organizationId);
    } catch (e) {
      Logger.error(`${_useUserPendingInvites.name}.${rejectInvite.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }

    // Invite is already rejected server-side, so a refresh failure here (already logged by fetchPendingInvites) must not fail this.
    try {
      await fetchPendingInvites();
    } catch {
      // Ignored — see comment above.
    }
  }

  onMounted(() => {
    if (!initialized.value) {
      void fetchPendingInvites();
    }
  });

  return {
    pendingInvites: readonly(pendingInvites),
    loading: readonly(loading),
    initialized: readonly(initialized),
    fetchPendingInvites,
    acceptInvite,
    rejectInvite,
  };
}

export const useUserPendingInvites = createGlobalState(_useUserPendingInvites);
