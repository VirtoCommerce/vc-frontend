import FacetFilter from "./facet-filter.vue";
import type { Meta, StoryFn } from "@storybook/vue3";

const items = [
  { count: 9, label: "EPSON", value: "EPSON", selected: false },
  { count: 2, label: "HP", value: "HP", selected: false },
  { count: 2, label: "XEROX", value: "XEROX", selected: false },
];

const facet = {
  type: "terms",
  label: "Filter header",
  paramName: "BRAND",
  values: [] as unknown[],
};

function fillFacet(n: number) {
  return { ...facet, values: [...new Array(n)].map(addItems) };
}

function addItems(_: unknown, index: number) {
  const itemIdx = Math.floor(Math.random() * items.length);
  const item = items[itemIdx];
  return {
    count: item.count + index,
    label: item.label + index,
    selected: item.selected,
    value: item.value + index,
  } as typeof item;
}

const VARIANTS = [
  {
    title: "8 items",
    facet: fillFacet(8),
    withFooter: true,
  },
  {
    title: "9 items",
    facet: fillFacet(10),
    withFooter: true,
  },
  {
    title: "14 items",
    facet: fillFacet(14),
    withFooter: false,
  },
  {
    title: "20 items",
    facet: fillFacet(40),
    withFooter: true,
  },
];

export default {
  title: "FacetFilter",
  components: { FacetFilter },
} as Meta<FacetFilter>;

export const AllStates: StoryFn<typeof FacetFilter> = () => ({
  components: { FacetFilter },
  setup: () => ({ variants: VARIANTS }),
  template: `<div class="flex gap-2 place-items-baseline">
      <FacetFilter class="grow"
                   style="width: 33.3%"
                   v-for="(variant, id) in variants"
                   :key="id"
                   :with-footer="variant.withFooter"
                   is-collapsible :facet="variant.facet" />
  </div>`,
});
