<template>
  <VcPopup :title="$t('shared.checkout.select_address_dialog.title')" modal-width="max-w-5xl" is-mobile-fullscreen>
    <template #actions="{ close }">
      <VcButton
        class="px-2 uppercase lg:mr-auto"
        :class="[isMobile && 'w-1/2 grow']"
        is-outline
        @click="
          $emit('addNewAddress');
          close();
        "
      >
        {{ $t("shared.checkout.select_address_dialog.add_address_button") }}
      </VcButton>

      <div class="flex space-x-3" :class="[isMobile ? 'w-1/2 grow' : 'w-auto']">
        <VcButton
          v-if="!isMobile"
          kind="secondary"
          class="w-1/2 grow uppercase md:w-auto md:grow-0 md:px-5"
          is-outline
          @click="close"
        >
          {{ $t("shared.checkout.select_address_dialog.cancel_button") }}
        </VcButton>

        <VcButton
          class="w-1/2 grow uppercase md:w-auto md:grow-0 md:px-10"
          @click="
            $emit('result', selectedAddress);
            close();
          "
        >
          {{
            isMobile
              ? $t("shared.checkout.select_address_dialog.save_button")
              : $t("shared.checkout.select_address_dialog.ok_button")
          }}
        </VcButton>
      </div>
    </template>

    <VcTable :columns="columns" :items="paginatedAddresses" :pages="pages" :page="page" @page-changed="onPageChange">
      <template #mobile-item="itemData">
        <div class="flex items-center space-x-3 border-b border-gray-200 p-6">
          <div class="w-1/2 grow truncate">
            <p class="text-base font-bold">
              <span v-if="isCorporateMember" class="text-base font-bold">
                {{ itemData.item.countryCode }} {{ itemData.item.regionName }} {{ itemData.item.city }}
                {{ itemData.item.line1 }}
                {{ itemData.item.postalCode }}
              </span>
              <span v-else>{{ itemData.item.firstName }} {{ itemData.item.lastName }}</span>
            </p>

            <p class="text-sm">
              <span v-if="isCorporateMember">{{ itemData.item.description }}</span>
              <span v-else>
                {{ itemData.item.countryCode }} {{ itemData.item.regionName }} {{ itemData.item.city }}
                {{ itemData.item.line1 }}
                {{ itemData.item.postalCode }}
              </span>
            </p>

            <p class="text-sm text-gray-400">
              <span v-if="isCorporateMember">{{ itemData.item.postalCode }}</span>
              <span v-else-if="!!itemData.item.phone">
                <span class="font-semibold">{{ $t("common.labels.phone") }}: </span>
                {{ itemData.item.phone }}
              </span>
            </p>

            <p class="text-sm text-gray-400">
              <span v-if="isCorporateMember">{{ itemData.item.countryName }}</span>
              <span v-else-if="!!itemData.item.email">
                <span class="font-semibold">{{ $t("common.labels.email") }}: </span>
                {{ itemData.item.email }}
              </span>
            </p>
          </div>

          <div v-if="itemData.item.id === selectedAddress?.id" class="w-1/4">
            <div class="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm text-white">
              <i class="fas fa-check"></i>
            </div>
          </div>

          <div v-else class="w-1/4">
            <button
              v-t="'shared.checkout.select_address_dialog.select_button'"
              type="button"
              class="mx-auto flex h-9 grow items-center justify-center rounded border-2 border-[color:var(--color-primary)] px-3 font-roboto-condensed text-base font-bold uppercase text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white focus:outline-none"
              @click="setAddress(itemData.item)"
            ></button>
          </div>
        </div>
      </template>

      <template #mobile-empty>
        <div
          v-t="'shared.checkout.select_address_dialog.no_addresses_message'"
          class="flex items-center space-x-3 border-b border-gray-200 p-6"
        ></div>
      </template>

      <template #desktop-body>
        <tr v-for="(address, index) in paginatedAddresses" :key="address.id" :class="{ 'bg-gray-50': index % 2 }">
          <td class="truncate p-5">
            <span v-if="isCorporateMember">
              {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
              {{ address.postalCode }}
            </span>
            <span v-else> {{ address.firstName }} {{ address.lastName }} </span>
          </td>

          <td class="truncate p-5">
            <span v-if="isCorporateMember">
              {{ address.description }}
            </span>
            <span v-else>
              {{ address.countryCode }} {{ address.regionName }} {{ address.city }} {{ address.line1 }}
              {{ address.postalCode }}
            </span>
          </td>

          <td class="truncate p-5">
            <span v-if="isCorporateMember">
              {{ address.postalCode }}
            </span>
            <span v-else>
              {{ address.phone }}
            </span>
          </td>

          <td class="truncate p-5">
            <span v-if="isCorporateMember">
              {{ address.countryName }}
            </span>
            <span v-else>
              {{ address.email }}
            </span>
          </td>

          <td v-if="address.id === selectedAddress?.id" class="p-5">
            <div
              class="mx-auto my-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-sm text-white"
            >
              <i class="fas fa-check"></i>
            </div>
          </td>
          <td v-else class="p-5">
            <button
              v-t="'shared.checkout.select_address_dialog.select_button'"
              type="button"
              class="mx-auto flex h-9 grow items-center justify-center rounded border-2 border-[color:var(--color-primary)] px-3 font-roboto-condensed text-base font-bold uppercase text-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)] hover:text-white focus:outline-none"
              @click="setAddress(address)"
            ></button>
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
          <td colspan="5">
            <div class="flex items-center border-b border-gray-200 p-5">
              <span v-t="'shared.checkout.select_address_dialog.no_addresses_message'" class="text-base"></span>
            </div>
          </td>
        </tr>
      </template>

      <template #footer>
        <div v-if="pages > 1" class="flex justify-start border-b border-gray-200">
          <VcPagination v-model:page="page" :pages="pages" class="mt-5 self-start px-5 pb-5"></VcPagination>
        </div>
      </template>
    </VcTable>
  </VcPopup>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { computed, watchEffect, ref } from "vue";
import { useI18n } from "vue-i18n";
import { AnyAddressType } from "@/core/types";
import { isEqualAddresses } from "@/core/utilities";
import { useUser } from "@/shared/account";

interface IProps {
  currentAddress?: AnyAddressType;
  addresses?: AnyAddressType[];
  isCorporateMember: boolean;
}

interface IEmits {
  (event: "result"): void;
  (event: "addNewAddress"): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});

const { t } = useI18n();
const { user } = useUser();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

const selectedAddress = ref<AnyAddressType>();
const page = ref(1);
const itemsPerPage = ref(4);

const pages = computed(() => Math.ceil(props.addresses.length / itemsPerPage.value));
const paginatedAddresses = computed(() =>
  props.addresses.slice((page.value - 1) * itemsPerPage.value, page.value * itemsPerPage.value)
);

const columns = computed<ITableColumn[]>(() => [
  {
    id: props.isCorporateMember ? "address" : "firstName",
    title: props.isCorporateMember ? t("common.labels.address") : t("common.labels.recipient_name"),
  },
  {
    id: props.isCorporateMember ? "description" : "countryCode",
    title: props.isCorporateMember ? t("common.labels.description") : t("common.labels.address"),
  },
  {
    id: props.isCorporateMember ? "postalCode" : "phone",
    title: props.isCorporateMember ? t("common.labels.zip_code") : t("common.labels.phone"),
  },
  {
    id: props.isCorporateMember ? "countryName" : "email",
    title: props.isCorporateMember ? t("common.labels.country") : t("common.labels.email"),
  },
  {
    id: "activeAddress",
    title: t("common.labels.active_address"),
    align: "center",
  },
]);

const onPageChange = async (newPage: number) => {
  page.value = newPage;
};

function setAddress(address: AnyAddressType): void {
  selectedAddress.value = address;

  if (props.isCorporateMember) {
    selectedAddress.value.firstName = user.value.contact!.firstName;
    selectedAddress.value.lastName = user.value.contact!.lastName;
  }
}

watchEffect(() => {
  selectedAddress.value = props.addresses.find((item) => isEqualAddresses(item, props.currentAddress!));
});
</script>
