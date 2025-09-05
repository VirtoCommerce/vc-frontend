import { ref } from "vue";
import { VcSlider } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

export default {
  title: "Components/Molecules/VcSlider",
  component: VcSlider,
  argTypes: {},
} as Meta<typeof VcSlider>;

const similarWidthCol = [
  { count: 7, value: [400, 500] },
  { count: 77, value: [500, 600] },
  { count: 70, value: [600, 700] },
  { count: 13, value: [700, 800] },
  { count: 156, value: [800, 900] },
  { count: 39, value: [1000, 1100] },
];

const manyCols = [
  { count: 30, value: [null, 10] },
  { count: 62, value: [10, 20] },
  { count: 132, value: [20, 40] },
  { count: 215, value: [40, 100] },
  { count: 328, value: [100, 200] },
  { count: 92, value: [200, 400] },
  { count: 7, value: [400, 500] },
  { count: 77, value: [500, 700] },
  { count: 13, value: [700, 800] },
  { count: 6, value: [800, 900] },
  { count: 149, value: [900, 1000] },
  { count: 39, value: [1000, 1200] },
  { count: 6, value: [1200, 1400] },
  { count: 1, value: [1400, 1500] },
  { count: 4, value: [1500, 1600] },
  { count: 6, value: [1600, 1800] },
  { count: 1, value: [1800, 1900] },
  { count: 299, value: [1900, 2500] },
  { count: 124, value: [2500, null] },
];

const noStartEndCols = [
  { count: 30, value: [null, 100] },
  { count: 62, value: [100, 200] },
  { count: 132, value: [200, 400] },
  { count: 215, value: [400, 600] },
  { count: 328, value: [600, 800] },
  { count: 180, value: [1000, null] },
];

const Template: StoryFn = (args) => ({
  components: { VcSlider },
  setup: () => {
    const model = ref(args.value);
    const handleChange = (newValue: [number, number]) => {
      model.value = newValue;
    };

    return { args, model, handleChange };
  },
  template: '<VcSlider v-bind="args" :value="model" @change="handleChange" />',
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
  cols: manyCols,
};

export const WithTooltip = Template.bind({});
WithTooltip.args = {
  value: [400, 1100],
  min: 470,
  max: 1300,
  colsHeight: "5rem",
  cols: similarWidthCol,
  showTooltipOnColHover: true,
};

export const UpdateOnColumnClick = Template.bind({});
UpdateOnColumnClick.args = {
  value: [450, 800],
  min: 450,
  max: 1100,
  cols: similarWidthCol,
  showTooltipOnColHover: true,
  updateOnColumnClick: true,
};

export const UpdateOnColumnClickManyDifferentColumns = Template.bind({});
UpdateOnColumnClickManyDifferentColumns.args = {
  value: [0, 500],
  colsHeight: "5rem",
  cols: manyCols,
  min: 150,
  max: 3500,
  showTooltipOnColHover: true,
  updateOnColumnClick: true,
};

export const NoStartEndColumns = Template.bind({});
NoStartEndColumns.args = {
  value: [0, 500],
  colsHeight: "5rem",
  cols: noStartEndCols,
  min: 0,
  max: 1200,
  showTooltipOnColHover: true,
  updateOnColumnClick: true,
};
