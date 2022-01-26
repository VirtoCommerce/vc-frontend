<template>
  <Popup title="Select address">
    <template #actions="{ close }">
      <button
        class="uppercase inline-flex items-center justify-center lg:mr-auto px-5 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-600 hover:border-yellow-600 hover:text-white rounded focus:outline-none"
        @click="
          $emit('addNewAddress');
          close();
        "
      >
        Add new address
      </button>
      <div class="w-1/3 flex justify-between space-x-3">
        <button
          class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-5 h-9 font-roboto-condensed text-base font-bold border-2 border-black text-black hover:bg-black hover:text-white rounded focus:outline-none"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="w-1/2 lg:w-auto uppercase flex-grow lg:flex-grow-0 inline-flex items-center justify-center lg:px-10 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 bg-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600 rounded focus:outline-none"
          @click="
            $emit('result', selectedAddress);
            close();
          "
        >
          OK
        </button>
      </div>
    </template>

    <!-- Desctop table view -->
    <table class="table-auto text-sm text-left">
      <thead class="border-b border-gray-200">
        <tr>
          <th class="py-3 px-5 font-extrabold">Recipient's name</th>
          <th class="py-3 px-5 font-extrabold">Address</th>
          <th class="py-3 px-5 font-extrabold">Phone</th>
          <th class="py-3 px-5 font-extrabold">Email</th>
          <th class="py-3 px-5 font-extrabold">Active address</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(address, index) in paginatedAddresses" :key="address.id" :class="{ 'bg-gray-50': index % 2 }">
          <td class="p-5">{{ address.firstName }} {{ address.lastName }}</td>
          <td class="p-5">
            {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
            {{ address.postalCode }}
          </td>
          <td class="p-5">{{ address.phone }}</td>
          <td class="p-5">{{ address.id }}</td>
          <td v-if="address.id === selectedAddress?.id" class="p-5">
            <div class="flex items-center justify-center mx-auto rounded-full w-6 h-6 bg-green-600 text-white text-sm">
              <i class="fas fa-check"></i>
            </div>
          </td>
          <td v-else class="p-5">
            <button
              class="uppercase flex-grow flex items-center justify-center px-3 h-9 font-roboto-condensed text-base font-bold border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded focus:outline-none"
              @click="setAddress(address)"
            >
              Select
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-start border-b border-gray-200">
      <Pagination v-if="pages > 1" v-model:page="page" :pages="pages" class="self-start pb-5 px-5 mt-5"></Pagination>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { Popup } from "@/components";
import Pagination from "@/shared/catalog/components/pagination.vue";
import { MemberAddressType } from "@/core/api/graphql/types";
import { computed, onMounted, PropType, ref } from "vue";
import { getMyAddresses } from "@/core/api/graphql/account";

const props = defineProps({
  currentAddressId: {
    type: String,
    default: undefined,
  },

  // currentAddress: {
  //   type: Object as PropType<MemberAddressType>,
  //   default: undefined,
  // },

  // currentMethodOption: {
  //   type: String,
  //   default: undefined,
  // },

  // availableAddresses: {
  //   type: Array as PropType<CartAddressType[]>,
  //   default: () => [],
  // },

  onResult: {
    type: Function,
    default: undefined,
  },
});

defineEmits(["result", "addNewAddress"]);

const availableAddresses = ref<MemberAddressType[]>([]);

const page = ref(1);
const itemsPerPage = ref(4);
const pages = computed(() => Math.ceil(availableAddresses.value.length / itemsPerPage.value));
const paginatedAddresses = computed(() =>
  availableAddresses.value.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);
const selectedAddress = ref();

// const currentAddress = availableAddresses.value.find((item) => item.id === props.currentAddress?.id);
// const selectedAddress = ref(currentAddress);

function setAddress(address: MemberAddressType): void {
  selectedAddress.value = address;
}

onMounted(async () => {
  //selectedAddress.value = props.currentAddress;
  console.log("selectedAddressId", props.currentAddressId);
  const result = await getMyAddresses();
  availableAddresses.value = result;
  selectedAddress.value = availableAddresses.value.find((item) => item.id === props.currentAddressId);
});
</script>
