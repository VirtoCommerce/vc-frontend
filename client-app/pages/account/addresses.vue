<template>
  <div class="bg-gray-100 flex-grow pt-6 pb-16 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <div class="flex lg:space-x-5">
        <!-- First column-->
        <div class="hidden lg:flex flex-col lg:w-1/5 space-y-5">
          <AccountNavigation></AccountNavigation>
        </div>

        <!-- Second column-->
        <div class="flex flex-col w-full lg:w-4/5 space-y-5">
          <div class="flex justify-between items-center mx-5 lg:mx-0">
            <h2 class="text-gray-800 text-3xl font-bold uppercase">{{ title }}</h2>

            <VcButton v-if="!editingMode" class="px-3 uppercase border" size="sm" is-outline @click="openEditMode()">
              {{ isMobile ? "Add new" : "Add new address" }}
            </VcButton>
          </div>

          <div class="flex flex-col bg-white shadow-sm" :class="{ 'rounded border': !isMobile }">
            <AddressForm
              v-if="editingMode"
              :model-value="editableAddress"
              :countries="countries"
              :disabled="saveAddressLoading"
              class="px-6 py-4"
              required-email
              required-city
              @save="saveAddress"
            >
              <template #append="{ dirty }">
                <div class="flex space-x-4 pb-3 pt-7 sm:pb-4 sm:pt-4 sm:float-right">
                  <VcButton
                    kind="secondary"
                    :size="isMobile ? 'md' : 'lg'"
                    :is-disabled="saveAddressLoading"
                    class="uppercase w-32 sm:w-auto sm:px-12"
                    is-outline
                    @click="closeEditMode"
                  >
                    Cancel
                  </VcButton>

                  <VcButton
                    :size="isMobile ? 'md' : 'lg'"
                    :is-disabled="!dirty"
                    :is-waiting="saveAddressLoading"
                    class="uppercase flex-grow sm:flex-none sm:px-16"
                    is-submit
                  >
                    {{ editableAddress ? "Save" : "Create" }}
                  </VcButton>
                </div>
              </template>
            </AddressForm>

            <!-- View Table -->
            <template v-else>
              <VcTable
                :loading="addressesLoading"
                :item-action-builder="actionBuilder"
                :columns="columns"
                :items="paginatedAddresses"
                :sort="sort"
                :pages="pages"
                :page="page"
                @pageChanged="onPageChange"
                @headerClick="applySorting"
              >
                <template #mobile-item="itemData">
                  <div class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400"> Recipient's name </span>
                      <span class="pr-4 font-extrabold overflow-hidden overflow-ellipsis">
                        {{ itemData.item.firstName }} {{ itemData.item.lastName }}
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Address</span>
                      <span class="overflow-hidden overflow-ellipsis">
                        {{ itemData.item.countryCode }} {{ itemData.item.regionName }} {{ itemData.item.city }}
                        {{ itemData.item.line1 }}
                        {{ itemData.item.postalCode }}
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Phone</span>
                      <span class="pr-4 overflow-hidden overflow-ellipsis">{{ itemData.item.phone }}</span>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Email</span>
                      <span class="overflow-hidden overflow-ellipsis">{{ itemData.item.email }}</span>
                    </div>
                  </div>
                </template>
                <template #mobile-empty>
                  <div class="flex items-center justify-center space-x-10 p-5">
                    <img src="/static/images/account/icons/no-addresses.svg" alt="No addresses" />
                    <div class="flex flex-col space-y-2">
                      <span class="text-base">There are no addresses yet</span>
                      <VcButton class="uppercase w-full" @click="openEditMode()">Add new address</VcButton>
                    </div>
                  </div>
                </template>
                <template #mobile-skeleton>
                  <div v-for="i of itemsPerPage" :key="i" class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200">
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Recipient's name</span>
                      <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Address</span>
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Phone</span>
                      <div class="h-6 mr-4 bg-gray-200 animate-pulse"></div>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Email</span>
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </div>
                  </div>
                </template>
                <template #desktop-body>
                  <tr v-for="address in paginatedAddresses" :key="address.id" class="even:bg-gray-50">
                    <td class="p-5 overflow-hidden overflow-ellipsis">
                      {{ address.firstName }} {{ address.lastName }}
                    </td>
                    <td class="p-5 overflow-hidden overflow-ellipsis">
                      {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
                      {{ address.postalCode }}
                    </td>
                    <td class="p-5 overflow-hidden overflow-ellipsis">{{ address.phone }}</td>
                    <td class="p-5 overflow-hidden overflow-ellipsis">{{ address.email }}</td>
                    <td class="p-5 text-center">
                      <div class="inline-block space-x-2">
                        <!-- todo: use VcButton -->
                        <button
                          type="button"
                          class="h-7 w-7 shadow rounded text-yellow-500 hover:bg-gray-100"
                          @click="openEditMode(address)"
                        >
                          <i class="fas fa-pencil-alt"></i>
                        </button>

                        <button
                          type="button"
                          class="h-7 w-7 shadow rounded text-red-500 hover:bg-gray-100"
                          @click="removeAddress(address)"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
                <template #desktop-empty>
                  <!-- Workaround for using colspan -->
                  <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colspan="6" class="polygons-bg">
                      <div class="flex items-center pl-56 space-x-10 h-80">
                        <img src="/static/images/account/icons/no-addresses.svg" alt="No addresses" />
                        <div class="flex flex-col space-y-2">
                          <span class="text-base">There are no addresses yet</span>
                          <VcButton class="uppercase w-full" @click="openEditMode()">Add new address</VcButton>
                        </div>
                      </div>
                    </td>
                  </tr></template
                >
                <template #desktop-skeleton>
                  <tr v-for="i of itemsPerPage" :key="i" class="even:bg-gray-50">
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="w-4/12 p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                    <td class="p-5">
                      <div class="h-6 bg-gray-200 animate-pulse"></div>
                    </td>
                  </tr>
                </template>
              </VcTable>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ITableColumn, VcButton, VcTable } from "@/components";
import { AccountNavigation, AddressForm, useUser, useUserAddresses } from "@/shared/account";
import { computed, ComputedRef, onMounted, Ref, ref } from "vue";
import { clone } from "lodash";
import { MemberAddressType } from "@/core/api/graphql/types";
import { sortAscending, sortDescending } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { useCountries } from "@core/composables";
import { AddressType } from "@core/types";

const breakpoints = useBreakpoints(breakpointsTailwind);
const { me: user } = useUser();
const { countries, loadCountries } = useCountries();
const {
  loading: addressesLoading,
  addresses,
  sort,
  loadAddresses,
  setDefaultAddress,
  removeAddresses,
  defaultShippingAddress,
  addOrUpdateAddresses,
} = useUserAddresses({ user });

const isMobile = breakpoints.smaller("md");
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
      ? `${editableAddress.value.firstName} ${editableAddress.value.lastName}`
      : "New address";
  } else {
    return "Addresses";
  }
});

const columns = ref<ITableColumn[]>([
  {
    id: "firstName",
    title: "Recipient's name",
    sortable: true,
  },
  {
    id: "countryCode",
    title: "Address",
    sortable: true,
  },
  {
    id: "phone",
    title: "Phone",
    sortable: true,
  },
  {
    id: "email",
    title: "Email",
    sortable: true,
  },
  {
    id: "actions",
    title: "Actions",
    titlePosition: "text-center",
  },
]);

const onPageChange = async (newPage: number) => {
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

function actionBuilder(address: MemberAddressType) {
  const result = [
    {
      icon: "fas fa-pencil-alt",
      title: "Edit",
      bgColor: "bg-gray-300",
      clickHandler() {
        openEditMode(address);
      },
    },
    {
      icon: "fas fa-trash-alt",
      title: "Delete",
      leftActions: true,
      bgColor: "bg-red-500",
      clickHandler() {
        removeAddress(address);
      },
    },
  ];

  if (defaultShippingAddress.value && address.id !== defaultShippingAddress.value.id) {
    result.push({
      icon: "fas fa-check",
      title: "Make default",
      bgColor: "bg-yellow-500",
      clickHandler() {
        setDefaultAddress(address);
      },
    });
  }

  return result;
}

const applySorting = async (column: string): Promise<void> => {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === sortDescending ? sortAscending : sortDescending;
  } else {
    sort.value.column = column;
    sort.value.direction = sortDescending;
  }

  page.value = 1;
  await loadAddresses();
};

async function saveAddress(address: MemberAddressType): Promise<void> {
  saveAddressLoading.value = true;
  await addOrUpdateAddresses([{ ...address, addressType: AddressType.BillingAndShipping }]);
  closeEditMode();
  saveAddressLoading.value = false;
}

async function removeAddress(address: MemberAddressType): Promise<void> {
  if (!window.confirm("Are you sure you want do delete this address?")) return;

  await removeAddresses([address]);
}

onMounted(async () => {
  await loadAddresses();

  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>

<style scoped>
.polygons-bg {
  background-image: url(/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>
