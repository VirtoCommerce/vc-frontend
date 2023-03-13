<template>
  <div>
    <BackButtonInHeader v-if="isMobile && editingMode" @click="closeEditMode" />

    <!-- Title block -->
    <div class="mx-5 flex items-center justify-between md:mx-0">
      <h2 class="truncate text-3xl font-bold uppercase text-gray-800">
        {{ title }}
      </h2>

      <VcButton
        v-if="!editingMode && paginatedAddresses.length"
        class="px-3 uppercase"
        size="sm"
        is-outline
        @click="openEditMode()"
      >
        <span class="sm:hidden">{{ $t("pages.account.addresses.add_new_address_button_mobile") }}</span>
        <span class="hidden sm:inline">{{ $t("pages.account.addresses.add_new_address_button") }}</span>
      </VcButton>
    </div>

    <VcEmptyView
      v-if="!paginatedAddresses.length && !editingMode && !addressesLoading"
      :text="$t('pages.account.addresses.no_addresses_message')"
    >
      <template #icon>
        <VcImage
          src="/static/images/account/icons/no-addresses.svg"
          :alt="$t('pages.account.addresses.addresses_icon')"
        />
      </template>

      <template #button>
        <VcButton class="px-4 uppercase" size="lg" @click="openEditMode">
          <i class="fa fa-plus -ml-px mr-3" />
          {{ $t("pages.account.addresses.add_new_address_button") }}
        </VcButton>
      </template>
    </VcEmptyView>

    <div v-else class="flex flex-col bg-white shadow-sm md:rounded md:border">
      <VcAddressForm
        v-if="editingMode"
        :model-value="editableAddress"
        :countries="countries"
        :disabled="saveAddressLoading"
        class="px-6 py-4"
        with-personal-info
        required-email
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex flex-row space-x-4 pb-3 pt-7 sm:float-right sm:py-4">
            <VcButton
              kind="secondary"
              :is-disabled="saveAddressLoading"
              class="w-32 uppercase sm:w-auto sm:px-12"
              is-outline
              @click="closeEditMode"
            >
              {{ $t("pages.account.addresses.cancel_button") }}
            </VcButton>

            <VcButton
              :is-disabled="!dirty || !valid"
              :is-waiting="saveAddressLoading"
              class="grow uppercase sm:flex-none sm:px-16"
              is-submit
            >
              {{
                editableAddress
                  ? $t("pages.account.addresses.save_button")
                  : $t("pages.account.addresses.create_button")
              }}
            </VcButton>
          </div>
        </template>
      </VcAddressForm>

      <!-- View Table -->
      <VcTable
        v-else
        :loading="addressesLoading"
        :item-actions-builder="itemActionsBuilder"
        :columns="columns"
        :sort="sort"
        :items="paginatedAddresses"
        :pages="pages"
        :page="page"
        @page-changed="onPageChange"
        @header-click="applySorting"
      >
        <template #mobile-item="itemData">
          <div class="grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.recipient_name_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis pr-4 font-extrabold">
                {{ itemData.item.firstName }} {{ itemData.item.lastName }}
              </span>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.address_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ itemData.item.countryCode }} {{ itemData.item.regionName }} {{ itemData.item.city }}
                {{ itemData.item.line1 }}
                {{ itemData.item.postalCode }}
              </span>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.phone_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis pr-4">
                {{ itemData.item.phone }}
              </span>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.email_label'" class="text-sm text-gray-400" />

              <span class="overflow-hidden text-ellipsis">
                {{ itemData.item.email }}
              </span>
            </div>
          </div>
        </template>

        <template #mobile-skeleton>
          <div v-for="i in itemsPerPage" :key="i" class="grid grid-cols-2 gap-y-4 border-b border-gray-200 p-6">
            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.recipient_name_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.address_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.phone_label'" class="text-sm text-gray-400"></span>
              <div class="mr-4 h-6 animate-pulse bg-gray-200"></div>
            </div>

            <div class="flex flex-col">
              <span v-t="'pages.account.addresses.email_label'" class="text-sm text-gray-400"></span>
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </div>
          </div>
        </template>

        <template #desktop-body>
          <tr v-for="address in paginatedAddresses" :key="address.id" class="even:bg-gray-50">
            <td class="overflow-hidden text-ellipsis p-5">{{ address.firstName }} {{ address.lastName }}</td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
              {{ address.postalCode }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ address.phone }}
            </td>

            <td class="overflow-hidden text-ellipsis p-5">
              {{ address.email }}
            </td>
            <!-- todo: https://virtocommerce.atlassian.net/browse/ST-2256 -->
            <td class="p-5 text-center">
              <div class="inline-block space-x-2">
                <!-- todo: use VcButton -->
                <button
                  type="button"
                  class="h-7 w-7 rounded text-[color:var(--color-primary)] shadow hover:bg-gray-100"
                  :title="$t('pages.account.addresses.edit_label')"
                  @click="openEditMode(address)"
                >
                  <i class="fas fa-pencil-alt" />
                </button>

                <button
                  type="button"
                  class="h-7 w-7 rounded text-[color:var(--color-danger)] shadow hover:bg-gray-100"
                  :title="$t('pages.account.addresses.delete_label')"
                  @click="removeAddress(address)"
                >
                  <i class="fas fa-times" />
                </button>
              </div>
            </td>
          </tr>
        </template>

        <template #desktop-skeleton>
          <tr v-for="i in itemsPerPage" :key="i" class="even:bg-gray-50">
            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="w-4/12 p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>

            <td class="p-5">
              <div class="h-6 animate-pulse bg-gray-200"></div>
            </td>
          </tr>
        </template>
      </VcTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { clone } from "lodash";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useCountries, usePageHead } from "@/core/composables";
import { AddressType } from "@/core/enums";
import { useUserAddresses } from "@/shared/account";
import { BackButtonInHeader } from "@/shared/layout";
import type { ISortInfo } from "@/core/types";
import type { MemberAddressType } from "@/xapi/types";
import type { ComputedRef, Ref } from "vue";

const { t } = useI18n();
const breakpoints = useBreakpoints(breakpointsTailwind);
const { countries, loadCountries } = useCountries();
const {
  loading: addressesLoading,
  addresses,
  sort,
  fetchAddresses,
  removeAddresses,
  addOrUpdateAddresses,
} = useUserAddresses();

usePageHead({
  title: t("pages.account.addresses.meta.title"),
});

const isMobile = breakpoints.smaller("lg");
const editingMode: Ref<boolean> = ref(false);
const editableAddress: Ref<MemberAddressType | null> = ref(null);
const page = ref(1);
const itemsPerPage = ref(6);
const saveAddressLoading = ref(false);

const pages: ComputedRef<number> = computed(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses: ComputedRef<MemberAddressType[]> = computed(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);
const title: ComputedRef<string> = computed(() => {
  if (editingMode.value) {
    return editableAddress.value
      ? t("pages.account.addresses.edit_address_title")
      : t("pages.account.addresses.new_address_title");
  } else {
    return t("pages.account.addresses.addresses_title");
  }
});

const columns = ref<ITableColumn[]>([
  {
    id: "firstName",
    title: t("pages.account.addresses.recipient_name_label"),
    sortable: true,
  },
  {
    id: "countryCode",
    title: t("pages.account.addresses.address_label"),
    sortable: true,
  },
  {
    id: "phone",
    title: t("pages.account.addresses.phone_label"),
    sortable: true,
  },
  {
    id: "email",
    title: t("pages.account.addresses.email_label"),
    sortable: true,
  },
  {
    id: "actions",
    title: t("pages.account.addresses.actions_label"),
    align: "center",
  },
]);

const onPageChange = async (newPage: number) => {
  window.scroll({ top: 0, behavior: "smooth" });
  page.value = newPage;
};

// if address parameter is NULL, then adding a new address will open
async function openEditMode(address: MemberAddressType | null = null) {
  editableAddress.value = clone(address);
  editingMode.value = true;
}

function closeEditMode() {
  editableAddress.value = null;
  editingMode.value = false;
}

function itemActionsBuilder() {
  const actions: SlidingActionsItem[] = [
    {
      icon: "fas fa-pencil-alt",
      title: t("pages.account.addresses.edit_button"),
      classes: "bg-gray-550",
      clickHandler(address: MemberAddressType) {
        openEditMode(address);
      },
    },
    {
      icon: "fas fa-trash-alt",
      title: t("pages.account.addresses.delete_button"),
      left: true,
      classes: "bg-[color:var(--color-danger)]",
      clickHandler(address: MemberAddressType) {
        removeAddress(address);
      },
    },
  ];

  return actions;
}

const applySorting = async (sortInfo: ISortInfo): Promise<void> => {
  sort.value = sortInfo;
  page.value = 1;
  await fetchAddresses();
};

async function saveAddress(address: MemberAddressType): Promise<void> {
  saveAddressLoading.value = true;
  await addOrUpdateAddresses([{ ...address, addressType: AddressType.BillingAndShipping }]);
  closeEditMode();
  saveAddressLoading.value = false;
}

async function removeAddress(address: MemberAddressType): Promise<void> {
  if (!window.confirm(t("pages.account.addresses.confirm_delete_message"))) {
    return;
  }

  const previousPagesCount = pages.value;

  await removeAddresses([address]);

  /**
   * If you were on the last page, and after deleting the product
   * the number of pages has decreased, go to the previous page
   */
  if (previousPagesCount > 1 && previousPagesCount === page.value && previousPagesCount > pages.value) {
    page.value -= 1;
  }
}

onMounted(async () => {
  await fetchAddresses();

  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
