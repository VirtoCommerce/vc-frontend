<template>
  <div
    class="flex-grow px-7 pt-5 pb-7 bg-[color:var(--color-body-bg)] shadow-inner xl:px-19 lg:pt-5 lg:pb-11 transition"
    :class="{ 'opacity-50 pointer-events-none': loading }"
  >
    <h1 class="-ml-0.5 text-28 uppercase font-bold lg:text-34">{{ fulfillmentCenter?.name }}</h1>

    <div class="mt-4 lg:flex lg:items-start lg:mt-6">
      <div class="lg:flex-grow lg:rounded lg:border lg:drop-shadow-md-x lg:bg-white">
        <div
          class="py-5 px-[1.4rem] rounded border bg-white text-base drop-shadow-md-x lg:bg-transparent lg:drop-shadow-none lg:px-8 lg:pt-6 lg:pb-5 lg:rounded-none lg:border-0"
        >
          <div class="mt-0.5 mb-1 lg:mb-0.5">
            <div class="mb-1 mr-1 font-bold lg:mb-2">{{ $t("pages.branch.address") }}</div>
            <div class="break-words">
              {{ fulfillmentCenter?.address ? fulfillmentCenter?.address : "&ndash;" }}
            </div>
          </div>

          <div class="flex flex-wrap mb-1">
            <div class="mr-1 font-bold">{{ $t("pages.branch.phone") }}</div>
            <a v-if="fulfillmentCenter?.phone" :href="`tel:${fulfillmentCenter?.phone}`" class="hover:underline">
              {{ fulfillmentCenter?.phone }}
            </a>
            <div v-else>&ndash;</div>
          </div>
        </div>

        <div
          v-if="fulfillmentCenter?.description"
          class="mt-6 rounded border bg-white text-base drop-shadow-md-x lg:bg-transparent lg:drop-shadow-none lg:mt-0 lg:border-0 lg:rounded-none"
        >
          <div class="hidden h-[18px] bg-gradient-to-b from-[#94949421] lg:block"></div>

          <div id="description" class="break-words" v-html="fulfillmentCenter?.description"></div>
        </div>
      </div>

      <div class="mt-6 rounded border bg-white text-base drop-shadow-md-x lg:mt-0 lg:ml-8 lg:shrink-0 lg:w-[21.125rem]">
        <div class="py-4 px-6 border-b lg:pt-5 lg:pb-4">
          <h2 class="uppercase text-19 font-extrabold lg:text-21">{{ $t("pages.branch.other_branches") }}</h2>
        </div>
        <div class="pt-5 pb-7 px-11 lg:pt-3.5 lg:px-12 lg:pb-9">
          <ul class="list-disc space-y-7">
            <li v-for="(branch, index) in otherBranches" :key="index" class="text-primary marker:text-xl">
              <router-link
                :to="`/branch/${branch.id}`"
                class="mb-1 text-link text-[1.063rem] font-extrabold lg:text-base"
              >
                {{ branch.name }}
              </router-link>
              <div v-if="branch.address" class="text-[color:var(--color-body-text)] text-sm break-words">
                {{ branch.address }}
              </div>
              <div class="text-[color:var(--color-body-text)] text-sm">
                <b>{{ $t("pages.branch.phone") }}</b>
                <a v-if="branch.phone" :href="`tel:${branch.phone}`" class="hover:underline">{{ branch.phone }}</a>
                <span v-else>&ndash;</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from "vue";
import { useFulfillmentCenters } from "@/shared/fulfillmentCenters";

const props = defineProps({
  branchId: {
    type: String,
    default: "",
  },
});

const { loading, loadFulfillmentCenter, fulfillmentCenter, loadFulfillmentCenters, fulfillmentCenters } =
  useFulfillmentCenters();

const otherBranches = computed(() => fulfillmentCenters.value.filter((item) => item.id !== props.branchId));
loadFulfillmentCenter(props.branchId);
loadFulfillmentCenters();

watch(
  () => props.branchId,
  () => {
    loadFulfillmentCenter(props.branchId);
  }
);
</script>

<style lang="scss">
#description {
  @apply pb-6 px-6 border-b lg:pb-9 lg:px-8 lg:border-b-0;

  h2,
  h3 {
    @apply -mx-6 px-6 py-4 uppercase text-19 font-extrabold border-b lg:mx-0 lg:px-0 lg:text-21 lg:border-b-0;
  }

  table {
    @apply table-fixed border-separate border-0 w-full mt-[1.375rem] text-15 font-medium lg:mt-1.5;
    border-spacing: 0px 0px;
  }

  th {
    @apply px-3.5 py-2.5 border-b border-t text-left lg:px-5 lg:pt-3;

    &:first-child {
      @apply w-5/12 lg:w-52 border-l rounded-tl;
    }

    &:last-child {
      @apply border-r rounded-tr;
    }
  }

  tr {
    @apply even:bg-[#FAFAFA];

    &:last-child {
      td {
        &:first-child {
          @apply rounded-bl;
        }
        &:last-child {
          @apply rounded-br;
        }
      }
    }
  }

  td {
    @apply px-3.5 py-3.5 lg:px-5 lg:py-[1.035rem] border-b;

    &:first-child {
      @apply border-l;
    }

    &:last-child {
      @apply border-r;
    }
  }
}
</style>
