<template>
  <VcContainer :class="{ 'pointer-events-none opacity-50': loading }">
    <VcTypography tag="h1">
      {{ fulfillmentCenter?.name }}
    </VcTypography>

    <div class="mt-4 lg:mt-6 lg:flex lg:items-start">
      <div class="lg:drop-shadow-md-x lg:grow lg:rounded lg:border lg:bg-additional-50">
        <div
          class="rounded border bg-additional-50 p-5 text-base shadow-md lg:rounded-none lg:border-0 lg:bg-transparent lg:px-8 lg:pb-5 lg:pt-6 lg:shadow-none"
        >
          <div class="mb-1 mt-0.5 lg:mb-0.5">
            <div class="mb-1 mr-1 font-bold lg:mb-2">{{ $t("pages.branch.address") }}</div>
            <div class="break-words">
              {{ fulfillmentCenter?.address ? fulfillmentCenter?.address : "&ndash;" }}
            </div>
          </div>

          <div class="mb-1 flex flex-wrap">
            <div class="mr-1 font-bold">{{ $t("pages.branch.phone") }}</div>
            <a v-if="fulfillmentCenter?.phone" :href="`tel:${fulfillmentCenter?.phone}`" class="hover:underline">
              {{ fulfillmentCenter?.phone }}
            </a>
            <div v-else>&ndash;</div>
          </div>
        </div>

        <div
          v-if="fulfillmentCenter?.description"
          class="mt-6 rounded border bg-additional-50 text-base shadow-md lg:mt-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none"
        >
          <div class="hidden h-5 bg-gradient-to-b from-neutral/25 lg:block"></div>

          <div id="description" v-html-safe="fulfillmentCenter?.description" class="break-words"></div>
        </div>
      </div>

      <div
        class="mt-6 rounded border bg-additional-50 text-base shadow-md lg:ml-8 lg:mt-0 lg:w-[21.125rem] lg:shrink-0"
      >
        <div class="border-b px-6 py-4">
          <h2 class="text-xl font-black uppercase">{{ $t("pages.branch.other_branches") }}</h2>
        </div>
        <div class="px-11 pb-7 pt-5 lg:px-12 lg:pb-9 lg:pt-3.5">
          <!-- TODO: Replace with VcList -->
          <ul class="list-disc space-y-7">
            <li v-for="(branch, index) in otherBranches" :key="index" class="text-primary marker:text-xl">
              <router-link
                :to="`/branch/${branch.id}`"
                class="mb-1 text-[1.063rem] font-black text-[--link-color] hover:text-[--link-hover-color] lg:text-base"
              >
                {{ branch.name }}
              </router-link>
              <div v-if="branch.address" class="break-words text-sm text-neutral-900">
                {{ branch.address }}
              </div>
              <div class="text-sm text-neutral-900">
                <b>{{ $t("pages.branch.phone") }}</b>
                <a v-if="branch.phone" :href="`tel:${branch.phone}`" class="hover:underline">{{ branch.phone }}</a>
                <span v-else>&ndash;</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </VcContainer>
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
  },
);
</script>

<style lang="scss">
#description {
  @apply pb-6 px-6 border-b lg:pb-9 lg:px-8 lg:border-b-0;

  h2,
  h3 {
    @apply -mx-6 px-6 py-4 uppercase text-xl font-black border-b lg:mx-0 lg:px-0 lg:border-b-0;
  }

  table {
    @apply table-fixed border-separate border-0 w-full mt-5 text-base lg:mt-1.5;
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
    @apply even:bg-neutral-50;

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
    @apply px-3.5 py-3.5 lg:px-5 lg:py-4 border-b;

    &:first-child {
      @apply border-l;
    }

    &:last-child {
      @apply border-r;
    }
  }
}
</style>
