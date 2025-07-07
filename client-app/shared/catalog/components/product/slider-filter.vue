<template>
  <VcWidget
    v-if="mode === 'collapsable'"
    class="facet-filter-widget"
    size="xs"
    collapsible
    :title="facet.label"
    collapsed
    ><div class="mb-2 mt-8 px-3">
      <VcSlider
        :value="sliderValue"
        :min="facetMin"
        :max="facetMax"
        :cols="sliderCols"
        @change="handleSliderChange"
      /></div
  ></VcWidget>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { useRouteQueryParam } from "@/core/composables";
import { QueryParamName } from "@/core/enums";
import type { FacetItemType } from "@/core/types";
import type { ColType, RangeType } from "@/ui-kit/components/molecules/slider/vc-slider.vue";

interface IProps {
  facet: Readonly<FacetItemType>;
  queryKey: string;
  mode: "dropdown" | "collapsable";
}

interface IEmits {
  (event: "update:range", value: RangeType): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { facet } = toRefs(props);

const facetsParam = useRouteQueryParam<string>(QueryParamName.Facets);

// todo get from back
const facetMin = 0;

const facetMax = 99999;

const sliderValue = computed<RangeType>(() => {
  const ranges = extractPriceFacets(facetsParam.value, props.queryKey);

  if (ranges.length) {
    const from = ranges.at(0)?.from;
    const to = ranges.at(-1)?.to;
    return [typeof from === "number" ? from : facetMin, typeof to === "number" ? to : facetMax];
  }
  // todo check predefined facets

  return [facetMin, facetMax];
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
  emit("update:range", value);
}

function extractPriceFacets(url: string, queryKey: string): { from: number | null; to: number | null }[] {
  if (!url && !queryKey) {
    return [];
  }
  // const result: { from: number | null; to: number | null }[] = [];

  // const facetString = extractFacetBlock(url, queryKey);

  // console.log(facetString);

  return [{ from: 10, to: 100 }];
}

/*function extractFacetBlock(input: string, queryKey: string): string | null {
  const decoded = decodeURIComponent(input);

  const pattern = new RegExp(`"${queryKey}":(\\[[^\\]]+?(?:\\)\\]|\\))?)`, 'i');
  const match = decoded.match(pattern);

  return match ? match[1] : null;
}*/
</script>

<style scoped lang="scss"></style>
