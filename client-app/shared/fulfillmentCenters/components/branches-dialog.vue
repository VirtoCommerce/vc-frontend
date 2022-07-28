<template>
  <VcPopup :title="$t('shared.catalog.branches_dialog.title')" modal-width="sm:max-w-[59.625rem]" is-mobile-fullscreen>
    <!-- DESKTOP content BEGIN -->
    <div class="hidden sm:flex border-b">
      <div
        class="shrink-0 flex-grow flex flex-col transition-all delay-100"
        :class="[selectedBranchesIds.length ? 'w-1/2' : 'w-full']"
      >
        <div class="flex items-center py-2 pl-4 pr-3.5 h-11 bg-[color:var(--color-branch-dialog-bg)]">
          <div class="text-15">
            {{ $t("shared.catalog.branches_dialog.all_branches") }}
          </div>

          <BranchSearch class="flex-grow ml-1.5 md:ml-6" :model-value="searchInput" @update:input="search($event)" />
        </div>
        <transition-group tag="div" name="branch" class="flex-grow h-[23.8rem] max-h-screen-60 overflow-y-auto">
          <template v-for="(branch, index) in branches" :key="index">
            <BranchItem
              v-if="!isBranchSelected(index)"
              :branch="branch"
              class="transition-opacity duration-300 delay-100 ease-in-out"
              :is-text-truncate-enabled="!!selectedBranchesIds.length"
            >
              <VcCheckbox class="mr-3 cursor-pointer" v-model="selectedBranchesIds" :value="branch.id"> </VcCheckbox>
            </BranchItem>
          </template>
        </transition-group>
      </div>
      <div
        class="shrink-0 flex flex-col overflow-hidden transition-all"
        :class="[selectedBranchesIds.length ? 'w-1/2 border-l' : 'w-0']"
      >
        <div class="flex items-center justify-between py-2 pl-4 pr-3.5 h-11 bg-[color:var(--color-branch-dialog-bg)]">
          <div class="text-15">
            {{ $t("shared.catalog.branches_dialog.selected_branches") }}
          </div>
          <div class="flex items-center pl-2 cursor-pointer" @click="clearSelection">
            <svg class="text-primary" width="16" height="16">
              <use href="/static/images/clear.svg#main"></use>
            </svg>
            <div class="pl-2 text-sm text-[color:var(--color-link)] font-bold">
              {{ $t("shared.catalog.branches_dialog.clear_selection") }}
            </div>
          </div>
        </div>
        <transition-group tag="div" name="branch" class="flex-grow h-[23.8rem] max-h-screen-60 overflow-y-auto">
          <template v-for="(branch, index) in branches" :key="index">
            <BranchItem
              v-if="isBranchSelected(index)"
              :branch="branch"
              class="transition-opacity duration-300 delay-100 ease-in-out"
              :is-text-truncate-enabled="!!selectedBranchesIds.length"
            >
              <VcCheckbox class="mr-3 cursor-pointer" v-model="selectedBranchesIds" :value="branch.id"> </VcCheckbox>
            </BranchItem>
          </template>
        </transition-group>
      </div>
    </div>
    <!-- DESKTOP content END -->

    <!-- MOBILE content BEGIN -->
    <div class="flex-grow max-h-full sm:hidden">
      <div class="flex items-stretch px-6 min-h-[2.75rem] text-15 bg-[color:var(--color-branch-dialog-bg)]">
        <button
          class="flex items-center mr-auto py-2 font-bold"
          :class="{
            'text-[color:var(--color-link)]': showSelectedBranchesMobile && selectedBranchesIds.length,
          }"
          :disabled="!(showSelectedBranchesMobile && selectedBranchesIds.length) || !selectedBranchesIds.length"
          @click="toggleShowSelectedBranchesMobile(false)"
        >
          {{ $t("shared.catalog.branches_dialog.all_branches") }}
        </button>

        <template v-if="selectedBranchesIds.length">
          <button
            class="flex items-center py-2 font-bold"
            :class="{ 'text-[color:var(--color-link)]': !showSelectedBranchesMobile }"
            :disabled="showSelectedBranchesMobile"
            @click="toggleShowSelectedBranchesMobile(true)"
          >
            {{ $t("shared.catalog.branches_dialog.selected_branches") }} ({{ selectedBranchesIds.length }})
          </button>

          <button
            class="self-center flex items-center justify-center ml-2.5 w-7 h-7 rounded shadow-t-mds bg-white"
            @click="clearSelection"
          >
            <svg class="text-primary" width="16" height="16">
              <use href="/static/images/clear.svg#main"></use>
            </svg>
          </button>
        </template>
      </div>
      <div class="px-6 py-3 border-b">
        <BranchSearch :model-value="searchInput" @update:input="search($event)" />
      </div>
      <div>
        <template v-for="(branch, index) in branches">
          <BranchItem
            v-if="(showSelectedBranchesMobile && isBranchSelected(index)) || !showSelectedBranchesMobile"
            :branch="branch"
            :is-text-truncate-enabled="false"
          >
            <VcCheckbox class="mr-3 cursor-pointer" v-model="selectedBranchesIds" :value="branch.id"> </VcCheckbox>
          </BranchItem>
        </template>
      </div>
    </div>
    <!-- MOBILE content END -->

    <template #actions="{ close }">
      <div
        class="relative flex-grow flex items-center justify-between -mt-4 pt-4 -mx-6 px-10 gap-5 shadow-t-lgs bg-white sm:shadow-none sm:mt-0 sm:px-6 sm:pt-0 sm:gap-auto"
      >
        <VcButton
          kind="secondary"
          class="uppercase basis-0 flex-grow sm:basis-auto sm:flex-grow-0 sm:px-4"
          is-outline
          @click="close"
        >
          {{ $t("shared.catalog.branches_dialog.cancel_button") }}
        </VcButton>

        <VcButton
          class="uppercase basis-0 flex-grow sm:basis-auto sm:flex-grow-0 sm:px-5 sm:min-w-[9rem]"
          @click="
            save();
            close();
          "
        >
          {{ $t("shared.catalog.branches_dialog.ok_button") }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import BranchItem from "./branch-item.vue";
import BranchSearch from "./branch-search.vue";
import { useFulfillmentCenters, IFulfillmentCenter } from "@/shared/fulfillmentCenters";

const { loading, loadFulfillmentCenters, fulfillmentCenters } = useFulfillmentCenters();
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("sm");
const showSelectedBranches = ref(false);
const showSelectedBranchesMobile = ref(false);
const selectedBranchesIds = ref<string[]>([]);
const searchInput = ref<string>("");
const branches = computed(() => fulfillmentCenters.value.filter((item) => searchFilter(item)));

loadFulfillmentCenters();
selectedBranchesIds.value = JSON.parse(localStorage.getItem("viewFulfillmentCenters") || "[]");

function searchFilter(item: IFulfillmentCenter) {
  const searchArr = searchInput.value.trim().split(" ");
  const includeNumber = searchArr.filter((value) => {
    return item.name?.toLocaleLowerCase().includes(value) || item.address?.toLocaleLowerCase().includes(value);
  }).length;
  return includeNumber === searchArr.length;
}

function search(value: string) {
  searchInput.value = value.toLocaleLowerCase();
}

function isBranchSelected(index: number): boolean {
  return selectedBranchesIds.value.includes(branches.value[index]?.id || "");
}

function clearSelection() {
  selectedBranchesIds.value = [];
}

function toggleShowSelectedBranchesMobile(show: boolean) {
  showSelectedBranchesMobile.value = show;
}

function save() {
  localStorage.setItem("viewFulfillmentCenters", JSON.stringify(selectedBranchesIds.value));
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
