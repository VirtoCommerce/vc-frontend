<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" :placement="placement">
    <template #trigger>
      <VcButton :aria-label="$t('common.labels.actions')" icon="cog" color="secondary" variant="outline" size="xs" />
    </template>

    <template #content>
      <VcMenuItem color="secondary" @click="editAddress">
        <VcIcon name="pencil" />

        <span>{{ $t("common.buttons.edit") }}</span>
      </VcMenuItem>

      <VcMenuItem v-if="isCorporateMember" color="secondary" @click="$emit('toggleFavorite')">
        <VcIcon name="whishlist" />

        <span>
          {{
            address.isFavorite
              ? $t("pages.company.info.remove_from_favorites")
              : $t("pages.company.info.add_to_favorites")
          }}
        </span>
      </VcMenuItem>

      <VcMenuItem
        :title="address.isDefault ? $t('pages.company.info.address_not_delete_message') : undefined"
        :disabled="address.isDefault"
        color="secondary"
        @click="deleteAddress"
      >
        <VcIcon
          :class="address.isDefault ? 'text-[--color-neutral-400]' : 'text-[--color-danger-500]'"
          name="delete-2"
        />

        <span>{{ $t("common.buttons.delete") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { useUser } from "@/shared/account/composables/useUser";
import type { MemberAddressType } from "@/core/api/graphql/types";

interface IEmit {
  (event: "edit"): void;
  (event: "delete"): void;
  (event: "toggleFavorite"): void;
}

export interface IProps {
  address: MemberAddressType;
  placement?: VcDropdownMenuPlacement;
}

const emit = defineEmits<IEmit>();
const props = withDefaults(defineProps<IProps>(), {
  placement: "bottom-end",
});

const { address, placement } = toRefs(props);
const { isCorporateMember } = useUser();

const editAddress = () => {
  emit("edit");
};

const deleteAddress = () => {
  if (address.value.isDefault) {
    return;
  }
  emit("delete");
};
</script>
