import { ref } from "vue";
import { VcTabSwitch, VcTabSwitchGroup } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const VARIANTS = ["plain", "filled", "filled-strong", "seg"];

const meta: Meta<typeof VcTabSwitchGroup> = {
  title: "Components/Molecules/VcTabSwitchGroup",
  component: VcTabSwitchGroup,
  argTypes: {
    variant: {
      control: "inline-radio",
      options: VARIANTS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: VARIANTS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcTabSwitchGroup>;

export default meta;
type StoryType = StoryObj<typeof meta>;

const SORTING = ["Featured", "Relevance", "Price ↑", "Price ↓", "Newest"];

function sortingStory(args: Record<string, unknown>) {
  return {
    components: { VcTabSwitch, VcTabSwitchGroup },
    setup: () => ({ args, items: SORTING, selected: ref(SORTING[0]) }),
    template: `
      <VcTabSwitchGroup v-bind="args" aria-label="Sorting">
        <VcTabSwitch
          v-for="item in items"
          :key="item"
          v-model="selected"
          size="sm"
          name="sorting"
          :value="item"
          :label="item"
          @change="selected = $event"
        />
      </VcTabSwitchGroup>
    `,
  };
}

export const Segmented: StoryType = {
  args: { variant: "seg" },
  render: sortingStory,
};

export const Plain: StoryType = {
  args: { variant: "plain" },
  render: sortingStory,
};

export const Filled: StoryType = {
  args: { variant: "filled" },
  render: sortingStory,
};

export const FilledStrong: StoryType = {
  args: { variant: "filled-strong" },
  render: sortingStory,
};

export const SegmentedWithIcons: StoryType = {
  args: { variant: "seg" },
  render: (args) => ({
    components: { VcTabSwitch, VcTabSwitchGroup },
    setup: () => ({
      args,
      modes: [
        { value: "light", icon: "sun", label: "Light" },
        { value: "dark", icon: "moon", label: "Dark" },
        { value: "system", icon: "computer-desktop", label: "System" },
      ],
      selected: ref("light"),
    }),
    template: `
      <VcTabSwitchGroup v-bind="args" aria-label="Appearance">
        <VcTabSwitch
          v-for="mode in modes"
          :key="mode.value"
          v-model="selected"
          size="sm"
          name="appearance"
          :value="mode.value"
          :icon="mode.icon"
          :label="mode.label"
          @change="selected = $event"
        />
      </VcTabSwitchGroup>
    `,
  }),
};

export const SegmentedFill: StoryType = {
  args: { variant: "seg", fill: true },
  render: sortingStory,
};
