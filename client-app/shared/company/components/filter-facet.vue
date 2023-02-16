<template>
  <dl>
    <dt class="text-17 text-[#92897C] font-bold leading-5 mb-1.5">
      {{ facet.label }}
    </dt>

    <dd v-for="(facetValue, index) in facet.values" :key="index">
      <VcCheckbox v-model="facetValue.selected" class="py-2" @change="change">
        <span :class="{ 'text-gray-500': !facetValue.selected }" class="leading-5 font-medium whitespace-nowrap">
          {{ facetValue.label }}
        </span>
      </VcCheckbox>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from "vue";
import _ from "lodash";
import { FacetItem } from "@/core/types";

const emit = defineEmits<{
  (event: "update:modelValue", value: FacetItem): void;
}>();

const props = defineProps({
  modelValue: {
    type: Object as PropType<FacetItem>,
    required: true,
  },
});

const facet = ref<FacetItem>(_.cloneDeep(props.modelValue));

function change() {
  emit("update:modelValue", facet.value);
}

watch(
  () => props.modelValue,
  (value) => (facet.value = _.cloneDeep(value))
);
</script>
