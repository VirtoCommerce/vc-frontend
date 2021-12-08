<template>
  <div class="bg-gray-100 pt-7 pb-16 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <Breadcrumbs :items="breadcrumbsItems"></Breadcrumbs>

      <div class="flex items-start lg:gap-6">
        <!-- Filters -->
        <div class="hidden lg:flex flex-col gap-5">
          <!-- Search results -->
          <FiltersBlock title="Filter results by">
            <p class="text-sm pb-2">Search within these results</p>
            <div class="flex gap-3">
              <input
                type="text"
                class="border rounded text-sm leading-8 flex-1 w-full border-gray-300 h-8 px-2 outline-none focus:border-gray-400"
              />
              <button
                class="rounded uppercase px-5 border-2 border-yellow-500 text-yellow-500 font-roboto-condensed font-bold text-sm"
              >
                Go
              </button>
            </div>
          </FiltersBlock>

          <!-- Previously purchased -->
          <FiltersBlock title="Previously purchased">
            <label class="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                class="form-tick appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm checked:bg-cyan-700 checked:border-transparent focus:outline-none cursor-pointer"
              />
              <span class="ml-2 font-medium">View previously purchased products</span>
            </label>
          </FiltersBlock>

          <!-- Branch availability -->
          <FiltersBlock title="Branch availability">
            <p class="text-sm font-medium">
              <span class="text-cyan-700 font-semibold cursor-pointer hover:text-cyan-900">Select a pickup branch</span>
              to see products in stock now.
            </p>
          </FiltersBlock>
        </div>

        <!-- Mobile filters -->
        <div v-if="mobileFiltersVisible" class="fixed inset-0 bg-gray-800 opacity-95 z-40 w-full h-screen"></div>
        <div
          v-if="mobileFiltersVisible"
          ref="mobileFiltersSidebar"
          class="fixed inset-0 bg-white w-72 z-50 h-screen px-5 pt-12"
        >
          <div class="flex flex-col gap-5">
            <!-- Search results -->
            <FiltersBlock title="Filter results by">
              <p class="text-sm pb-2">Search within these results</p>
              <div class="flex gap-3">
                <input type="text" class="border rounded text-sm flex-1 w-full border-gray-300 p-2.5" />
                <button
                  class="rounded uppercase px-3 border-2 border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                >
                  Go
                </button>
              </div>
            </FiltersBlock>

            <!-- Previously purchased -->
            <FiltersBlock title="Previously purchased">
              <label class="flex items-center text-sm">
                <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                <span class="ml-2">View previously purchased products</span>
              </label>
            </FiltersBlock>

            <!-- Branch availability -->
            <FiltersBlock title="Branch availability">
              <p class="text-sm">
                <span class="text-cyan-700">Select a pickup branch</span> to see products in stock now.
              </p>
            </FiltersBlock>
          </div>
        </div>

        <div class="flex-grow">
          <div class="flex flex-col">
            <h2 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">Desktops</h2>
            <p class="py-3">
              <span class="font-extrabold">12 results found.</span>
              <span class="font-normal"> 12 displayed that include 12 products</span>
            </p>
            <div class="flex items-end gap-4 mb-6 mt-4">
              <!-- View options -->
              <ViewMode v-model:mode="viewMode" class="hidden lg:inline-flex mr-6"></ViewMode>

              <!-- Page size -->
              <PageSize v-model:size="pageSize" class="hidden lg:flex"></PageSize>

              <!-- Mobile filters toggler -->
              <div class="lg:hidden">
                <button
                  type="button"
                  class="rounded bg-yellow-500 text-sm font-extrabold px-4 py-2 text-white"
                  @click="mobileFiltersVisible = true"
                >
                  <i class="fas fa-filter mr-1"></i>
                  Filters
                </button>
              </div>

              <!-- Sorting -->
              <div class="relative ml-auto flex-grow md:flex-grow-0">
                <select
                  class="w-full h-9 pl-3 pr-16 text-base placeholder-gray-600 border rounded appearance-none outline-none border-gray-300 focus:border-gray-400"
                  placeholder="Regular input"
                >
                  <option>Sort by features</option>
                  <option>Another option</option>
                  <option>And one more</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                      fill-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8">
            <ProductCard v-for="i in pageSize" :key="i"></ProductCard>
          </div>

          <!-- Pagination and options bottom block -->
          <div class="flex justify-center md:justify-between pt-11">
            <div>
              <Pagination v-model:page="pagination.page" :pages="pagination.pages"></Pagination>
            </div>
            <div class="flex">
              <!-- View options -->
              <ViewMode v-model:mode="viewMode" class="hidden md:inline-flex mr-6"></ViewMode>

              <!-- Page size -->
              <PageSize v-model:size="pageSize" class="hidden md:flex"></PageSize>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { onClickOutside } from "@vueuse/core";
import Breadcrumbs from "@/shared/catalog/components/breadcrumbs.vue";
import FiltersBlock from "@/shared/catalog/components/filters-block.vue";
import ViewMode from "@/shared/catalog/components/view-mode.vue";
import PageSize from "@/shared/catalog/components/page-size.vue";
import ProductCard from "@/shared/catalog/components/product-card.vue";
import Pagination from "@/shared/catalog/components/pagination.vue";

const mobileFiltersVisible = ref(false);
const mobileFiltersSidebar = ref(null);

onClickOutside(mobileFiltersSidebar, () => {
  mobileFiltersVisible.value = false;
});

const breadcrumbsItems = [
  { url: "/", title: "Home" },
  { url: "/desktops", title: "Desktops" },
];

const viewMode = ref("grid");
const pageSize = ref(16);
const pagination = reactive({
  page: 1,
  pages: 10,
});
</script>

<style scoped></style>
