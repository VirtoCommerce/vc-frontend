<template>
  <VcContainer :loading="loading">
    <VcTypography tag="h1" class="mb-5">
      {{ fulfillmentCenter?.name }}
    </VcTypography>

    <VcLayout sidebar-position="right">
      <VcWidget size="lg">
        <div class="mb-2 font-bold">{{ $t("pages.branch.address") }}</div>

        <div class="break-words">
          {{ fulfillmentCenter?.address ? fulfillmentCenter?.address : "&ndash;" }}
        </div>

        <div>
          <span class="mr-1 font-bold">{{ $t("pages.branch.phone") }}</span>
          <a v-if="fulfillmentCenter?.phone" :href="`tel:${fulfillmentCenter?.phone}`" class="hover:underline">
            {{ fulfillmentCenter?.phone }}
          </a>
          <span v-else>&ndash;</span>
        </div>
      </VcWidget>

      <VcWidget v-if="fulfillmentCenter?.description" size="lg" class="mt-5">
        <VcMarkdownRender :src="fulfillmentCenter?.description" class="text-sm" />
      </VcWidget>

      <template #sidebar>
        <VcWidget :title="$t('pages.branch.other_branches')">
          <VcList>
            <VcListItem v-for="(branch, index) in otherBranches" :key="index">
              <router-link
                :to="`/branch/${branch.id}`"
                class="font-black text-[--link-color] hover:text-[--link-hover-color]"
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
            </VcListItem>
          </VcList>
        </VcWidget>
      </template>
    </VcLayout>
  </VcContainer>
</template>

<script setup lang="ts">
import { watch, computed, toRef } from "vue";
import { useFulfillmentCenters } from "@/shared/fulfillmentCenters";

interface IProps {
  branchId?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  branchId: "",
});

const branchId = toRef(props, "branchId");

const { loading, loadFulfillmentCenter, fulfillmentCenter, loadFulfillmentCenters, fulfillmentCenters } =
  useFulfillmentCenters();

const otherBranches = computed(() => fulfillmentCenters.value.filter((item) => item.id !== branchId.value));

void loadFulfillmentCenter(branchId.value);
void loadFulfillmentCenters();

watch(branchId, () => {
  void loadFulfillmentCenter(branchId.value);
});
</script>
