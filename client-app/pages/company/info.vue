<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.company.info.title") }}
    </VcTypography>
    <div class="space-y-5 lg:space-y-6">
      <!-- Company name block -->
      <VcWidget :title="$t('pages.company.info.labels.company_name')" size="lg">
        <div>
          <VcInput
            v-model="organizationName"
            :disabled="!canEditOrganization || loadingOrganization || loadingUser"
            :message="errors[0]"
            :error="!!errors[0]"
            name="organization-name"
            autocomplete="off"
            maxlength="64"
          >
            <template v-if="canEditOrganization" #append>
              <VcButton
                :loading="loadingOrganization || loadingUser"
                :disabled="!meta.valid || !meta.dirty"
                icon="save-v2"
                class="flex-none"
                @click="saveOrganizationName"
              />
            </template>
          </VcInput>
        </div>
      </VcWidget>

      <VcWidget
        v-if="canEditOrganization || !loadingOrganization || !loadingUser"
        :title="$t('pages.company.info.labels.company_logo')"
        size="lg"
      >
        <div class="flex gap-4">
          <div v-if="logoUrl" class="flex flex-col justify-between">
            <div>
              <VcImage
                :alt="$t('pages.company.info.labels.company_logo')"
                :src="logoUrl"
                class="h-[70px] object-cover"
              />
            </div>

            <VcButton
              :disabled="!logoUrl"
              :loading="loadingOrganizationLogo"
              class="whitespace-nowrap"
              size="sm"
              variant="outline"
              @click="saveOrganizationLogo"
            >
              {{ $t("common.buttons.save") }}
            </VcButton>
          </div>

          <div class="grow">
            <VcFileUploader
              :files="files"
              :loading="loadingOrganizationLogo"
              removable
              v-bind="fileOptions"
              @download="onFileDownload"
              @add-files="onAddFiles"
              @remove-files="onRemoveFiles"
            />
          </div>
        </div>
      </VcWidget>

      <!-- Content block -->
      <VcWidget size="lg">
        <div>
          <div
            v-if="addresses.length || loadingAddresses"
            class="mb-4 flex flex-row items-center justify-between gap-3"
          >
            <VcTypography tag="h2" variant="h3">
              {{ $t("pages.company.info.content_header") }}
            </VcTypography>

            <VcButton
              v-if="canEditOrganization"
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
            icon="thin-address"
          >
            <template v-if="canEditOrganization" #button>
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
                    v-if="canEditOrganization"
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
                    <VcTooltip placement="bottom-start" width="max-content">
                      <template #trigger>
                        <VcIcon
                          :class="[
                            'cursor-pointer',
                            {
                              'fill-neutral-400': !address.isFavorite,
                              'fill-primary': address.isFavorite,
                            },
                          ]"
                          name="whishlist"
                          size="md"
                          @click="toggleFavoriteAddress(address.isFavorite, address.id)"
                        />
                      </template>

                      <template #content>
                        {{
                          address.isFavorite
                            ? $t("pages.company.info.remove_from_favorites")
                            : $t("pages.company.info.add_to_favorites")
                        }}
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

                  <td :class="{ 'text-right': !canEditOrganization }" class="px-5 py-3 text-center">
                    <VcChip v-if="address.isDefault" color="info" variant="outline-dark" size="sm" rounded>
                      <VcIcon name="apply" />
                      {{ $t("pages.company.info.labels.default") }}
                    </VcChip>
                  </td>

                  <td v-if="canEditOrganization" class="px-5 py-3 text-center">
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
                    <div class="h-4.5 animate-pulse bg-neutral-200"></div>
                  </td>
                </tr>
              </template>
            </VcTable>
          </div>
        </div>
      </VcWidget>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { computedEager } from "@vueuse/core";
import { useField } from "vee-validate";
import { computed, ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { string } from "yup";
import { usePageHead } from "@/core/composables";
import { AddressType, XApiPermissions } from "@/core/enums";
import { AddressDropdownMenu, useUser } from "@/shared/account";
import {
  AddOrUpdateCompanyAddressModal,
  useOrganization,
  useOrganizationAddresses,
  useOrganizationLogo,
} from "@/shared/company";
import { useFiles, downloadFile } from "@/shared/files";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import type { MemberAddressType } from "@/core/api/graphql/types";
import type { ISortInfo } from "@/core/types";

const page = ref(1);
const itemsPerPage = ref(10);

const { t } = useI18n();

const DEFAULT_COMPANY_FILES_SCOPE = "organization-logos";
const {
  files,
  uploadedFiles,
  addFiles,
  validateFiles,
  uploadFiles,
  removeFiles,
  fetchOptions: fetchFileOptions,
  options: fileOptions,
} = useFiles(DEFAULT_COMPANY_FILES_SCOPE, undefined);
const logoUrl = ref<string>("");

usePageHead({
  title: t("pages.company.info.meta.title"),
});

/**
 * This page is accessible only to members of the organization,
 * so the organization must exist.
 */
const { loading: loadingUser, organization, checkPermissions } = useUser();
const { loading: loadingOrganization, updateOrganization } = useOrganization();
const { loading: loadingOrganizationLogo, updateLogo } = useOrganizationLogo();
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
const canEditOrganization = computedEager<boolean>(() => checkPermissions(XApiPermissions.CanEditOrganization));

const pages = computed<number>(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed<MemberAddressType[]>(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value),
);

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

  if (canEditOrganization.value) {
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

async function saveOrganizationLogo(): Promise<void> {
  await updateLogo(organizationId.value, logoUrl.value);
  notifications.success({
    text: t("common.messages.logo_changed"),
    duration: 10000,
    single: true,
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

void fetchAddresses();

async function onAddFiles(items: INewFile[]) {
  addFiles(items);
  validateFiles();
  await uploadFiles();
  logoUrl.value = uploadedFiles.value.map((attachment) => attachment.url)[0];
}

async function onRemoveFiles(items: FileType[]) {
  await removeFiles(items);
  logoUrl.value = "";
}

function onFileDownload(file: FileType) {
  if (file && file.url) {
    void downloadFile(file.url, file.name);
  }
}

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

watchEffect(async () => {
  await fetchFileOptions();
  fileOptions.value.maxFileCount = 1;
});
</script>
