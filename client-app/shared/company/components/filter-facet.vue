<template>
  <dl>
    <dt class="mb-1.5 text-17 font-bold leading-5 text-[#92897C]">
      {{ facet.label }}
    </dt>

    <dd v-for="(facetValue, index) in facet.values" :key="index">
      <VcCheckbox v-model="facetValue.selected" class="py-2" @change="change">
        <span :class="{ 'text-gray-500': !facetValue.selected }" class="whitespace-nowrap font-medium leading-5">
          {{ facetValue.label }}
        </span>
      </VcCheckbox>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import _ from "lodash";
import { ref, watch } from "vue";
import type { FacetItemType } from "@/core/types";
import type { PropType } from "vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: FacetItemType): void;
}>();

const props = defineProps({
  modelValue: {
    type: Object as PropType<FacetItemType>,
    required: true,
  },
});

const facet = ref<FacetItemType>(_.cloneDeep(props.modelValue));

function change() {
  emit("update:modelValue", facet.value);
}

watch(
  () => props.modelValue,
  (value) => (facet.value = _.cloneDeep(value)),
);
</script>
