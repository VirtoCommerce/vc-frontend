<template>
  <div class="top-header-organizations">
    <div v-if="!isShowSearch" class="top-header-organizations__label top-header-organizations__label--static">
      {{ $t("common.labels.organizations") }}
    </div>

    <div v-else class="top-header-organizations__search">
      <div class="top-header-organizations__label">
        {{ $t("common.labels.organizations") }}
      </div>

      <VcInput
        v-model="searchPhrase"
        type="search"
        size="sm"
        data-test-id="organizations-search"
        :placeholder="$t('common.labels.search')"
        :clearable="!!searchPhrase"
        :aria="{
          role: 'combobox',
          'aria-expanded': 'true',
          'aria-haspopup': 'listbox',
          'aria-controls': listboxId,
          'aria-activedescendant': activeDescendantId ?? null,
        }"
        @keydown.enter="onSearch"
        @keydown.down.prevent="next(-1)"
        @input="onSearchInput"
        @clear="onSearchClear"
      >
        <template #append>
          <VcButton icon="search" icon-size="1.25rem" data-test-id="organizations-search-button" @click="onSearch" />
        </template>
      </VcInput>
    </div>

    <VcScrollbar
      :id="listboxId"
      vertical
      role="listbox"
      :aria-label="$t('common.labels.organizations')"
      class="top-header-organizations__list"
      test-id="organizations-list"
    >
      <VcMenuItem
        v-for="(item, index) in displayedOrganizations"
        :key="item.id"
        size="xs"
        role="option"
        :option-id="getOptionId(index)"
        :data-vc-organization-option="componentId"
        :aria-selected="contactOrganizationId === item.id"
        @click="selectOrganization(item.id)"
        @keydown.up.prevent="prev(index)"
        @keydown.down.prevent="next(index)"
      >
        <VcRadioButton
          :model-value="contactOrganizationId"
          :label="item.name"
          :value="item.id"
          :max-lines="2"
          :title="item.name"
          word-break="break-word"
          :data-organization-name="item.name"
        />
      </VcMenuItem>

      <div
        v-if="organizations.length === 0 && !loading"
        class="top-header-organizations__empty"
        data-test-id="organizations-empty-list"
      >
        {{ $t("shared.layout.header.top_header.no_results") }}
      </div>

      <VcInfinityScrollLoader
        v-if="hasNextPage"
        :loading="loading"
        :page-number="currentPage"
        :pages-count="pagesCount"
        distance="50"
        class="top-header-organizations__loader"
        @visible="loadOrganizations"
      />
    </VcScrollbar>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useUser, useUserOrganizations } from "@/shared/account";
import { useComponentId } from "@/ui-kit/composables";

const emit = defineEmits<{
  organizationSelected: [];
}>();

const SEARCH_DEBOUNCE_MS = 300;

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

// Keep the radio selection in sync with the actual active organization so a failed/abandoned switch
// can't leave the optimistic value stale (clicking the current org early-returns without re-syncing).
watch(
  () => user.value?.contact?.organizationId,
  (organizationId) => {
    contactOrganizationId.value = organizationId;
  },
);

const componentId = useComponentId("organizations");
const listboxId = componentId + "-listbox";
const focusedOptionIndex = ref(-1);

const displayedOrganizations = computed(() => {
  const withoutCurrent = organizations.value.filter((item) => item.id !== organization.value?.id);

  if (organization.value && !loading.value && organizations.value.length > 0) {
    return [organization.value, ...withoutCurrent];
  }

  return withoutCurrent;
});

watch(displayedOrganizations, () => {
  focusedOptionIndex.value = -1;
});

function getOptionId(index: number): string {
  return `${componentId}-option-${index}`;
}

const activeDescendantId = computed(() => {
  if (focusedOptionIndex.value >= 0) {
    return getOptionId(focusedOptionIndex.value);
  }
  return undefined;
});

function getOptionElements(): HTMLElement[] {
  const elements = document.querySelectorAll<HTMLElement>(
    `[data-vc-organization-option="${componentId}"] [tabindex='0']`,
  );
  return Array.from(elements);
}

function next(index: number): void {
  const elements = getOptionElements();

  if (!elements.length) {
    return;
  }

  const nextIndex = index >= elements.length - 1 ? 0 : index + 1;
  focusedOptionIndex.value = nextIndex;
  elements[nextIndex]?.focus();
}

function prev(index: number): void {
  const elements = getOptionElements();

  if (!elements.length) {
    return;
  }

  const prevIndex = index <= 0 ? elements.length - 1 : index - 1;
  focusedOptionIndex.value = prevIndex;
  elements[prevIndex]?.focus();
}

async function selectOrganization(organizationId: string): Promise<void> {
  if (!organizationId) {
    return;
  }

  // The current organization is already active — selecting it must not trigger a redundant switch.
  if (organizationId === organization.value?.id) {
    emit("organizationSelected");
    return;
  }

  contactOrganizationId.value = organizationId;

  await switchOrganization(organizationId);
  emit("organizationSelected");
}

async function onSearch(): Promise<void> {
  await search();
}

const debouncedSearch = useDebounceFn(search, SEARCH_DEBOUNCE_MS);

async function onSearchInput(): Promise<void> {
  if (!searchPhrase.value.trim()) {
    await search();
  } else {
    void debouncedSearch();
  }
}

async function onSearchClear(): Promise<void> {
  reset();
  await search();
}
</script>

<style lang="scss">
.top-header-organizations {
  @apply rounded-b-md border-t bg-neutral-50;

  &__search {
    @apply border-b bg-neutral-100 p-3 pt-2;
  }

  &__label {
    @apply pb-1 text-xs text-neutral-600;

    &--static {
      @apply px-3 pt-3;
    }
  }

  &__list {
    @apply my-1 max-h-60;
  }

  &__radio {
    @apply flex px-3 py-1 text-sm;
  }

  &__loader {
    @apply py-2;
  }

  &__empty {
    @apply px-3 py-2 text-neutral-600 text-center;
  }
}
</style>
