<template>
  <div>
    <VcLabel>
      {{ facet.label }}
    </VcLabel>

    <div class="mt-2 space-y-3.5">
      <template v-for="(facetValue, index) in facet.values" :key="index">
        <VcCheckbox v-model="facetValue.selected" @change="change">
          {{ facetValue.label }}
        </VcCheckbox>
      </template>
    </div>
  </div>
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
