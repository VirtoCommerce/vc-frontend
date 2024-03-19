<template>
  <div>
    <!-- Title block -->
    <div class="flex items-center justify-between">
      <h2 v-t="'pages.company.info.title'" class="text-3xl font-bold uppercase text-gray-800" />
    </div>

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
        <div class="md:p-5">
          <div
            v-if="addresses.length || loadingAddresses"
            class="mx-6 mb-5 mt-9 flex flex-row items-center justify-between gap-3 md:mx-0 md:mb-4 md:mt-1.5"
          >
            <h2
              v-t="'pages.company.info.content_header'"
              class="py-0.5 text-xl font-extrabold uppercase text-gray-800"
            />

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
                <div class="relative grid grid-cols-3 gap-4 border-t border-gray-200 px-6 py-5 text-sm">
                  <div
                    v-if="item.isDefault"
                    class="absolute right-0 top-0 border-[23px] border-transparent border-r-[--color-primary-500] border-t-[--color-primary-500]"
                  >
                    <VcIcon
                      class="absolute right-[-1.125rem] top-[-0.875rem] text-[--color-additional-50]"
                      name="check-bold"
                      size="xs"
                    />
                  </div>

                  <div class="col-span-2 flex flex-col">
                    <span v-t="'pages.company.info.labels.address'" class="text-gray-400" />

                    <span class="overflow-hidden text-ellipsis font-bold leading-tight">
                      <span>{{ item.line1 }}</span>
                      <template v-if="item.city">, {{ item.city }}</template>
                      <template v-if="item.regionName">, {{ item.regionName }}</template>
                    </span>
                  </div>

                  <div class="flex flex-col">
                    <span v-t="'pages.company.info.labels.country'" class="text-gray-400" />

                    <span class="overflow-hidden text-ellipsis leading-tight">
                      {{ item.countryName }}
                    </span>
                  </div>

                  <div class="col-span-2 flex flex-col">
                    <span v-t="'pages.company.info.labels.description'" class="text-gray-400" />

                    <span class="overflow-hidden text-ellipsis leading-tight">
                      {{ item.description }}
                    </span>
                  </div>

                  <div class="flex flex-col">
                    <span v-t="'pages.company.info.labels.zip'" class="text-gray-400" />

                    <span class="overflow-hidden text-ellipsis leading-tight">
                      {{ item.postalCode }}
                    </span>
                  </div>

                  <div class="absolute right-4 top-3 flex flex-col items-center">
                    <AddressDropdownMenu
                      v-if="userCanEditOrganization"
                      :address="item"
                      placement="left-start"
                      @edit="openAddOrUpdateCompanyAddressModal(item)"
                      @delete="openDeleteAddressModal(item)"
                    />

                    <VcIcon
                      :class="{
                        'text-neutral-400': !item.isFavorite,
                        'text-primary-500': item.isFavorite,
                        'mt-2': userCanEditOrganization,
                      }"
                      name="star"
                      size="md"
                      @click="toggleFavoriteAddress(item.isFavorite, item.id)"
                    />
                  </div>
                </div>
              </template>

              <template #mobile-skeleton>
                <div
                  v-for="i in paginatedAddresses.length"
                  :key="i"
                  class="relative grid grid-cols-3 gap-4 border-t border-gray-200 px-6 py-5 text-sm"
                >
                  <div class="col-span-2 flex flex-col">
                    <span v-t="'pages.company.info.labels.address'" class="text-gray-400" />
                    <div class="h-4 animate-pulse bg-gray-200"></div>
                  </div>

                  <div class="flex flex-col">
                    <span v-t="'pages.company.info.labels.country'" class="text-gray-400" />
                    <div class="h-4 animate-pulse bg-gray-200"></div>
                  </div>

                  <div class="col-span-2 flex flex-col">
                    <span v-t="'pages.company.info.labels.description'" class="text-gray-400" />
                    <div class="h-4 animate-pulse bg-gray-200"></div>
                  </div>

                  <div class="flex flex-col">
                    <span v-t="'pages.company.info.labels.zip'" class="text-gray-400" />
                    <div class="h-4 animate-pulse bg-gray-200"></div>
                  </div>
                </div>
              </template>

              <template #desktop-body>
                <tr v-for="address in paginatedAddresses" :key="address.id" class="even:bg-gray-50">
                  <td class="cursor-pointer px-4 py-3 text-center">
                    <VcTooltip class="ml-1" placement="bottom-start" strategy="fixed">
                      <template #trigger>
                        <VcIcon
                          :class="{
                            'text-neutral-400': !address.isFavorite,
                            'text-primary-500': address.isFavorite,
                          }"
                          name="star"
                          size="md"
                          @click="toggleFavoriteAddress(address.isFavorite, address.id)"
                        />
                      </template>

                      <template #content>
                        <div class="w-44 rounded-sm bg-white px-3.5 py-1.5 text-xs font-light shadow-sm">
                          {{
                            address.isFavorite
                              ? $t("pages.company.info.remove_from_favorites")
                              : $t("pages.company.info.add_to_favorites")
                          }}
                        </div>
                      </template>
                    </VcTooltip>
                  </td>
                  <td class="overflow-hidden text-ellipsis px-5 py-3">
                    <span>{{ address.line1 }}</span>
                    <template v-if="address.city">, {{ address.city }}</template>
                    <template v-if="address.regionName">, {{ address.regionName }}</template>
                  </td>

                  <td class="overflow-hidden text-ellipsis px-5 py-3">
                    {{ address.description }}
                  </td>

                  <td class="overflow-hidden text-ellipsis px-5 py-3">
                    {{ address.postalCode }}
                  </td>

                  <td class="overflow-hidden text-ellipsis px-5 py-3">
                    {{ address.countryName }}
                  </td>

                  <td
                    :class="{ 'text-right': !userCanEditOrganization }"
                    class="overflow-hidden text-ellipsis px-5 py-3"
                  >
                    <div v-if="address.isDefault" class="flex items-center gap-1">
                      <VcIcon class="text-[--color-primary-500]" name="check-bold" size="xs" />

                      <b v-t="'pages.company.info.labels.default'" />
                    </div>
                  </td>

                  <td v-if="userCanEditOrganization" class="relative px-5 py-3 text-right">
                    <AddressDropdownMenu
                      class="inline-block"
                      :address="address"
                      @edit="openAddOrUpdateCompanyAddressModal(address)"
                      @delete="openDeleteAddressModal(address)"
                    />
                  </td>
                </tr>
              </template>

              <template #desktop-skeleton>
                <tr v-for="i in paginatedAddresses.length" :key="i" class="even:bg-gray-50">
                  <td v-for="column in columns.length" :key="column" class="px-5 py-4">
                    <div class="h-5 animate-pulse bg-gray-200" />
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
    },
    {
      id: "description",
      title: t("pages.company.info.labels.description"),
      sortable: true,
    },
    {
      id: "postalCode",
      title: t("pages.company.info.labels.zip"),
      classes: "w-28",
    },
    {
      id: "countryName",
      title: t("pages.company.info.labels.country"),
    },
    {
      id: "isDefault",
      classes: "w-1/6",
    },
  ];

  if (userCanEditOrganization.value) {
    // Add action column
    result.push({
      id: "id",
      classes: "w-20",
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
