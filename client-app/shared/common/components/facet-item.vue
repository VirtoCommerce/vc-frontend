<template>
  <dl>
    <dt class="mb-1.5 text-lg font-bold leading-5 text-neutral">
      {{ facet.label }}
    </dt>

    <dd v-for="(facetValue, index) in facet.values" :key="index">
      <VcCheckbox v-model="facetValue.selected" class="py-2" @change="change">
        <span :class="{ 'text-neutral': !facetValue.selected }" class="whitespace-nowrap leading-5">
          {{ facetValue.label }}
        </span>
      </VcCheckbox>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import { cloneDeep } from "lodash";
import { ref, toRef, watch } from "vue";
import type { FacetItemType } from "@/core/types";

const emit = defineEmits<{
  (event: "update:modelValue", value: FacetItemType): void;
}>();

const props = defineProps<IProps>();

interface IProps {
  modelValue: FacetItemType;
}

const modelValue = toRef(props, "modelValue");
const facet = ref<FacetItemType>(cloneDeep(modelValue.value));

function change() {
  emit("update:modelValue", facet.value);
}

watch(modelValue, (value) => (facet.value = cloneDeep(value)));
</script>
