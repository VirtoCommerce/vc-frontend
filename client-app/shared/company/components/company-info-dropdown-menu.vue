<template>
  <VcTooltip :y-offset="4" :x-offset="0" :placement="placement" trigger="click">
    <template #trigger>
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" />
    </template>

    <template #content>
      <div
        class="flex select-none flex-col divide-y rounded bg-[--color-additional-50] text-sm font-bold text-[--color-accent-600] shadow-xl"
      >
        <button type="button" class="flex items-center gap-2.5 whitespace-nowrap p-3" @click="editAddress">
          <VcIcon class="text-[--color-primary-500]" name="pencil" size="sm" />
          {{ $t("common.buttons.edit") }}
        </button>

        <button
          type="button"
          :disabled="address.isDefault"
          :title="address.isDefault ? $t('pages.company.info.address_not_delete_message') : undefined"
          class="flex items-center gap-2.5 whitespace-nowrap p-3 disabled:text-[--color-neutral-400]"
          @click="deleteAddress"
        >
          <VcIcon :class="{ 'text-[--color-danger-500]': !address.isDefault }" name="delete-2" size="sm" />
          {{ $t("common.buttons.delete") }}
        </button>
      </div>
    </template>
  </VcTooltip>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import type { MemberAddressType } from "@/core/api/graphql/types";

interface IEmit {
  (event: "edit", address: MemberAddressType): void;
  (event: "delete", address: MemberAddressType): void;
}

export interface IProps {
  address: MemberAddressType;
  placement?: VcTooltipPlacement;
}

const emit = defineEmits<IEmit>();

const props = withDefaults(defineProps<IProps>(), {
  placement: "bottom-end",
});

const { address, placement } = toRefs(props);

const editAddress = () => {
  emit("edit", address.value);
};

const deleteAddress = () => {
  if (address.value.isDefault) {
    return;
  }
  emit("delete", address.value);
};
</script>
