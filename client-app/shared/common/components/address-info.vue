<template>
  <div class="space-y-2">
    <div class="flex flex-col">
      <span class="font-bold">{{ address.firstName }} {{ address.lastName }}</span>
      <AddressLine :address="address" />
    </div>

    <div class="flex flex-col empty:hidden">
      <span v-if="address.phone">
        <span class="mr-1 font-bold">{{ $t("common.labels.phone") }}:</span>
        {{ address.phone }}
      </span>

      <span v-if="address.email">
        <span class="mr-1 font-bold">{{ $t("common.labels.email") }}:</span>
        {{ address.email }}
      </span>
    </div>
    <div v-if="showActions" class="flex items-center justify-between gap-2.5 pt-4 empty:hidden">
      <VcButton size="xs" prepend-icon="information" @click="openInfo">Point info</VcButton>
      <GetDirectionsAction />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModal } from "@/shared/modal";
import AddressInfoModal from "./address-info-modal.vue";
import AddressLine from "./address-line.vue";
import type { AnyAddressType } from "@/core/types";
import GetDirectionsAction from "@/shared/common/components/get-directions-action.vue";

interface IProps {
  address: AnyAddressType;
  showActions?: boolean;
}

const props = defineProps<IProps>();

const { openModal, closeModal } = useModal();

function openInfo() {
  openModal({
    component: AddressInfoModal,
    props: {
      address: props.address,
      onClose: closeModal,
    },
  });
}
</script>
