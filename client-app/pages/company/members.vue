<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between gap-3">
      <VcTypography class="[word-break:break-word]" tag="h1">
        {{ $t("pages.company.members.title") }}
      </VcTypography>

      <VcButton
        v-if="$can($permissions.xApi.CanInviteUsers)"
        variant="outline"
        class="flex-none"
        @click="openInviteModal"
      >
        <span class="md:hidden">{{ $t("pages.company.members.buttons.invite") }}</span>

        <span class="hidden md:inline">{{ $t("pages.company.members.buttons.invite_members") }}</span>
      </VcButton>
    </div>

    <!-- Mobile filters sidebar -->
    <VcPopupSidebar :is-visible="isMobile && filtersVisible" @hide="hideFilters">
      <div class="space-y-3.5">
        <FacetItem v-for="(_, index) in selectableFacets" :key="index" v-model="selectableFacets[index]" />
      </div>

      <template #footer>
        <VcButton
          :disabled="!numberOfFacetsApplied && !isFacetsDirty"
          class="me-auto"
          variant="outline"
          color="secondary"
          size="sm"
          icon="reset"
          :title="$t('common.buttons.reset')"
          @click="
            resetFilters();
            hideFilters();
          "
        />

        <VcButton
          :disabled="!numberOfFacetsApplied && !isFacetsDirty"
          variant="outline"
          size="sm"
          min-width="6.25rem"
          @click="hideFilters"
        >
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton
          :disabled="!isFacetsDirty"
          size="sm"
          min-width="6.25rem"
          @click="
            applyFilters();
            hideFilters();
          "
        >
          {{ $t("common.buttons.apply") }}
        </VcButton>
      </template>
    </VcPopupSidebar>

    <div class="flex flex-row items-center gap-x-2 lg:flex-row-reverse lg:gap-x-5">
      <div class="relative">
        <VcButton
          ref="filtersButtonElement"
          :disabled="contactsLoading"
          :icon="isMobile"
          :variant="isMobile ? 'solid' : 'outline'"
          :min-width="numberOfFacetsApplied ? '4.25rem' : null"
          @click="filtersVisible = !filtersVisible"
        >
          <VcIcon v-if="isMobile" name="filter" />

          <span v-else>{{ $t("common.buttons.filters") }}</span>

          <template #append>
            <transition :name="isMobile ? 'fade' : 'slide-fade-right'">
              <VcBadge
                v-if="numberOfFacetsApplied"
                :color="contactsLoading ? 'neutral' : 'primary'"
                :variant="isMobile ? 'outline' : 'solid'"
                class="ms-1.5"
                rounded
              >
                {{ numberOfFacetsApplied }}
              </VcBadge>
            </transition>
          </template>
        </VcButton>

        <!-- Desktop filters dropdown -->
        <div
          v-if="filtersVisible && !isMobile"
          ref="filtersDropdownElement"
          class="absolute right-0 z-[1] mt-2 w-[27.5rem]"
        >
          <VcDialog dividers size="xs">
            <VcDialogHeader @close="hideFilters">
              {{ $t("pages.company.members.filters") }}
            </VcDialogHeader>

            <VcDialogContent>
              <div class="flex gap-5">
                <FacetItem
                  v-for="(_, index) in selectableFacets"
                  :key="index"
                  v-model="selectableFacets[index]"
                  class="w-0 grow"
                />
              </div>
            </VcDialogContent>

            <VcDialogFooter>
              <VcButton
                :disabled="!numberOfFacetsApplied && !isFacetsDirty"
                color="secondary"
                variant="outline"
                min-width="6.25rem"
                @click="
                  resetFilters();
                  hideFilters();
                "
              >
                {{ $t("common.buttons.reset") }}
              </VcButton>

              <VcButton
                :disabled="!numberOfFacetsApplied && !isFacetsDirty"
                variant="outline"
                min-width="6.25rem"
                @click="hideFilters()"
              >
                {{ $t("common.buttons.cancel") }}
              </VcButton>

              <VcButton
                :disabled="!isFacetsDirty"
                min-width="6.25rem"
                @click="
                  applyFilters();
                  hideFilters();
                "
              >
                {{ $t("common.buttons.apply") }}
              </VcButton>
            </VcDialogFooter>
          </VcDialog>
        </div>
      </div>

      <div class="flex grow">
        <VcInput
          v-model="localKeyword"
          maxlength="64"
          class="w-full"
          :disabled="contactsLoading"
          :placeholder="$t('pages.company.members.search_placeholder')"
          clearable
          @keydown.enter="applyKeyword"
          @clear="resetKeyword"
        >
          <template #append>
            <VcButton
              :aria-label="$t('common.buttons.search_company_members')"
              :disabled="contactsLoading"
              icon="search"
              icon-size="1.25rem"
              @click="applyKeyword"
            />
          </template>
        </VcInput>
      </div>
    </div>

    <!-- Filters chips -->
    <div v-if="numberOfFacetsApplied" class="hidden flex-wrap gap-x-3 gap-y-2 lg:flex">
      <template v-for="facet in appliedFacets">
        <template v-for="facetValue in facet.values">
          <VcChip
            v-if="facetValue.selected"
            :key="facet.paramName + facetValue.value"
            color="secondary"
            closable
            @close="resetFilterItem(facet, facetValue)"
          >
            {{ facetValue.label }}
          </VcChip>
        </template>
      </template>

      <VcChip color="secondary" variant="outline" clickable @click="resetFilters">
        <span>{{ $t("common.buttons.reset_filters") }}</span>

        <VcIcon name="reset" />
      </VcChip>
    </div>

    <!-- Empty view -->
    <VcEmptyView
      v-if="!contacts.length && !contactsLoading"
      :text="
        keyword || filter || roleIds.length
          ? $t('pages.company.members.no_results_message')
          : $t('pages.company.members.no_members_message')
      "
      icon="outline-order"
      :variant="!!keyword || !!filter || !!roleIds.length ? 'search' : 'empty'"
    >
      <template #button>
        <VcButton v-if="keyword || filter || roleIds.length" prepend-icon="reset" @click="resetFiltersWithKeyword">
          {{ $t("pages.company.members.buttons.reset_search") }}
        </VcButton>

        <VcButton v-else-if="!!continue_shopping_link" :external-link="continue_shopping_link">
          {{ $t("pages.company.members.buttons.no_members") }}
        </VcButton>

        <VcButton v-else to="/">
          {{ $t("pages.company.members.buttons.no_members") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <!-- Content block -->
    <VcWidget v-else size="lg">
      <template #default-container>
        <VcTable
          :loading="contactsLoading"
          :items="contacts"
          :columns="columns"
          :sort="sort"
          :pages="pages"
          :page="page"
          :description="$t('pages.company.members.meta.table_description')"
          mobile-breakpoint="lg"
          @header-click="applySorting"
          @page-changed="changePage"
        >
          <template #desktop-body>
            <tr v-for="contact in contacts" :key="contact.id" class="even:bg-neutral-50">
              <td class="w-40 truncate px-4 py-2.5" :title="contact.fullName">
                {{ contact.fullName }}
              </td>

              <td class="px-4 py-2.5">
                {{ contact.extended.roles.map((r) => r.name).join(", ") }}
              </td>

              <td class="w-1/4 max-w-52 truncate px-4 py-2.5" :title="contact.extended.emails[0]">
                {{ contact.extended.emails[0] }}
              </td>

              <td class="px-4 py-3 text-center">
                <MemberStatus :status="contact.status" />
              </td>

              <td v-if="canManageMembers" class="px-5 text-right">
                <MembersDropdownMenu
                  v-if="canShowDropdownFor(contact)"
                  :contact-status="contact.isLockedInOrganization ? ContactStatus.Locked : contact.status"
                  :can-edit-organization="userCanEditOrganization"
                  :can-login-on-behalf="canLoginOnBehalfOf(contact)"
                  class="inline-block"
                  @edit="openEditCustomerRoleModal(contact)"
                  @remove="openDeleteModal(contact)"
                  @lock-or-unlock="openLockOrUnlockModal(contact, $event)"
                  @login-on-behalf="openLoginOnBehalfModal(contact)"
                />
              </td>
            </tr>
          </template>

          <template #mobile-item="{ item }">
            <div class="flex items-center border-b px-5">
              <div class="grow py-4.5 [word-break:break-word]">
                <div>
                  <b>{{ item.fullName }}</b>
                </div>

                <div class="text-sm">
                  {{ item.extended.roles.map((r) => r.name).join(", ") }}
                </div>
              </div>

              <div class="py-4.5 pr-3">
                <MemberStatus :status="item.status" />
              </div>

              <div v-if="canManageMembers" class="w-7 flex-none">
                <MembersDropdownMenu
                  v-if="canShowDropdownFor(item)"
                  :contact-status="item.isLockedInOrganization ? ContactStatus.Locked : item.status"
                  :can-edit-organization="userCanEditOrganization"
                  :can-login-on-behalf="canLoginOnBehalfOf(item)"
                  placement="left-start"
                  @edit="openEditCustomerRoleModal(item)"
                  @remove="openDeleteModal(item)"
                  @lock-or-unlock="openLockOrUnlockModal(item, $event)"
                  @login-on-behalf="openLoginOnBehalfModal(item)"
                />
              </div>
            </div>
          </template>

          <template #page-limit-message>
            {{ $t("ui_kit.reach_limit.page_limit_filters") }}
          </template>
        </VcTable>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, onClickOutside, useBreakpoints } from "@vueuse/core";
import { computed, onMounted, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { B2B_ROLES } from "@/core/constants";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { PlatformPermissions, XApiPermissions } from "@/core/enums";
import { getFilterExpressionFromFacets } from "@/core/utilities";
import { useUser } from "@/shared/account";
import { FacetItem } from "@/shared/common";
import {
  EditCustomerRoleModal,
  InviteMemberModal,
  MemberStatus,
  MembersDropdownMenu,
  useOrganizationContacts,
} from "@/shared/company";
import { useOrganizationContactsFilterFacets } from "@/shared/company/composables/useOrganizationContactsFilterFacets";
import { ContactStatus } from "@/shared/company/types";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { FacetItemType, FacetValueItemType, ISortInfo } from "@/core/types";
import type { ExtendedContactType } from "@/shared/company";
import type { INotification } from "@/shared/notification";

const { t } = useI18n();

usePageHead({
  title: t("pages.company.members.meta.title"),
});

/**
 * This page is accessible only to members of the organization,
 * so the organization must exist.
 */
const { user, checkPermissions, organization } = useUser();
const {
  loading: contactsLoading,
  page,
  pages,
  sort,
  keyword,
  filter,
  roleIds,
  contacts,
  fetchContacts,
  lockContact,
  unlockContact,
  removeMemberFromOrganization,
  changeContactOrganizationRole,
} = useOrganizationContacts(organization.value!.id);
const {
  selectableFacets,
  appliedFacets,
  isFacetsDirty,
  numberOfFacetsApplied,
  resetSelectableToAppliedFacets,
  applyFacets,
  resetFacets,
  resetFacetItem,
} = useOrganizationContactsFilterFacets();
const { openModal } = useModal();
const router = useRouter();
const breakpoints = useBreakpoints(breakpointsTailwind);
const notifications = useNotifications();
const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

const isMobile = breakpoints.smaller("lg");

const { continue_shopping_link } = getModuleSettings({
  [MODULE_XAPI_KEYS.CONTINUE_SHOPPING_LINK]: "continue_shopping_link",
});

const localKeyword = ref("");
const filtersVisible = ref(false);
const filtersButtonElement = shallowRef<HTMLElement | null>(null);
const filtersDropdownElement = shallowRef<HTMLElement | null>(null);

const userCanEditOrganization = computed<boolean>(() => checkPermissions(XApiPermissions.CanEditOrganization));
const userCanLoginOnBehalf = computed<boolean>(() => checkPermissions(PlatformPermissions.CanImpersonate));
const canManageMembers = computed<boolean>(() => userCanEditOrganization.value || userCanLoginOnBehalf.value);

function canLoginOnBehalfOf(contact: ExtendedContactType): boolean {
  return userCanLoginOnBehalf.value && !!contact.securityAccounts?.length;
}

function canShowDropdownFor(contact: ExtendedContactType): boolean {
  return contact.id !== user.value.memberId && (userCanEditOrganization.value || canLoginOnBehalfOf(contact));
}

const columns = computed<VcTableColumnType[]>(() => {
  const result: VcTableColumnType[] = [
    {
      id: "name",
      title: t("pages.company.members.content_header.name"),
      sortable: true,
    },
    {
      id: "role",
      title: t("pages.company.members.content_header.role"),
    },
    {
      id: "email",
      title: t("pages.company.members.content_header.email"),
    },
    {
      id: "status",
      title: t("pages.company.members.content_header.active"),
      align: "center",
      classes: "w-24",
    },
  ];

  if (canManageMembers.value) {
    // Add action column
    result.push({
      id: "actions",
      classes: "w-20",
    });
  }

  return result;
});

async function changePage(newPage: number) {
  page.value = newPage;
  window.scroll({ top: 0, behavior: "smooth" });
  await fetchContacts();
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = sortInfo;
  page.value = 1;
  await fetchContacts();
}

async function applyKeyword() {
  keyword.value = localKeyword.value.trim();
  page.value = 1;
  await fetchContacts();
}

async function resetKeyword() {
  localKeyword.value = "";

  if (keyword.value) {
    await applyKeyword();
  }
}

function syncFilterFromFacets() {
  const roleFacet = appliedFacets.value.find((f) => f.paramName === "roleId");
  roleIds.value = roleFacet?.values.filter((v) => v.selected).map((v) => v.value) ?? [];
  const nonRoleFacets = appliedFacets.value.filter((f) => f.paramName !== "roleId");
  filter.value = getFilterExpressionFromFacets(nonRoleFacets);
}

async function applyFilters() {
  applyFacets();
  syncFilterFromFacets();
  page.value = 1;
  await fetchContacts();
}

async function resetFilterItem(facet: FacetItemType, facetValue: FacetValueItemType) {
  resetFacetItem({ paramName: facet.paramName, value: facetValue.value });
  syncFilterFromFacets();
  page.value = 1;
  await fetchContacts();
}

async function resetFilters() {
  resetFacets();
  filter.value = "";
  roleIds.value = [];
  page.value = 1;
  await fetchContacts();
}

function resetFiltersWithKeyword() {
  localKeyword.value = "";
  keyword.value = "";
  void resetFilters();
}

function hideFilters() {
  filtersVisible.value = false;
  resetSelectableToAppliedFacets();
}

function openInviteModal() {
  openModal({
    component: InviteMemberModal,
    props: {
      onResult(succeed: boolean) {
        if (succeed) {
          void fetchContacts();
        }
      },
    },
  });
}

function openLockOrUnlockModal(contact: ExtendedContactType, isUnlock?: boolean): void {
  const closeLockOrUnlockModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: isUnlock ? "info" : "danger",
      loading: contactsLoading,
      title: isUnlock ? t("shared.company.unblock_member_modal.title") : t("shared.company.block_member_modal.title"),
      text: isUnlock ? t("shared.company.unblock_member_modal.text") : t("shared.company.block_member_modal.text"),
      async onConfirm() {
        try {
          if (isUnlock) {
            await unlockContact(contact);
          } else {
            await lockContact(contact);
          }
        } catch {
          notifications.error({ duration: 5000, single: true, text: t("common.messages.contact_lock_failed") });
        }
        closeLockOrUnlockModal();
      },
    },
  });
}

function openLoginOnBehalfModal(contact: ExtendedContactType): void {
  const closeLoginOnBehalfModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "info",
      title: t("shared.company.login_on_behalf_modal.title"),
      text: t("shared.company.login_on_behalf_modal.text", {
        email: contact.extended.emails?.[0] ?? contact.fullName,
      }),
      onConfirm() {
        if (!contact.securityAccounts?.length) {
          return;
        }
        closeLoginOnBehalfModal();
        void router.push({ name: "Impersonate", params: { userId: contact.securityAccounts[0].id } });
      },
    },
  });
}

function openDeleteModal(contact: ExtendedContactType): void {
  const closeDeleteModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      loading: contactsLoading,
      title: t("shared.company.delete_member_modal.title"),
      text: t("shared.company.delete_member_modal.text", {
        name: `${contact.fullName} (${contact.extended.emails[0]})`,
      }),
      async onConfirm() {
        await removeMemberFromOrganization({
          contactId: contact.id,
          organizationId: organization.value!.id,
        });
        closeDeleteModal();
      },
    },
  });
}

function openEditCustomerRoleModal(contact: ExtendedContactType): void {
  const closeEditCustomerRoleModal = openModal({
    component: EditCustomerRoleModal,
    props: {
      roles: B2B_ROLES,
      currentRoleId: contact.extended.roles[0]?.id,
      loading: contactsLoading,

      async onConfirm(selectedRoleId: string): Promise<void> {
        const result = await changeContactOrganizationRole({
          memberId: contact.id,
          roleIds: [selectedRoleId],
        });

        const notification: INotification = {
          duration: 5000,
          single: true,
        };

        if (result?.succeeded) {
          notifications.success({ ...notification, text: t("common.messages.role_update_successful") });

          await fetchContacts();
        } else {
          notifications.error({
            ...notification,

            text: t("common.messages.role_update_failed"),
          });
        }

        closeEditCustomerRoleModal();
      },
    },
  });
}

onClickOutside(
  filtersDropdownElement,
  () => {
    filtersVisible.value = false;
  },
  { ignore: [filtersButtonElement] },
);

onMounted(() => {
  void fetchContacts();
});
</script>
