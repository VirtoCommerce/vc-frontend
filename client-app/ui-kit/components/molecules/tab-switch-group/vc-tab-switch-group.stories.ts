import { ref } from "vue";
import { VcTabSwitch, VcTabSwitchGroup } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLOR_MODES = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "desktop-computer" },
];

// The group around one VcTabSwitch per colour mode; `attrs` are that switch's extra attributes.
function renderGroup(attrs: string) {
  return (args: Partial<{ modelValue: VcTabSwitchGroupValueType }>) => ({
    components: { VcTabSwitch, VcTabSwitchGroup },
    setup: () => ({ modes: COLOR_MODES, value: ref(args.modelValue) }),
    template: `
      <VcTabSwitchGroup v-model="value" aria-label="Color mode">
        <VcTabSwitch v-for="mode in modes" :key="mode.value" :value="mode.value" size="sm" ${attrs} />
      </VcTabSwitchGroup>
    `,
  });
}

const meta: Meta<typeof VcTabSwitchGroup> = {
  title: "Components/Molecules/VcTabSwitchGroup",
  component: VcTabSwitchGroup,
  args: {
    modelValue: "light",
  },
  render: renderGroup(`:label="mode.label"`),
} as Meta<typeof VcTabSwitchGroup>;

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {};

export const WithIcons: StoryType = {
  render: renderGroup(`:label="mode.label" :icon="mode.icon"`),
};

export const IconsOnly: StoryType = {
  render: renderGroup(`:icon="mode.icon" :aria-label="mode.label"`),
};

export const DisabledItem: StoryType = {
  render: renderGroup(`:label="mode.label" :disabled="mode.value === 'dark'"`),
};

export const NoSelection: StoryType = {
  args: {
    modelValue: undefined,
  },
};
