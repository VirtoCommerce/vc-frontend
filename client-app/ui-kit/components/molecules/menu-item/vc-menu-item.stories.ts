import { VcMenuItem } from "..";
import { VcIcon } from "../../atoms";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "lg"];
const COLORS = ["primary", "secondary", "success", "info", "neutral", "warning", "danger"];

export default {
  title: "Components/Molecules/VcMenuItem",
  component: VcMenuItem,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
    color: {
      control: "select",
      options: COLORS,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: COLORS.join(" | "),
        },
      },
    },
  },
} as Meta<typeof VcMenuItem>;

const Template: StoryFn = (args) => ({
  components: { VcMenuItem },
  setup: () => ({ args }),
  template: '<VcMenuItem v-bind="args">Menu Item text</VcMenuItem>',
});

export const Basic = Template.bind({});

export const Active = Template.bind({});
Active.args = {
  active: true,
};

export const Link = Template.bind({});
Link.args = {
  to: "/link",
};

export const ExternalLink = Template.bind({});
ExternalLink.args = {
  externalLink: "https://example.com",
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const Icon: StoryFn = (args) => ({
  components: { VcMenuItem, VcIcon },
  setup: () => ({ args }),
  template: `<VcMenuItem v-bind="args">
    <VcIcon name="cog" />
    <span>Menu item text</span>
  </VcMenuItem>`,
});

export const IconDisabled = Icon.bind({});
IconDisabled.args = {
  disabled: true,
};

export const Truncate: StoryFn = (args) => ({
  components: { VcMenuItem },
  setup: () => ({ args }),
  template: `<VcMenuItem v-bind="args" class="w-36">
    <span>Long long long Menu item text</span>
  </VcMenuItem>`,
});
Truncate.args = {
  truncate: true,
};

export const AllStates: StoryFn = () => ({
  components: { VcMenuItem },
  setup: () => ({ colors: COLORS, sizes: SIZES }),
  template: `<div class="space-y-8">
    <div v-for="size in sizes" class="space-y-3">
      <h2 class="text-lg font-bold">Size: {{ size }}</h2>

      <div class="flex flex-wrap gap-2 items-center">
        <VcMenuItem v-for="color in colors" :size="size" :color="color">
          Color: {{ color }}
        </VcMenuItem>
      </div>
    </div>
  </div>
  `,
});
