<template>
  <VcDropdownMenu :y-offset="4" :x-offset="0" placement="bottom-end">
    <template #trigger="{ triggerProps }">
      <VcButton icon="cog" color="secondary" variant="outline" size="xs" v-bind="triggerProps" />
    </template>

    <template #content>
      <VcMenuItem color="secondary" nowrap @click="$emit('edit')">
        <template #prepend>
          <VcIcon name="edit" />
        </template>

        <span>{{ $t("shared.wishlists.list_card.list_edit_button") }}</span>
      </VcMenuItem>

      <VcMenuItem color="secondary" nowrap @click="$emit('remove')">
        <VcIcon name="delete-2" class="fill-danger" />

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
