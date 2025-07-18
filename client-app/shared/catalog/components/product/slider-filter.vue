<template>
  <VcWidget
    v-if="mode === 'collapsable'"
    class="facet-filter-widget"
    size="xs"
    collapsible
    :title="facet.label"
    collapsed
    ><div>
      <VcSlider
        :value="sliderValue"
        :min="facetMin"
        :max="facetMax"
        :cols="sliderCols"
        show-tooltip-on-col-hover
        cols-height="36px"
        @change="handleSliderChange"
      /></div
  ></VcWidget>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import type { FacetItemType, FacetValueItemType } from "@/core/types";
import type { ColType } from "@/ui-kit/components/molecules/slider/vc-slider.vue";

interface IProps {
  facet: Readonly<FacetItemType>;
  queryKey: string;
  mode: "dropdown" | "collapsable";
}

interface IEmits {
  (event: "update:range", value: [number, number]): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { facet } = toRefs(props);

const facetsParam = useRouteQueryParam<string>(QueryParamName.Facets);


// todo get from back
const facetMin = computed(() => {
  return getMinFromFacet(facet.value.values.at(0)) || 0
});

const facetMax = computed(() => {
  return getMaxFromFacet(facet.value.values.at(-1)) || 999999
});

const sliderValue = computed(() => {
  return (parsePriceRange(facetsParam.value) || [facetMin.value, facetMax.value]) as [number, number];
});

const sliderCols = computed<ColType[]>(() => {
  return facet.value.values
    .filter((item) => item.count !== undefined && item.from !== undefined && item.to !== undefined)
    .map((item) => {
      return {
        count: item.count!,
        value: [item.from!, item.to!] as [number, number],
      };
    });
});

function handleSliderChange(value: [number, number] | [number]) {
  emit("update:range", value.length === 2 ? value : [value[0], value[0]]);
}

function parsePriceRange(str: string) {
  const match = RegExp(/"price":\[(\d+)\s+TO\s+(\d+)]/).exec(str)

  if (!match) return null

  const [, from, to] = match
  return [parseInt(from, 10), parseInt(to, 10)]
}

function getMinFromFacet(_facet?: FacetValueItemType) {
  return _facet?.from || 0
}

function getMaxFromFacet(_facet?: FacetValueItemType) {
  return typeof _facet?.to === 'number' ? _facet.to : _facet?.from
}
</script>
