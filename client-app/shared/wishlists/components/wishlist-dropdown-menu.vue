<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" placement="bottom-end">
    <template #trigger>
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" />
    </template>
    <template #content>
      <VcMenuItem color="secondary" @click="$emit('edit')">
        <VcIcon name="pencil" />

        <span>{{ $t("shared.wishlists.list_card.list_edit_button") }}</span>
      </VcMenuItem>
      <VcMenuItem v-if="scopeButton" :color="scopeButton.color" @click="$emit('setScope', scopeButton.scope)">
        <VcIcon :name="scopeButton.icon" />

        <span class="whitespace-nowrap">{{ $t(scopeButton.localePath) }}</span>
      </VcMenuItem>
      <VcMenuItem color="secondary" @click="$emit('remove')">
        <VcIcon name="delete-2" class="text-[--color-danger-500]" />

        <span>{{ $t("shared.wishlists.list_card.remove_list_button") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type ScopeType = "private" | "organization";
export type ScopeColorsType = "secondary" | "info";

type ScopeButtonType = { scope: ScopeType; icon: string; color: ScopeColorsType; localePath: string };

defineEmits<IEmit>();
const props = defineProps<IProps>();

const changeScopeButtons: { [key in ScopeType]: ScopeButtonType } = {
  private: {
    scope: "private",
    icon: "lock-closed",
    color: "secondary",
    localePath: "shared.wishlists.list_card.make_private_button",
  },
  organization: {
    scope: "organization",
    icon: "users",
    color: "info",
    localePath: "shared.wishlists.list_card.share_with_organisation_button",
  },
};

interface IEmit {
  (event: "edit"): void;
  (event: "remove"): void;
  (event: "setScope", scope: ScopeType): void;
}

interface IProps {
  currentScope?: string;
}

const scopeButton = computed<ScopeButtonType | undefined>(() => {
  if (props.currentScope === "private") {
    return changeScopeButtons["organization"];
  }
  if (props.currentScope === "organization") {
    return changeScopeButtons["private"];
  }
  return undefined;
});
</script>
