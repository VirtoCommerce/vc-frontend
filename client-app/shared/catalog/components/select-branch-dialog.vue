<template>
  <VcPopup :title="$t('pages.catalog.branches_dialog.title')" modal-width="max-w-5xl">
    <template #actions="{ close }">
      <div class="flex grow justify-between space-x-4">
        <VcButton class="uppercase flex-grow lg:flex-grow-0 lg:px-5" kind="secondary" is-outline @click="close">
          {{ $t("pages.catalog.branches_dialog.cancel_button") }}
        </VcButton>

        <VcButton class="uppercase flex-grow lg:flex-grow-0 lg:px-12" @click="close">{{
          $t("pages.catalog.branches_dialog.confirm_button")
        }}</VcButton>
      </div>
    </template>

    <div v-if="isMobile">
      <div class="bg-gray-100 flex items-stretch justify-between px-5 h-11 space-x-3">
        <div
          class="font-bold text-sm cursor-pointer relative overflow-visible flex items-center"
          :class="showSelectedBranches ? 'text-[color:var(--color-link)]' : 'active'"
        >
          <span>{{ $t("pages.catalog.branches_dialog.all_branches") }}</span>
        </div>
        <div class="flex items-center space-x-3" v-if="showSelectedBranches">
          <div class="font-bold text-sm cursor-pointer relative overflow-visible h-full active flex items-center">
            <span>{{ $t("pages.catalog.branches_dialog.selected_branches") }}</span>
          </div>
          <button class="rounded h-7 w-7 shadow-md bg-white">
            <svg width="16" height="16" class="text-primary mx-auto">
              <use href="/static/images/brush.svg#brush" />
            </svg>
          </button>
        </div>
      </div>
      <div class="bg-white px-5 py-3 flex items-center space-x-3 border-b">
        <VcInput
          name="branchSearch"
          type="search"
          class="grow"
          :placeholder="$t('pages.catalog.branches_dialog.search_placeholder')"
        />
        <button class="rounded h-11 w-11 bg-[color:var(--color-primary)]">
          <i class="fas fa-search text-white text-xl" />
        </button>
      </div>
      <div class="max-h-[445px] overflow-auto" v-if="!showSelectedBranches">
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
      </div>
      <div v-else>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
        <div class="flex items-center justify-between bg-white border p-4 space-x-6">
          <VcCheckbox class="!items-start" @change="showSelectedBranches = !showSelectedBranches">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              <div class="flex items-center space-x-2 mt-2">
                <i class="far fa-clock text-gray-400" />
                <div class="flex text-xs space-x-2">
                  <p class="flex items-center space-x-1">
                    <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                  </p>
                  <span> &bull; </span>
                  <p class="flex items-center space-x-1">
                    <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                    ><span class="font-light">Closed</span>
                  </p>
                </div>
              </div>
            </div>
          </VcCheckbox>
        </div>
      </div>
    </div>

    <div class="flex border-b" v-else>
      <div class="flex flex-col" :class="showSelectedBranches ? 'w-1/2 border-r' : 'grow'">
        <div class="bg-gray-100 flex items-center px-5 py-2 space-x-3">
          <span class="font-bold text-sm">{{ $t("pages.catalog.branches_dialog.all_branches") }}</span>
          <VcInput
            name="branchSearch"
            type="search"
            class="grow"
            :placeholder="$t('pages.catalog.branches_dialog.search_placeholder')"
            size="sm"
          />
          <button class="rounded h-7 w-7 shadow-md bg-white">
            <i class="fas fa-search text-[color:var(--color-primary)]" />
          </button>
        </div>
        <div class="max-h-[445px] overflow-auto">
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox @change="showSelectedBranches = !showSelectedBranches" :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between bg-white border p-4 shadow-sm hover:shadow-lg space-x-6">
            <VcCheckbox :class="showSelectedBranches && 'w-2/5'">
              <div class="flex flex-col">
                <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
                <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
              </div>
            </VcCheckbox>
            <div class="flex items-center space-x-2">
              <i class="far fa-clock text-gray-400" />
              <div class="flex flex-col text-xs">
                <p class="flex items-center space-x-1">
                  <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
                </p>
                <p class="flex items-center space-x-1">
                  <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                  ><span class="font-light">Closed</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showSelectedBranches" class="grow flex flex-col">
        <div class="bg-gray-100 flex items-center justify-between px-5 py-2 space-x-3 h-11">
          <span class="font-bold text-sm">{{ $t("pages.catalog.branches_dialog.selected_branches") }}</span>
          <div>
            <svg width="16" height="16" class="inline-block mr-2 text-[color:var(--color-primary)]">
              <use href="/static/images/brush.svg#brush" />
            </svg>
            <span class="font-bold text-sm text-[color:var(--color-link)] cursor-pointer">{{ $t("pages.catalog.branches_dialog.clear_selection") }}</span>
          </div>
        </div>
        <div class="flex items-center justify-between bg-white p-4 space-x-6">
          <VcCheckbox class="w-2/5">
            <div class="flex flex-col">
              <span class="text-[color:var(--color-link)] font-extrabold text-base">Chicago Branch</span>
              <span class="text-xs">5400 N. Lakewood Avenue Chicago, Illinois, USA 60640</span>
            </div>
          </VcCheckbox>
          <div class="flex items-center space-x-2">
            <i class="far fa-clock text-gray-400" />
            <div class="flex flex-col text-xs">
              <p class="flex items-center space-x-1">
                <span class="text-gray-700 font-bold">Mon-Fri:</span><span class="font-light">7:30 AM-5:00 PM</span>
              </p>
              <p class="flex items-center space-x-1">
                <span class="text-[color:var(--color-danger)] font-bold">Sat-Sun:</span
                ><span class="font-light">Closed</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VcPopup>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ref } from "vue";

defineEmits(["result"]);

const breakpoints = useBreakpoints(breakpointsTailwind);
const showSelectedBranches = ref(false);
const isMobile = breakpoints.smaller("md");
</script>
<style scoped lang="scss">
.active::after {
  content: "";

  position: absolute;
  right: calc(50% - 8px);
  bottom: 0;

  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}
</style>
