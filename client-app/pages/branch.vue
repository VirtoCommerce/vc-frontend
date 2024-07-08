<template>
  <VcContainer :class="{ 'pointer-events-none opacity-50': loading }">
    <VcTypography tag="h1">
      {{ fulfillmentCenter?.name }}
    </VcTypography>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <VcWidget>
        <template #default-container>
          <div class="p-5 text-base lg:px-8 lg:pb-5 lg:pt-6">
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

          <div v-if="fulfillmentCenter?.description">
            <div class="hidden h-[18px] bg-gradient-to-b from-[#94949421] lg:block"></div>

            <VcMarkdownRender class="px-6" :src="fulfillmentCenter?.description" />
          </div>
        </template>
      </VcWidget>

      <template #sidebar>
        <VcWidget :title="$t('pages.branch.other_branches')">
          <ul class="ms-3 list-disc space-y-7">
            <li v-for="(branch, index) in otherBranches" :key="index" class="text-primary marker:text-xl">
              <router-link
                :to="`/branch/${branch.id}`"
                class="mb-1 text-lg font-black text-[--link-color] hover:text-[--link-hover-color] lg:text-base"
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
        </VcWidget>
      </template>
    </VcLayoutWithRightSidebar>
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
    @apply table-fixed border-separate border-0 w-full mt-[1.375rem] text-base lg:mt-1.5;
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
