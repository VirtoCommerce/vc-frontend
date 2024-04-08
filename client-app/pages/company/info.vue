<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.company.info.title") }}
    </VcTypography>

    <VcWidget size="lg">
      <template #default-container>
        <!-- Company name block -->
        <div class="flex items-start gap-3 p-5 shadow [--tw-shadow:0_10px_15px_0_rgb(0_0_0_/_0.06)]">
          <VcInput
            v-model="organizationName"
            :label="$t('pages.company.info.labels.company_name')"
            :disabled="!userCanEditOrganization || loadingOrganization || loadingUser"
            :message="errors[0]"
            :error="!!errors[0]"
            name="organization-name"
            autocomplete="off"
            maxlength="64"
            class="grow"
          />

          <VcButton
            v-if="userCanEditOrganization"
            :loading="loadingOrganization || loadingUser"
            :disabled="!meta.valid || !meta.dirty"
            :icon="companyNameSaveIcon"
            class="mt-[1.375rem] flex-none"
            @click="saveOrganizationName"
          >
            {{ $t("common.buttons.save") }}
          </VcButton>
        </div>

        <!-- Content block -->
        <div class="px-4 pb-5 md:p-5">
          <div
            v-if="addresses.length || loadingAddresses"
            class="mb-4 mt-9 flex flex-row items-center justify-between gap-3 md:mt-1.5"
          >
            <VcTypography tag="h2" variant="h3">
              {{ $t("pages.company.info.content_header") }}
            </VcTypography>

            <VcButton
              v-if="userCanEditOrganization"
              size="sm"
              variant="outline"
              @click="openAddOrUpdateCompanyAddressModal()"
            >
              <span class="sm:hidden">{{ $t("pages.company.info.buttons.add_new_address_mobile") }}</span>
              <span class="hidden sm:inline">{{ $t("pages.company.info.buttons.add_new_address") }}</span>
            </VcButton>
          </div>

          <VcEmptyView
            v-if="!addresses.length && !loadingAddresses"
            :text="$t('pages.company.info.no_addresses_message')"
            class="py-16"
          >
            <template #icon>
              <VcImage
                src="/static/images/account/icons/no-addresses.svg"
                :alt="$t('pages.company.info.no_addresses_message')"
                lazy
              />
            </template>

            <template v-if="userCanEditOrganization" #button>
              <VcButton prepend-icon="plus" @click="openAddOrUpdateCompanyAddressModal()">
                {{ $t("pages.company.info.buttons.add_new_address") }}
              </VcButton>
            </template>
          </VcEmptyView>

          <div v-else class="flex flex-col md:rounded md:border">
            <VcTable
              :loading="loadingAddresses"
              :columns="columns"
              :items="paginatedAddresses"
              :sort="sort"
              :pages="pages"
              :page="page"
              :description="$t('pages.company.info.meta.table_description')"
              layout="table-auto"
              @header-click="applySorting"
              @page-changed="onPageChange"
            >
              <template #mobile-item="{ item }">
                <div class="relative mb-3 flex items-start rounded border px-3.5 py-4 last:mb-0">
                  <div class="grow space-y-2.5 pe-2">
                    <div>
                      <div class="mb-1 flex gap-1 empty:hidden">
                        <VcBadge v-if="item.isDefault" size="sm" color="info" variant="outline-dark" rounded>
                          <VcIcon name="apply" />
                          <span>{{ $t("pages.company.info.labels.default") }}</span>
                        </VcBadge>

                        <VcBadge v-if="item.isFavorite" size="sm" variant="outline-dark" rounded>
                          <VcIcon name="whishlist" />
                          <span>{{ $t("pages.company.info.labels.favorite") }}</span>
                        </VcBadge>
                      </div>

                      <div class="mb-0.5 flex items-center gap-1 text-xs text-neutral">
                        {{ $t("pages.company.info.labels.address") }}
                      </div>

                      <div class="text-sm font-bold text-neutral-950">
                        <span>{{ item.line1 }}</span>
                        <template v-if="item.city">, {{ item.city }}</template>
                        <template v-if="item.regionName">, {{ item.regionName }}</template>
                      </div>
                    </div>

                    <div v-if="item.description">
                      <div class="mb-0.5 text-xs text-neutral">
                        {{ $t("pages.company.info.labels.description") }}
                      </div>

                      <div class="text-sm text-neutral-950">
                        {{ item.description }}
                      </div>
                    </div>

                    <div class="flex">
                      <div class="w-1/2 pe-2">
                        <div class="mb-0.5 text-xs text-neutral">
                          {{ $t("pages.company.info.labels.zip") }}
                        </div>

                        <div class="text-sm text-neutral-950">
                          {{ item.postalCode }}
                        </div>
                      </div>

                      <div class="w-1/2 ps-2">
                        <div class="mb-0.5 text-xs text-neutral">
                          {{ $t("pages.company.info.labels.country") }}
                        </div>

                        <div class="text-sm text-neutral-950">
                          {{ item.countryName }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <AddressDropdownMenu
                    v-if="userCanEditOrganization"
                    :address="item"
                    placement="left-start"
                    @edit="openAddOrUpdateCompanyAddressModal(item)"
                    @delete="openDeleteAddressModal(item)"
                    @toggle-favorite="toggleFavoriteAddress(item.isFavorite, item.id)"
                  />
                </div>
              </template>

              <template #mobile-skeleton>
                <div
                  v-for="i in paginatedAddresses.length"
                  :key="i"
                  class="relative mb-3 flex items-start rounded border px-3.5 py-4 last:mb-0"
                >
                  <div class="grow space-y-2.5 pe-2">
                    <div>
                      <div class="mb-0.5 flex items-center gap-1 text-xs text-neutral">
                        {{ $t("pages.company.info.labels.address") }}
                      </div>

                      <div class="h-4.5 animate-pulse bg-neutral-200"></div>
                    </div>

                    <div class="flex">
                      <div class="w-1/2 pe-2">
                        <div class="mb-0.5 text-xs text-neutral">
                          {{ $t("pages.company.info.labels.zip") }}
                        </div>

                        <div class="h-4.5 animate-pulse bg-neutral-200"></div>
                      </div>

                      <div class="w-1/2 ps-2">
                        <div class="mb-0.5 text-xs text-neutral">
                          {{ $t("pages.company.info.labels.country") }}
                        </div>

                        <div class="h-4.5 animate-pulse bg-neutral-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template #desktop-body>
                <tr v-for="address in paginatedAddresses" :key="address.id" class="even:bg-neutral-50">
                  <td class="px-4 py-3 text-center">
                    <VcTooltip placement="bottom-start" strategy="fixed">
                      <template #trigger>
                        <VcIcon
                          :class="[
                            'cursor-pointer',
                            {
                              'text-neutral-400': !address.isFavorite,
                              'text-primary': address.isFavorite,
                            },
                          ]"
                          name="whishlist"
                          size="md"
                          @click="toggleFavoriteAddress(address.isFavorite, address.id)"
                        />
                      </template>

                      <template #content>
                        <div class="w-44 rounded-sm bg-additional-50 px-3.5 py-1.5 text-xs font-light shadow-sm">
                          {{
                            address.isFavorite
                              ? $t("pages.company.info.remove_from_favorites")
                              : $t("pages.company.info.add_to_favorites")
                          }}
                        </div>
                      </template>
                    </VcTooltip>
                  </td>

                  <td class="px-5 py-3">
                    <span>{{ address.line1 }}</span>
                    <template v-if="address.city">, {{ address.city }}</template>
                    <template v-if="address.regionName">, {{ address.regionName }}</template>
                  </td>

                  <td class="px-5 py-3">
                    {{ address.countryName }}
                  </td>

                  <td class="px-5 py-3 text-center">
                    {{ address.postalCode }}
                  </td>

                  <td class="px-5 py-3">
                    {{ address.description }}
                  </td>

                  <td :class="{ 'text-right': !userCanEditOrganization }" class="px-5 py-3 text-center">
                    <VcChip v-if="address.isDefault" color="info" variant="outline-dark" size="sm" rounded>
                      <VcIcon name="apply" />
                      {{ $t("pages.company.info.labels.default") }}
                    </VcChip>
                  </td>

                  <td v-if="userCanEditOrganization" class="px-5 py-3 text-center">
                    <AddressDropdownMenu
                      class="inline-block"
                      :address="address"
                      @edit="openAddOrUpdateCompanyAddressModal(address)"
                      @delete="openDeleteAddressModal(address)"
                      @toggle-favorite="toggleFavoriteAddress(address.isFavorite, address.id)"
                    />
                  </td>
                </tr>
              </template>

              <template #desktop-skeleton>
                <tr v-for="i in paginatedAddresses.length" :key="i" class="even:bg-neutral-50">
                  <td v-for="column in columns.length" :key="column" class="px-5 py-4">
                    <div class="h-4.5 animate-pulse bg-neutral-200" />
                  </td>
                </tr>
              </template>
            </VcTable>
          </div>
        </div>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { breakpointsTailwind, useBreakpoints, computedEager } from "@vueuse/core";
import { useField } from "vee-validate";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { string } from "yup";
import { usePageHead } from "@/core/composables";
import { AddressType, XApiPermissions } from "@/core/enums";
import { AddressDropdownMenu, useUser } from "@/shared/account";
import { AddOrUpdateCompanyAddressModal, useOrganization, useOrganizationAddresses } from "@/shared/company";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { MemberAddressType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";

const page = ref(1);
const itemsPerPage = ref(10);

const { t } = useI18n();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

usePageHead({
  title: t("pages.company.info.meta.title"),
});

/**
 * This page is accessible only to members of the organization,
 * so the organization must exist.
 */
const { loading: loadingUser, organization, checkPermissions } = useUser();
const { loading: loadingOrganization, updateOrganization } = useOrganization();
const {
  addresses,
  sort,
  fetchAddresses,
  removeAddresses,
  addOrUpdateAddresses,
  addAddressToFavorite,
  removeAddressFromFavorite,
  loading: loadingAddresses,
} = useOrganizationAddresses(organization.value!.id);
const { openModal } = useModal();
const notifications = useNotifications();

const {
  meta,
  errors,
  value: organizationName,
  resetField: resetOrganizationField,
} = useField<string>("organizationName", toTypedSchema(string().trim().required().max(64)));

const organizationId = computed<string>(() => organization.value!.id);
const userCanEditOrganization = computedEager<boolean>(() => checkPermissions(XApiPermissions.CanEditOrganization));

const pages = computed<number>(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed<MemberAddressType[]>(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);

const companyNameSaveIcon = computed(() => (isMobile.value ? "save-v2" : ""));

const columns = computed<ITableColumn[]>(() => {
  const result: ITableColumn[] = [
    {
      id: "isFavorite",
      sortable: false,
      classes: "w-14",
    },
    {
      id: "line1",
      title: t("pages.company.info.labels.address"),
      sortable: true,
      classes: "w-64",
    },
    {
      id: "countryName",
      title: t("pages.company.info.labels.country"),
      classes: "w-32",
    },
    {
      id: "postalCode",
      title: t("pages.company.info.labels.zip"),
      classes: "w-28 text-center",
    },
    {
      id: "description",
      title: t("pages.company.info.labels.description"),
      sortable: true,
    },
    {
      id: "isDefault",
      title: t("pages.company.info.labels.default"),
      classes: "w-28 text-center",
    },
  ];

  if (userCanEditOrganization.value) {
    result.push({
      id: "id",
      title: t("pages.company.info.labels.actions"),
      classes: "w-20 text-center",
    });
  }

  return result;
});

function onPageChange(newPage: number): void {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
}

async function applySorting(sortInfo: ISortInfo): Promise<void> {
  sort.value = sortInfo;
  page.value = 1;
  await fetchAddresses();
}

async function saveOrganizationName(): Promise<void> {
  await updateOrganization({
    id: organizationId.value,
    name: organizationName.value.trim(),
  });
}

function openDeleteAddressModal(address: MemberAddressType): void {
  if (address.isDefault) {
    return;
  }

  const closeDeleteAddressModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      iconVariant: "danger",
      loading: loadingAddresses,
      title: t("common.titles.delete_address"),
      text: t("common.messages.confirm_delete_address"),

      async onConfirm() {
        const previousPagesCount = pages.value;

        await removeAddresses([address]);

        notifications.success({
          text: t("common.messages.address_deletion_successful"),
          duration: 10000,
          single: true,
        });

        /**
         * If you were on the last page, and after deleting the product
         * the number of pages has decreased, go to the previous page
         */
        if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pages.value) {
          page.value -= 1;
        }

        closeDeleteAddressModal();
      },
    },
  });
}

function openAddOrUpdateCompanyAddressModal(address?: MemberAddressType): void {
  const closeAddOrUpdateAddressModal = openModal({
    component: AddOrUpdateCompanyAddressModal,
    props: {
      address,
      loading: loadingAddresses,
      async onResult(updatedAddress: MemberAddressType): Promise<void> {
        updatedAddress.addressType = AddressType.BillingAndShipping;

        await addOrUpdateAddresses([updatedAddress]);

        notifications.success({
          text: t("pages.company.info.address_saved_successful_message"),
          duration: 10000,
          single: true,
        });

        closeAddOrUpdateAddressModal();
      },
    },
  });
}

fetchAddresses();

async function toggleFavoriteAddress(isFavoriteAddress: boolean, addressId?: string) {
  if (addressId) {
    isFavoriteAddress ? await removeAddressFromFavorite(addressId) : await addAddressToFavorite(addressId);
  }
}

watch(
  () => organization.value!.name!,
  (name) => resetOrganizationField({ value: name }),
  { immediate: true },
);
</script>
