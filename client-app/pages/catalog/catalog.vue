<template>
  <div class="bg-gray-100 py-7 shadow-inner">
    <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
      <!-- Breadcrumbs -->
      <nav class="pb-2 md:pb-8">
        <ol class="flex">
          <li>
            <router-link to="/" class="text-cyan-700">Home</router-link>
          </li>
          <li><span class="mx-2 text-gray-300">/</span></li>
          <li class="text-gray-500">Desktops</li>
        </ol>
      </nav>

      <div class="flex items-start gap-6">
        <!-- Filters -->
        <div class="hidden md:flex flex-col gap-5">
          <!-- Search results -->
          <div class="bg-white rounded border shadow-sm">
            <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">Filter results by</div>
            <div class="p-4">
              <p class="text-sm pb-2">Search within these results</p>
              <div class="flex gap-3">
                <input type="text" class="border rounded text-sm flex-1 w-full border-gray-300 p-2.5" />
                <button
                  class="rounded uppercase px-3 border-2 border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
          <!-- Previously purchased -->
          <div class="bg-white rounded border shadow-sm">
            <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">Previously purchased</div>
            <div class="p-4">
              <label class="flex items-center text-sm">
                <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                <span class="ml-2">View previously purchased products</span>
              </label>
            </div>
          </div>
          <!-- Branch availability -->
          <div class="bg-white rounded border shadow-sm">
            <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">Branch availability</div>
            <div class="p-4">
              <p class="text-sm">
                <span class="text-cyan-700">Select a pickup branch</span> to see products in stock now.
              </p>
            </div>
          </div>
        </div>

        <!-- Mobile filters -->
        <div class="fixed inset-0 bg-gray-800 opacity-95 z-40 w-full h-screen" v-if="mobileFiltersVisible"></div>
        <div
          class="fixed inset-0 bg-white w-72 z-50 h-screen px-5 pt-12"
          ref="mobileFiltersSidebar"
          v-if="mobileFiltersVisible"
        >
          <div class="flex flex-col gap-5">
            <!-- Search results -->
            <div class="bg-white rounded border shadow-sm">
              <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">Filter results by</div>
              <div class="p-4">
                <p class="text-sm pb-2">Search within these results</p>
                <div class="flex gap-3">
                  <input type="text" class="border rounded text-sm flex-1 w-full border-gray-300 p-2.5" />
                  <button
                    class="rounded uppercase px-3 border-2 border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
            <!-- Previously purchased -->
            <div class="bg-white rounded border shadow-sm">
              <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">Previously purchased</div>
              <div class="p-4">
                <label class="flex items-center text-sm">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">View previously purchased products</span>
                </label>
              </div>
            </div>
            <!-- Branch availability -->
            <div class="bg-white rounded border shadow-sm">
              <div class="px-4 py-2 border-b uppercase font-extrabold text-sm">Branch availability</div>
              <div class="p-4">
                <p class="text-sm">
                  <span class="text-cyan-700">Select a pickup branch</span> to see products in stock now.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex flex-col">
            <h2 class="text-gray-800 text-2xl lg:text-3xl font-bold uppercase">Desktops</h2>
            <p class="py-3">
              <span class="font-extrabold">12 results found.</span>
              <span class="font-normal"> 12 displayed that include 12 products</span>
            </p>
            <div class="flex items-end gap-4 mb-6">
              <!-- View options -->
              <div class="hidden md:inline-flex mr-6" role="group">
                <button type="button" class="rounded bg-yellow-500 text-sm font-extrabold px-4 py-2 text-white">
                  <i class="fas fa-th mr-1"></i>
                  Grid
                </button>
                <button type="button" class="rounded bg-transparent text-sm font-extrabold px-4 py-2">
                  <i class="fas fa-list mr-1"></i>
                  List
                </button>
              </div>

              <!-- Page size -->
              <div class="hidden md:flex items-center justify-center">
                <span class="pr-2">Results per page:</span>
                <button
                  class="text-white bg-yellow-500 font-extrabold uppercase text-sm px-4 h-9 rounded-l"
                  type="button"
                >
                  16
                </button>
                <button
                  class="bg-white border border-solid border-gray-300 font-semibold uppercase text-sm px-4 h-9"
                  type="button"
                >
                  32
                </button>
                <button
                  class="bg-white border-t border-b border-r border-gray-300 font-semibold uppercase text-sm px-4 h-9 rounded-r"
                  type="button"
                >
                  48
                </button>
              </div>

              <!-- Mobile filters toggler -->
              <div class="md:hidden">
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
                  class="w-full h-9 pl-3 pr-40 text-base placeholder-gray-600 border rounded appearance-none focus:shadow-outline"
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

          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8">
            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc2.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->

            <!-- product - start -->
            <div class="bg-white rounded p-4 shadow-md">
              <a href="#" class="flex flex-col justify-center items-center border border-gray-100">
                <img
                  src="/assets/static/images/test-pc.png"
                  alt="Test PC"
                  class="w-full h-full object-cover object-center"
                />
              </a>
              <div class="flex flex-col pt-4">
                <label class="hidden md:inline-flex items-center text-sm pb-3">
                  <input type="checkbox" class="appearance-none w-4 h-4 border-2 border-gray-300 rounded-sm" />
                  <span class="ml-2">Compare</span>
                </label>
                <router-link to="/" class="text-cyan-700 font-extrabold text-sm pb-3"
                  >Techpower Cortex ET-2550</router-link
                >
                <div class="hidden md:flex gap-6 text-sm pb-2">
                  <div class="flex flex-col">
                    <span>Item #</span>
                    <span>Mfr. model #</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-cyan-700">4498896</span>
                    <span class="text-cyan-700">33-4994</span>
                  </div>
                </div>
                <div class="flex flex-col md:flex-row md:gap-10 text-sm pb-3">
                  <span>Your price</span>
                  <p><span class="text-green-900 font-extrabold">$1899.00</span> / each</p>
                </div>
                <div class="flex">
                  <input type="text" class="border rounded-l border-r-0 flex-1 w-full text-sm border-gray-300 p-2.5" />
                  <button
                    class="rounded-r uppercase px-3 border border-yellow-500 text-yellow-500 text-roboto font-bold text-sm"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
            <!-- product - end -->
          </div>

          <!-- Pagination and options bottom block -->
          <div class="flex justify-center md:justify-end pt-11">
            <!-- View options -->
            <div class="hidden md:inline-flex mr-6" role="group">
              <button type="button" class="rounded bg-yellow-500 text-sm font-extrabold px-4 py-2 text-white">
                <i class="fas fa-th mr-1"></i>
                Grid
              </button>
              <button type="button" class="rounded bg-transparent text-sm font-extrabold px-4 py-2">
                <i class="fas fa-list mr-1"></i>
                List
              </button>
            </div>

            <!-- Page size -->
            <div class="hidden md:flex items-center justify-center">
              <span class="pr-2">Results per page:</span>
              <button
                class="text-white bg-yellow-500 font-extrabold uppercase text-sm px-4 h-9 rounded-l"
                type="button"
              >
                16
              </button>
              <button
                class="bg-white border border-solid border-gray-300 font-semibold uppercase text-sm px-4 h-9"
                type="button"
              >
                32
              </button>
              <button
                class="bg-white border-t border-b border-r border-gray-300 font-semibold uppercase text-sm px-4 h-9 rounded-r"
                type="button"
              >
                48
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";

const mobileFiltersVisible = ref(false);
const mobileFiltersSidebar = ref(null);

onClickOutside(mobileFiltersSidebar, () => {
  mobileFiltersVisible.value = false;
});
</script>

<style scoped></style>
