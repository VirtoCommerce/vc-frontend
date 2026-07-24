import { createGlobalState } from "@vueuse/core";
import { computed, onMounted, readonly, ref } from "vue";
import { getPendingOrganizationInvites } from "@/core/api/graphql/account";
import {
  acceptOrganizationInvite as _acceptOrganizationInvite,
  rejectOrganizationInvite as _rejectOrganizationInvite,
} from "@/core/api/graphql/organization";
import { Logger } from "@/core/utilities";
import { ContactStatus } from "@/shared/company/types";
import { useUserOrganizations } from "./useUserOrganizations";
import type { PendingOrganizationInviteType } from "@/core/api/graphql/account";

const PAGE_SIZE = 50;

function _useUserPendingInvites() {
  const items = ref<PendingOrganizationInviteType[]>([]);
  const loading = ref(false);
  const initialized = ref(false);

  const pendingInvites = computed(() =>
    items.value.filter((item) => item.myStatusInOrganization === ContactStatus.Invited),
  );

  async function fetchPendingInvites(): Promise<void> {
    loading.value = true;

    try {
      const result = await getPendingOrganizationInvites({ first: PAGE_SIZE, statuses: [ContactStatus.Invited] });
      items.value = result.items;
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

    await fetchPendingInvites();

    // useUserOrganizations only fetches once on mount, so the switcher needs an explicit refresh
    // to show the newly-accepted organization without a full page reload.
    const { reset, search } = useUserOrganizations();
    reset();
    await search();
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

    await fetchPendingInvites();
  }

  onMounted(() => {
    if (!initialized.value) {
      void fetchPendingInvites();
    }
  });

  return {
    pendingInvites,
    loading: readonly(loading),
    initialized: readonly(initialized),
    fetchPendingInvites,
    acceptInvite,
    rejectInvite,
  };
}

export const useUserPendingInvites = createGlobalState(_useUserPendingInvites);
