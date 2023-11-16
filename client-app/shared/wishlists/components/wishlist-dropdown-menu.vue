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
      <VcMenuItem color="secondary" @click="$emit('remove')">
        <VcIcon name="delete-2" class="text-[--color-danger-500]" />

        <span>{{ $t("shared.wishlists.list_card.remove_list_button") }}</span>
      </VcMenuItem>
    </template>
  </VcDropdownMenu>
</template>

<script setup lang="ts">
interface IEmit {
  (event: "edit"): void;
  (event: "remove"): void;
}

defineEmits<IEmit>();
</script>
