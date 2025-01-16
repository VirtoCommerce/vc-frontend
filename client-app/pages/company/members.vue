<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between gap-3">
      <VcTypography tag="h1">
        {{ $t("pages.company.members.title") }}
      </VcTypography>

      <VcButton
        v-if="$can($permissions.storefront.CanInviteUsers)"
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

    <div ref="stickyMobileHeaderAnchor" class="-mt-5"></div>

    <!-- Page Toolbar -->
    <PageToolbarBlock
      :stick="stickyMobileHeaderIsVisible"
      class="-my-3.5 flex flex-row items-center gap-x-2 py-3.5 lg:flex-row-reverse lg:gap-x-5"
      shadow
    >
      <div class="relative">
        <VcButton
          ref="filtersButtonElement"
          :disabled="contactsLoading"
          :icon="isMobile"
          :variant="isMobile ? 'solid' : 'outline'"
          @click="filtersVisible = !filtersVisible"
        >
          <VcIcon name="filter" class="lg:hidden" />

          <span>{{ $t("common.buttons.filters") }}</span>

          <template #append>
            <transition :name="isMobile ? 'fade' : 'slide-fade-right'">
              <VcBadge
                v-if="numberOfFacetsApplied"
                :color="contactsLoading ? 'neutral' : 'primary'"
                :variant="isMobile ? 'outline' : 'solid'"
                class="ms-2"
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
          <VcDialog dividers>
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
                size="sm"
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
                size="sm"
                variant="outline"
                min-width="6.25rem"
                @click="hideFilters()"
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
          @keydown.enter="applyKeyword"
        >
          <template #append>
            <button v-if="localKeyword" type="button" class="flex h-full items-center px-4" @click="resetKeyword">
              <VcIcon
                :aria-label="$t('common.buttons.reset_company_members_search_keyword')"
                class="fill-primary"
                name="delete-2"
                size="xs"
              />
            </button>

            <VcButton
              :aria-label="$t('common.buttons.search_company_members')"
              :disabled="contactsLoading"
              icon="search"
              @click="applyKeyword"
            />
          </template>
        </VcInput>
      </div>
    </PageToolbarBlock>

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
        keyword || filter
          ? $t('pages.company.members.no_results_message')
          : $t('pages.company.members.no_members_message')
      "
      icon="thin-order"
    >
      <template #button>
        <VcButton v-if="keyword || filter" prepent-icon="reset" @click="resetFiltersWithKeyword">
          {{ $t("pages.company.members.buttons.reset_search") }}
        </VcButton>

        <VcButton v-else :to="{ name: 'Catalog' }">
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
          @header-click="applySorting"
          @page-changed="changePage"
        >
          <template #desktop-body>
            <tr v-for="contact in contacts" :key="contact.id" class="even:bg-neutral-50">
              <td class="py-2.5 pl-4 pr-0">
                <RoleIcon :role-id="contact.extended.roles[0]?.id" />
              </td>

              <td class="px-4 py-2.5">
                {{ contact.fullName }}
              </td>

              <td class="px-4 py-2.5">
                {{ contact.extended.roles[0]?.name }}
              </td>

              <td class="w-1/4 truncate px-4 py-2.5">
                {{ contact.extended.emails[0] }}
              </td>

              <td class="px-4 py-3 text-center">
                <MemberStatus :status="contact.status" />
              </td>

              <td v-if="userCanEditOrganization" class="px-5 text-right">
                <MembersDropdownMenu
                  v-if="contact.id !== user.memberId"
                  :contact-status="contact.status"
                  class="inline-block"
                  @edit="openEditCustomerRoleModal(contact)"
                  @remove="openDeleteModal(contact)"
                  @lock-or-unlock="openLockOrUnlockModal(contact, $event)"
                />
              </td>
            </tr>
          </template>

          <template #desktop-skeleton>
            <tr v-for="row in itemsPerPage" :key="row" class="even:bg-neutral-50">
              <td class="py-2.5 pl-4 pr-0">
                <div class="size-9 animate-pulse rounded-full bg-neutral-200"></div>
              </td>

              <td v-for="column in columns.length - 1" :key="column" class="px-4 py-3">
                <div class="h-5 animate-pulse bg-neutral-200"></div>
              </td>
            </tr>
          </template>

          <template #mobile-item="{ item }">
            <div class="flex items-center border-b px-5">
              <div class="py-4.5">
                <RoleIcon :role-id="item.extended.roles[0]?.id" />
              </div>

              <div class="grow py-4.5 pl-4">
                <div>
                  <b>{{ item.fullName }}</b>
                </div>

                <div class="text-sm">
                  {{ item.extended.roles[0]?.name }}
                </div>
              </div>

              <div class="py-4.5 pr-3">
                <MemberStatus :status="item.status" />
              </div>

              <div v-if="userCanEditOrganization" class="w-7 flex-none">
                <MembersDropdownMenu
                  v-if="item.id !== user.memberId"
                  :contact-status="item.status"
                  placement="left-start"
                  @edit="openEditCustomerRoleModal(item)"
                  @remove="openDeleteModal(item)"
                  @lock-or-unlock="openLockOrUnlockModal(item, $event)"
                />
              </div>
            </div>
          </template>

          <template #mobile-skeleton>
            <div
              v-for="row in itemsPerPage"
              :key="row"
              class="grid grid-cols-2 gap-y-4 border-b border-neutral-200 p-6"
            >
              <div class="flex flex-col">
                <div class="animate-pulse bg-neutral-200 py-6 pl-6"></div>
              </div>

              <div class="flex flex-col">
                <div class="animate-pulse bg-neutral-200 py-6 pl-4"></div>
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
import { breakpointsTailwind, computedEager, onClickOutside, useBreakpoints, useElementVisibility } from "@vueuse/core";
import { computed, onMounted, ref, shallowRef } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { B2B_ROLES } from "@/core/constants";
import { XApiPermissions } from "@/core/enums";
import { getFilterExpressionFromFacets } from "@/core/utilities";
import { PageToolbarBlock, useUser } from "@/shared/account";
import { FacetItem } from "@/shared/common";
import {
  EditCustomerRoleModal,
  InviteMemberModal,
  MemberStatus,
  MembersDropdownMenu,
  RoleIcon,
  useOrganizationContacts,
} from "@/shared/company";
import { useOrganizationContactsFilterFacets } from "@/shared/company/composables/useOrganizationContactsFilterFacets";
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
  itemsPerPage,
  sort,
  keyword,
  filter,
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
const breakpoints = useBreakpoints(breakpointsTailwind);
const notifications = useNotifications();

const isMobile = breakpoints.smaller("lg");

const localKeyword = ref("");
const filtersVisible = ref(false);
const filtersButtonElement = shallowRef<HTMLElement | null>(null);
const filtersDropdownElement = shallowRef<HTMLElement | null>(null);

const stickyMobileHeaderAnchor = shallowRef<HTMLElement | null>(null);
const stickyMobileHeaderAnchorIsVisible = useElementVisibility(stickyMobileHeaderAnchor);
const stickyMobileHeaderIsVisible = computed<boolean>(() => !stickyMobileHeaderAnchorIsVisible.value && isMobile.value);

const userCanEditOrganization = computedEager<boolean>(() => checkPermissions(XApiPermissions.CanEditOrganization));

const columns = computed<ITableColumn[]>(() => {
  const result: ITableColumn[] = [
    {
      id: "roleIcon",
      classes: "w-14",
    },
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

  if (userCanEditOrganization.value) {
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

async function applyFilters() {
  applyFacets();
  filter.value = getFilterExpressionFromFacets(appliedFacets);
  page.value = 1;
  await fetchContacts();
}

async function resetFilterItem(facet: FacetItemType, facetValue: FacetValueItemType) {
  resetFacetItem({ paramName: facet.paramName, value: facetValue.value });
  filter.value = getFilterExpressionFromFacets(appliedFacets);
  page.value = 1;
  await fetchContacts();
}

async function resetFilters() {
  resetFacets();
  filter.value = "";
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
        if (isUnlock) {
          await unlockContact(contact);
        } else {
          await lockContact(contact);
        }
        closeLockOrUnlockModal();
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
      currentRoleId: contact.extended.roles[0].id,
      loading: contactsLoading,

      async onConfirm(selectedRoleId: string): Promise<void> {
        const result = await changeContactOrganizationRole({
          userId: contact.securityAccounts![0].id,
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
            text: t("common.messages.role_update_failed", [result?.errors?.join(" ")]),
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
