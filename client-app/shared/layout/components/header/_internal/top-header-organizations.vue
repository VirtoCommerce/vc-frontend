<template>
  <div class="rounded-b-md border-t bg-neutral-50">
    <div v-if="isShowSearch" class="border-b bg-neutral-100 p-3 pt-2">
      <div class="pb-1 text-xs text-neutral-600">
        {{ $t("common.labels.organizations") }}
      </div>

      <VcInput
        v-model="searchPhrase"
        type="search"
        size="sm"
        :placeholder="$t('common.labels.search')"
        :clearable="!!searchPhrase"
        @keydown.enter="onSearch"
        @input="onSearchInput"
        @clear="onSearchClear"
      >
        <template #append>
          <VcButton icon="search" icon-size="1.25rem" @click="onSearch" />
        </template>
      </VcInput>
    </div>

    <div v-else class="px-3 pt-3 text-xs text-neutral-600">
      {{ $t("common.labels.organizations") }}
    </div>

    <div ref="scrollContainer" class="my-1 max-h-60 overflow-y-auto">
      <VcRadioButton
        v-if="organization && !loading"
        :model-value="contactOrganizationId"
        :value="organization.id"
        :label="organization.name"
        :max-lines="2"
        :title="organization.name"
        :data-test-id="`main-layout.top-header.account-menu.organization-selector-item-${organization.name}`"
        word-break="break-word"
        class="flex px-3 py-1 text-sm"
      />

      <VcRadioButton
        v-for="item in organizationsWithoutCurrent"
        :key="item.id"
        v-model="contactOrganizationId"
        :label="item.name"
        :value="item.id"
        class="flex px-3 py-1 text-sm"
        :max-lines="2"
        :title="item.name"
        word-break="break-word"
        :data-test-id="`main-layout.top-header.account-menu.organization-selector-item-${item.name}`"
        @change="selectOrganization"
      />

      <VcInfinityScrollLoader
        v-if="hasNextPage"
        :loading="loading"
        :viewport="scrollContainer"
        :page-number="currentPage"
        :pages-count="pagesCount"
        distance="50"
        class="py-2"
        @visible="loadOrganizations"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, computed } from "vue";
import { useUser, useUserOrganizations } from "@/shared/account";

const emit = defineEmits<{
  organizationSelected: [];
}>();

const { user, switchOrganization, organization } = useUser();
const {
  searchPhrase,
  organizations,
  loading,
  hasNextPage,
  pagesCount,
  currentPage,
  loadOrganizations,
  search,
  reset,
  isShowSearch,
} = useUserOrganizations();

const contactOrganizationId = ref(user.value?.contact?.organizationId);
const scrollContainer = useTemplateRef("scrollContainer");

const organizationsWithoutCurrent = computed(() =>
  organizations.value.filter((item) => item.id !== organization.value?.id),
);

async function selectOrganization(): Promise<void> {
  if (!contactOrganizationId.value) {
    return;
  }

  await switchOrganization(contactOrganizationId.value);
  emit("organizationSelected");
}

async function onSearch(): Promise<void> {
  await search();
}

async function onSearchInput(): Promise<void> {
  if (!searchPhrase.value.trim()) {
    await search();
  }
}

async function onSearchClear(): Promise<void> {
  reset();
  await search();
}
</script>
