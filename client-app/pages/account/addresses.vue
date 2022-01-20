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
            <h2 class="text-gray-800 text-3xl font-bold uppercase">Addresses</h2>
            <button
              class="uppercase border border-yellow-500 text-yellow-500 py-1 px-3 rounded font-roboto-condensed text-base disabled:opacity-30"
            >
              {{ isMobile ? "Add new" : "Add new address" }}
            </button>
          </div>
          <div class="flex flex-col bg-white shadow-sm" :class="{ 'rounded border': !isMobile }">
            <!-- Mobile table view -->
            <template v-if="isMobile">
              <div v-if="addresses && addresses.length > 0">
                <TableMobileItem
                  v-for="address in paginatedAddresses"
                  :key="address.id!"
                  :action-builder="actionBuilder"
                  :item="address"
                  class="overflow-auto"
                >
                  <div
                    class="grid grid-cols-2 p-6 gap-y-4 border-b border-gray-200"
                    :class="{
                      'relative mobile-default-badge':
                        defaultShippingAddress && address.id === defaultShippingAddress.id,
                    }"
                  >
                    <div
                      v-if="defaultShippingAddress && address.id === defaultShippingAddress.id"
                      class="absolute top-0 right-0 z-10"
                    >
                      <i class="fas fa-check text-white mr-2"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Company name</span>
                      <span class="font-extrabold">{{ address.organization }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Address</span>
                      <span>
                        {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
                        {{ address.postalCode }}</span
                      >
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Phone</span>
                      <span>{{ address.phone }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-400">Email</span>
                      <span>{{ address.email }}</span>
                    </div>
                  </div>
                </TableMobileItem>
              </div>
              <div v-else class="flex items-center justify-center space-x-10 p-5">
                <img src="/assets/static/images/account/icons/no-addresses.svg" alt="No addresses" />
                <div class="flex flex-col space-y-2">
                  <span class="text-base">There are no addresses yet</span>
                  <button
                    class="uppercase bg-yellow-500 text-white py-2 w-full rounded font-roboto-condensed text-base disabled:opacity-30"
                  >
                    Add new address
                  </button>
                </div>
              </div>
            </template>

            <!-- Desctop table view -->
            <table v-else class="table-auto text-sm text-left">
              <thead class="border-b border-gray-200">
                <tr>
                  <th
                    class="py-3 px-5 font-extrabold"
                    :class="{
                      desc: sort.column === 'firstName' && sort.direction === sortDescending,
                      asc: sort.column === 'firstName' && sort.direction === sortAscending,
                    }"
                    @click="applySorting('firstName')"
                  >
                    Recipient's name
                  </th>
                  <th
                    class="py-3 px-5 font-extrabold"
                    :class="{
                      desc: sort.column === 'countryCode' && sort.direction === sortDescending,
                      asc: sort.column === 'countryCode' && sort.direction === sortAscending,
                    }"
                    @click="applySorting('countryCode')"
                  >
                    Address
                  </th>
                  <th
                    class="py-3 px-5 font-extrabold"
                    :class="{
                      desc: sort.column === 'phone' && sort.direction === sortDescending,
                      asc: sort.column === 'phone' && sort.direction === sortAscending,
                    }"
                    @click="applySorting('phone')"
                  >
                    Phone
                  </th>
                  <th
                    class="py-3 px-5 font-extrabold"
                    :class="{
                      desc: sort.column === 'email' && sort.direction === sortDescending,
                      asc: sort.column === 'email' && sort.direction === sortAscending,
                    }"
                    @click="applySorting('email')"
                  >
                    Email
                  </th>
                  <th class="py-3 px-5 font-extrabold">Default</th>
                  <th class="py-3 px-5 font-extrabold">Actions</th>
                </tr>
              </thead>
              <tbody v-if="addresses && addresses.length > 0">
                <tr
                  v-for="(address, index) in paginatedAddresses"
                  :key="address.id!"
                  :class="{ 'bg-gray-50': index % 2 }"
                >
                  <td class="p-5">{{ address.firstName }} {{ address.lastName }}</td>
                  <td class="p-5">
                    {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
                    {{ address.postalCode }}
                  </td>
                  <td class="p-5">{{ address.phone }}</td>
                  <td class="p-5">{{ address.email }}</td>
                  <td
                    v-if="defaultShippingAddress && address.id === defaultShippingAddress.id"
                    class="px-3 py-5 font-bold"
                  >
                    <i class="fas fa-check text-yellow-500"></i> Default
                  </td>
                  <td v-else class="p-5 text-blue-400 font-semibold">
                    <span
                      class="border-b border-dashed border-blue-400 cursor-pointer"
                      @click="setDefaultAddress(address)"
                      >Make default</span
                    >
                  </td>
                  <td class="p-5 flex space-x-2">
                    <button type="button" class="h-6 w-6 shadow rounded text-yellow-500 hover:bg-gray-100">
                      <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button
                      type="button"
                      class="h-6 w-6 shadow rounded text-red-500 hover:bg-gray-100"
                      @click="removeAddress(address)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <!-- Workaround for using colspan -->
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="6" class="polygons-bg">
                    <div class="flex items-center pl-56 space-x-10 h-80">
                      <img src="/assets/static/images/account/icons/no-addresses.svg" alt="No addresses" />
                      <div class="flex flex-col space-y-2">
                        <span class="text-base">There are no addresses yet</span>
                        <button
                          class="uppercase bg-yellow-500 text-white py-2 w-full rounded font-roboto-condensed text-base disabled:opacity-30"
                        >
                          Add new address
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <Pagination
              v-if="pages > 1"
              v-model:page="page"
              :pages="pages"
              class="self-start"
              :class="[isMobile ? 'px-6 py-10' : 'pb-5 px-5 mt-5']"
              @update:page="page = $event"
            ></Pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from "@/shared/catalog/components/pagination.vue";
import { ISortInfo, TableMobileItem } from "@/components";
import { AccountNavigation, useUser } from "@/shared/account";
import { computed, onMounted, Ref, ref } from "vue";
import { MemberAddressType } from "@/core/api/graphql/types";
import { sortAscending, sortDescending } from "@/core/constants";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
const { loadAddresses, addresses, deleteAddress, defaultShippingAddress } = useUser();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const page = ref(1);
const itemsPerPage = ref(6);
const pages = computed(() => Math.ceil(addresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed(() =>
  addresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);
const sort: Ref<ISortInfo> = ref({
  column: "lastName",
  direction: sortAscending,
});

onMounted(async () => {
  await loadItems();
});

const actionBuilder = (address: MemberAddressType) => {
  let result = [
    {
      icon: "fas fa-pencil-alt",
      title: "Edit",
      bgColor: "bg-gray-300",
      position: "right",
      clickHandler() {
        console.log("edit address", address);
      },
    },
    {
      icon: "fas fa-trash-alt",
      title: "Delete",
      position: "left",
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
      position: "right",
      bgColor: "bg-yellow-500",
      clickHandler() {
        setDefaultAddress(address);
      },
    });
  }

  return result;
};

const setDefaultAddress = async (address: MemberAddressType) => {
  //TODO: will be implemented in the separate story
};

const applySorting = async (column: string): Promise<void> => {
  if (sort.value.column === column) {
    sort.value.direction = sort.value.direction === sortDescending ? sortAscending : sortDescending;
  } else {
    sort.value.column = column;
    sort.value.direction = sortDescending;
  }

  await loadItems();
};

const removeAddress = async (address: MemberAddressType) => {
  const result = window.confirm("Are you sure you want do delete this address?");

  if (result) {
    const updatedAddresses = addresses.value.filter((item) => item.id !== address.id);

    if (address.id === defaultShippingAddress.value.id && updatedAddresses.length > 0) {
      //todo: set the first item in updatedAddresses to default one
    }

    const sortingExpression = getSortingExpression(sort.value);
    await deleteAddress(updatedAddresses, sortingExpression);
  }
};

async function loadItems(): Promise<void> {
  const sortingExpression = getSortingExpression(sort.value);
  await loadAddresses(sortingExpression);
}

function getSortingExpression(sort: ISortInfo): string {
  return `${sort.column}:${sort.direction}`;
}
</script>
<style scoped>
.mobile-default-badge::before {
  /* we need this to create the pseudo-element */
  content: "";
  display: block;

  /* position the triangle in the top right corner */
  position: absolute;
  z-index: 0;
  top: 0;
  right: 0;

  /* create the triangle */
  width: 0;
  height: 0;
  border: 1.5em solid transparent;
  border-top-color: #f0ad4e;
  border-right-color: #f0ad4e;
}

.polygons-bg {
  background-image: url(/assets/static/images/account/addresses-bg.svg);
  background-repeat: no-repeat;
  background-position: right;
}
</style>
