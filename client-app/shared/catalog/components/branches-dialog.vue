<template>
  <VcPopup :title="'Select Branch'" modal-width="max-w-[59.625rem]" hide-actions is-mobile-full-screen>
    <div>
      <div class="flex border-b">
        <div
          class="shrink-0 flex-grow flex flex-col transition-all"
          :class="[branches.filter((item) => item.checked).length ? 'w-1/2' : 'w-full']"
        >
          <div class="flex py-2 pl-4 pr-3.5 h-11 bg-[color:var(--color-branch-dialog-bg)]">
            <div class="text-15">All branches</div>
            <input
              class="flex-grow border"
              type="text"
              placeholder="Enter an address, city, country, ZIP, branch name"
            />
            <button></button>
          </div>
          <transition-group tag="div" name="branch" class="flex-grow h-[22.65rem] overflow-y-auto mt-px pt-0.5">
            <template v-for="(branch, index) in branches" :key="index">
              <BranchItem
                v-if="!branch.checked"
                :branch="branch"
                @check="toggleBranchChecked(index, true)"
                class="transition-[opacity] duration-300 ease-in-out"
              ></BranchItem>
            </template>
          </transition-group>
        </div>
        <div
          class="shrink-0 flex flex-col overflow-hidden transition-all"
          :class="[branches.filter((item) => item.checked).length ? 'w-1/2 border-l' : 'w-0']"
        >
          <div class="flex justify-between py-2 pl-4 pr-3.5 h-11 bg-[color:var(--color-branch-dialog-bg)]">
            <div class="text-15">Selected branches</div>
            <div class="flex items-center pl-2 cursor-pointer" @click="clearSelection">
              <svg class="text-primary" width="16" height="16">
                <use href="/static/images/clear.svg#main"></use>
              </svg>
              <div class="pl-2 text-sm text-[color:var(--color-link)] font-bold">Clear selection</div>
            </div>
          </div>
          <transition-group tag="div" name="branch" class="flex-grow h-[22.65rem] overflow-y-auto mt-px pt-0.5">
            <template v-for="(branch, index) in branches" :key="index">
              <BranchItem
                v-if="branch.checked"
                :branch="branch"
                @check="toggleBranchChecked(index, false)"
                class="transition-[opacity] duration-300 ease-in-out"
              ></BranchItem>
            </template>
          </transition-group>
        </div>
      </div>
      <div class="flex justify-between py-3.5 pl-6 pr-8">
        <VcButton kind="secondary" class="uppercase px-4" is-outline> Cancel </VcButton>
        <VcButton class="uppercase px-5 min-w-[9.25rem]"> ok </VcButton>
      </div>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BranchItem from "./branch-item.vue";
const showSelectedBranches = ref(false);
const branches = ref([
  {
    name: "Chicago Branch",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "Los Angeles Branch",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "New York Branch",
    address: "5400 N. Lakewood Avenue Chicago",
    checked: false,
  },
  {
    name: "Tennessee Branch",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "Atlanta Branch",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "LA Branch",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "Branch 2",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "Branch 3",
    address: "5400 N. Lakewood Avenue",
    checked: false,
  },
  {
    name: "Branch 4",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "Branch 5",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
  {
    name: "Branch 6",
    address: "5400 N. Lakewood Avenue Chicago, Illinois, USA 60640",
    checked: false,
  },
]);

function toggleBranchChecked(index: number, checked: boolean) {
  branches.value[index].checked = checked;
}

function clearSelection() {
  branches.value = branches.value.map((branch) => {
    branch.checked = false;
    return branch;
  });
}
</script>
<style lang="scss">
.branch-enter-from,
.branch-leave-to {
  opacity: 0;
}
</style>
