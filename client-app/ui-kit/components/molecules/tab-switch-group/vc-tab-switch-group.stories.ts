import { ref } from "vue";
import { VcTabSwitch, VcTabSwitchGroup } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COLOR_MODES = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "desktop-computer" },
];

type ColorModeType = (typeof COLOR_MODES)[number];
type ItemAttrsType = (mode: ColorModeType) => Record<string, string | boolean>;

const meta: Meta<typeof VcTabSwitchGroup> = {
  title: "Components/Molecules/VcTabSwitchGroup",
  component: VcTabSwitchGroup,
  args: {
    modelValue: "light",
  },
} as Meta<typeof VcTabSwitchGroup>;

export default meta;
type StoryType = StoryObj<typeof meta>;

// The group around one VcTabSwitch per colour mode; `itemAttrs` are that switch's extra attributes.
// "Show code" gets the same markup with the items written out.
function groupStory(itemAttrs: ItemAttrsType): StoryType {
  const items = COLOR_MODES.map((mode) => {
    const allAttrs: Record<string, string | boolean> = { value: mode.value, size: "sm", ...itemAttrs(mode) };
    const attrs = Object.entries(allAttrs)
      .filter(([, attrValue]) => attrValue !== false)
      .map(([attrName, attrValue]) => (attrValue === true ? attrName : `${attrName}="${attrValue}"`));

    return `  <VcTabSwitch ${attrs.join(" ")} />`;
  });

  return {
    render: (args) => ({
      components: { VcTabSwitch, VcTabSwitchGroup },
      setup: () => ({ modes: COLOR_MODES, itemAttrs, value: ref(args.modelValue) }),
      template: `
        <VcTabSwitchGroup v-model="value" aria-label="Color mode">
          <VcTabSwitch v-for="mode in modes" :key="mode.value" :value="mode.value" size="sm" v-bind="itemAttrs(mode)" />
        </VcTabSwitchGroup>
      `,
    }),
    parameters: {
      docs: {
        source: {
          code: `<VcTabSwitchGroup v-model="colorMode" aria-label="Color mode">\n${items.join("\n")}\n</VcTabSwitchGroup>`,
        },
      },
    },
  };
}

export const Basic = groupStory((mode) => ({ label: mode.label }));

export const WithIcons = groupStory((mode) => ({ label: mode.label, icon: mode.icon }));

export const IconsOnly = groupStory((mode) => ({ icon: mode.icon, "aria-label": mode.label }));

export const DisabledItem = groupStory((mode) => ({ label: mode.label, disabled: mode.value === "dark" }));

export const NoSelection: StoryType = {
  ...groupStory((mode) => ({ label: mode.label })),
  args: {
    modelValue: undefined,
  },
};
