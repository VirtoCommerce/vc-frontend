import { VcWidget } from "..";
import type { Meta, StoryFn } from "@storybook/vue3";

const SIZES = ["xs", "sm", "md", "lg"];

export default {
  title: "Components/Molecules/VcWidget",
  component: VcWidget,
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
  },
} as Meta<typeof VcWidget>;

const Template: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: '<VcWidget v-bind="args">Widget text</VcWidget>',
});

export const Basic = Template.bind({});

export const NoShadow = Template.bind({});
NoShadow.args = {
  noShadow: true,
};

export const Header = Template.bind({});
Header.args = {
  title: "Widget title",
};

export const Icon = Template.bind({});
Icon.args = {
  title: "Widget title",
  prependIcon: "academic-cap",
};

export const Collapsible = Template.bind({});
Collapsible.args = {
  title: "Widget title",
  collapsible: true,
};

export const Footer: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    Widget text
    <template #footer>Footer text</template>
  </VcWidget>`,
});
Footer.args = {
  title: "Widget title",
  collapsible: true,
};

export const FooterContainer: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    <template #footer-container>
      <div class="flex divide-x">
        <div class="grow p-2 text-center">Text 1</div>
        <div class="grow p-2 text-center">Text 2</div>
        <div class="grow p-2 text-center">Text 3</div>
      </div>
    </template>
  </VcWidget>`,
});
FooterContainer.args = {
  title: "Widget title",
  collapsible: true,
};
