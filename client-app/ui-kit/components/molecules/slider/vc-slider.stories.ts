import { ref } from "vue";
import { VcSlider } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcSlider",
  component: VcSlider,
  argTypes: {},
} as Meta<typeof VcSlider>;

const similarWidthCol = [
  { count: 7, value: [400, 500], tooltip: "7 items from $400.00 to $500.00" },
  { count: 77, value: [501, 600], tooltip: "77 items from $500.00 to $600.00" },
  { count: 70, value: [601, 700], tooltip: "70 items from $600.00 to $700.00" },
  { count: 13, value: [701, 800], tooltip: "13 items from $700.00 to $800.00" },
  { count: 6, value: [801, 900], tooltip: "6 items from $800.00 to $900.00" },
  { count: 149, value: [901, 1000], tooltip: "149 items from $900.00 to $1000.00" },
  { count: 39, value: [1001, 1100], tooltip: "39 items from $1000.00 to $1200.00" },
];

const manyCols = [
  { count: 30, value: [null, 10], tooltip: "30 items to $10.00" },
  { count: 62, value: [10, 20], tooltip: "62 items from $10.00 to $20.00" },
  { count: 132, value: [21, 40], tooltip: "132 items from $20.00 to $40.00" },
  { count: 215, value: [41, 100], tooltip: "215 items from $40.00 to $100.00" },
  { count: 328, value: [101, 200], tooltip: "328 items from $100.00 to $200.00" },
  { count: 92, value: [201, 400], tooltip: "92 items from $200.00 to $400.00" },
  { count: 7, value: [401, 500], tooltip: "7 items from $400.00 to $500.00" },
  { count: 77, value: [501, 700], tooltip: "77 items from $500.00 to $700.00" },
  { count: 13, value: [701, 800], tooltip: "13 items from $700.00 to $800.00" },
  { count: 6, value: [801, 900], tooltip: "6 items from $800.00 to $900.00" },
  { count: 149, value: [901, 1000], tooltip: "149 items from $900.00 to $1000.00" },
  { count: 39, value: [1001, 1200], tooltip: "39 items from $1000.00 to $1200.00" },
  { count: 6, value: [1201, 1400], tooltip: "6 items from $1200.00 to $1400.00" },
  { count: 1, value: [1401, 1500], tooltip: "1 item from $1400.00 to $1500.00" },
  { count: 4, value: [1501, 1600], tooltip: "4 items from $1500.00 to $1600.00" },
  { count: 6, value: [1601, 1800], tooltip: "6 items from $1600.00 to $1800.00" },
  { count: 1, value: [1801, 1900], tooltip: "1 item from $1800.00 to $1900.00" },
  { count: 299, value: [1901, 2500], tooltip: "2 items from $2200.00 to $2500.00" },
  { count: 124, value: [2501, null], tooltip: "124 items from $2500" },
];

const Template: StoryFn = (args) => ({
  components: { VcSlider },
  setup: () => {
    const model = ref(args.value);
    return { args, model };
  },
  template: '<VcSlider v-bind="args" v-model="model" />',
});

export const Basic = Template.bind({});
Basic.args = {
  value: [160, 240],
  min: 120,
  max: 500,
};

export const Cols = Template.bind({});
Cols.args = {
  value: [500, 800],
  min: 100,
  max: 900,
  step: 10,
  cols: manyCols,
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  value: [400, 1100],
  step: 10,
  colsHeight: "5rem",
  cols: similarWidthCol,
  showTooltipOnColHover: true,
};

export const UpdateOnColumnClick = Template.bind({});
UpdateOnColumnClick.args = {
  value: [500, 800],
  step: 10,
  min: 400,
  max: 1100,
  cols: similarWidthCol,
  showTooltipOnColHover: true,
  updateOnColumnClick: true,
};

export const UpdateOnColumnClickManyDifferentColumns = Template.bind({});
UpdateOnColumnClickManyDifferentColumns.args = {
  value: [0, 500],
  step: 10,
  colsHeight: "5rem",
  cols: manyCols,
  showTooltipOnColHover: true,
  updateOnColumnClick: true,
  proportionalByPrice: true,
};

export const Range = Template.bind({});
Range.args = {
  value: [1600],
  min: 1300,
  max: 3250,
  step: 10,
};
