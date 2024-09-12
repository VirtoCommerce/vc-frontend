<template>
  <VcModal :title="$t('shared.catalog.branches_modal.title')" modal-width="sm:max-w-[59.625rem]" is-mobile-fullscreen>
    <!-- DESKTOP content BEGIN -->
    <div class="hidden border-b sm:flex">
      <div
        class="flex shrink-0 grow flex-col transition-all delay-100"
        :class="[selectedBranchesIds.length ? 'w-1/2' : 'w-full']"
      >
        <div class="flex h-11 items-center bg-neutral-50 py-2 pl-4 pr-3.5">
          <div class="text-base">
            {{ $t("shared.catalog.branches_modal.all_branches") }}
          </div>

          <BranchSearch class="ml-1.5 grow md:ml-6" :model-value="searchInput" @update:input="search($event)" />
        </div>

        <transition-group
          v-if="branches.length"
          tag="div"
          name="branch"
          class="h-[23.8rem] max-h-screen-60 grow overflow-y-auto"
        >
          <template v-for="(branch, index) in branches" :key="index">
            <BranchItem
              v-if="!isBranchSelected(index)"
              :branch="branch"
              class="transition-opacity delay-100 duration-300 ease-in-out"
              :is-text-truncate-enabled="!!selectedBranchesIds.length"
            >
              <VcCheckbox v-model="selectedBranchesIds" class="mr-3 cursor-pointer" :value="branch.id"> </VcCheckbox>
            </BranchItem>
          </template>
        </transition-group>

        <VcEmptyView
          v-else
          :text="$t('shared.catalog.branches_modal.no_results')"
          icon="thin-stock"
          class="h-[23.8rem] max-h-screen-60"
        >
          <template v-if="searchInput.length" #button>
            <VcButton prepend-icon="reset" @click="searchInput = ''">
              {{ $t("shared.catalog.branches_modal.reset_search_button") }}
            </VcButton>
          </template>
        </VcEmptyView>
      </div>

      <div
        v-if="branches.length"
        class="flex shrink-0 flex-col overflow-hidden transition-all"
        :class="[selectedBranchesIds.length ? 'w-1/2 border-l' : 'w-0']"
      >
        <div class="flex h-11 items-center justify-between bg-neutral-50 py-2 pl-4 pr-3.5">
          <div class="text-sm">
            {{ $t("shared.catalog.branches_modal.selected_branches") }}
          </div>

          <div class="flex cursor-pointer items-center pl-2" @click="clearSelection">
            <svg class="text-primary" width="16" height="16">
              <use href="/static/images/clear.svg#main"></use>
            </svg>

            <div class="pl-2 text-sm font-bold text-[--link-color] hover:text-[--link-hover-color]">
              {{ $t("shared.catalog.branches_modal.clear_selection") }}
            </div>
          </div>
        </div>

        <transition-group tag="div" name="branch" class="h-[23.8rem] max-h-screen-60 grow overflow-y-auto">
          <template v-for="(branch, index) in branches" :key="index">
            <BranchItem
              v-if="isBranchSelected(index)"
              :branch="branch"
              class="transition-opacity delay-100 duration-300 ease-in-out"
              :is-text-truncate-enabled="!!selectedBranchesIds.length"
            >
              <VcCheckbox v-model="selectedBranchesIds" class="mr-3 cursor-pointer" :value="branch.id"> </VcCheckbox>
            </BranchItem>
          </template>
        </transition-group>
      </div>
    </div>
    <!-- DESKTOP content END -->

    <!-- MOBILE content BEGIN -->
    <div class="flex max-h-full grow flex-col sm:hidden">
      <div class="flex min-h-11 items-stretch bg-neutral-50 px-6 text-sm">
        <button
          type="button"
          class="mr-auto flex items-center py-2 font-bold"
          :class="{
            'text-[--link-color]': showSelectedBranchesMobile && selectedBranchesIds.length,
          }"
          :disabled="!(showSelectedBranchesMobile && selectedBranchesIds.length) || !selectedBranchesIds.length"
          @click="toggleShowSelectedBranchesMobile(false)"
        >
          {{ $t("shared.catalog.branches_modal.all_branches") }}
        </button>

        <template v-if="selectedBranchesIds.length">
          <button
            type="button"
            class="flex items-center py-2 font-bold"
            :class="{ 'text-[--link-color]': !showSelectedBranchesMobile }"
            :disabled="showSelectedBranchesMobile"
            @click="toggleShowSelectedBranchesMobile(true)"
          >
            {{ $t("shared.catalog.branches_modal.selected_branches") }} ({{ selectedBranchesIds.length }})
          </button>

          <button
            type="button"
            class="ml-2.5 flex size-7 items-center justify-center self-center rounded bg-additional-50 shadow-md"
            @click="clearSelection"
          >
            <svg class="text-primary" width="16" height="16">
              <use href="/static/images/clear.svg#main"></use>
            </svg>
          </button>
        </template>
      </div>

      <div class="border-b px-6 py-3">
        <BranchSearch :model-value="searchInput" @update:input="search($event)" />
      </div>

      <div v-if="branches.length && false">
        <template v-for="(branch, index) in branches">
          <BranchItem
            v-if="(showSelectedBranchesMobile && isBranchSelected(index)) || !showSelectedBranchesMobile"
            :key="branch.id"
            :branch="branch"
            :is-text-truncate-enabled="false"
          >
            <VcCheckbox v-model="selectedBranchesIds" class="mr-3 cursor-pointer" :value="branch.id"> </VcCheckbox>
          </BranchItem>
        </template>
      </div>

      <VcEmptyView v-else :text="$t('shared.catalog.branches_modal.no_results')" icon="thin-stock">
        <template v-if="searchInput.length" #button>
          <VcButton prepend-icon="reset" @click="searchInput = ''">
            {{ $t("shared.catalog.branches_modal.reset_search_button") }}
          </VcButton>
        </template>
      </VcEmptyView>
    </div>
    <!-- MOBILE content END -->

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" @click="close">
        {{ $t("shared.catalog.branches_modal.cancel_button") }}
      </VcButton>

      <VcButton
        :disabled="isSaveButtonDisabled"
        class="ms-auto"
        @click="
          save();
          close();
        "
      >
        {{ $t("shared.catalog.branches_modal.ok_button") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useFulfillmentCenters } from "../composables";
import BranchItem from "./branch-item.vue";
import BranchSearch from "./branch-search.vue";
import type { IFulfillmentCenter } from "@/shared/fulfillmentCenters";

interface IEmits {
  (event: "save", value: string[]): void;
}

interface IProps {
  selectedBranches?: string[];
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  selectedBranches: () => [],
});

const { loadFulfillmentCenters, fulfillmentCenters } = useFulfillmentCenters();

const showSelectedBranchesMobile = ref(false);
const searchInput = ref<string>("");
const branches = computed(() => fulfillmentCenters.value.filter((item) => searchFilter(item)));
const selectedBranchesIds = ref<string[]>([]);

onMounted(async () => {
  await loadFulfillmentCenters();
  selectedBranchesIds.value = [...props.selectedBranches];
});

function searchFilter(item: IFulfillmentCenter) {
  const searchArr = searchInput.value.trim().split(" ");
  const includeNumber = searchArr.filter((value) => {
    return item.name?.toLocaleLowerCase().includes(value) ?? item.address?.toLocaleLowerCase().includes(value);
  }).length;
  return includeNumber === searchArr.length;
}

function search(value: string) {
  searchInput.value = value.toLocaleLowerCase();
}

function isBranchSelected(index: number): boolean {
  return selectedBranchesIds.value.includes(branches.value[index]?.id ?? "");
}

function clearSelection() {
  selectedBranchesIds.value = [];
}

function toggleShowSelectedBranchesMobile(show: boolean) {
  showSelectedBranchesMobile.value = show;
}

const isSaveButtonDisabled = computed(
  () => JSON.stringify(props.selectedBranches) === JSON.stringify(selectedBranchesIds.value),
);

function save() {
  emit("save", selectedBranchesIds.value);
}

watch(selectedBranchesIds, () => {
  if (!selectedBranchesIds.value.length) {
    showSelectedBranchesMobile.value = false;
  }
});
</script>

<style lang="scss">
.branch-enter-from,
.branch-leave-to {
  opacity: 0;
}
</style>
