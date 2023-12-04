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

export const Title = Template.bind({});
Title.args = {
  title: "Widget title",
};

export const PrependIcon = Template.bind({});
PrependIcon.args = {
  title: "Widget title",
  prependIcon: "academic-cap",
};

export const AppendIcon = Template.bind({});
AppendIcon.args = {
  title: "Widget title",
  appendIcon: "check-circle",
};

export const Collapsible = Template.bind({});
Collapsible.args = {
  title: "Widget title",
  collapsible: true,
};

export const Collapsed = Template.bind({});
Collapsed.args = {
  title: "Widget title",
  collapsible: true,
  collapsed: true,
};

export const CollapsibleCustomIcon: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    Widget text

    <template #append="{ collapsed }">
      <VcIcon :name="collapsed ? 'arrow-down' : 'arrow-up'" />
    </template>
  </VcWidget>`,
});
CollapsibleCustomIcon.args = {
  title: "Widget title",
  collapsible: true,
};

export const PrependSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    <template #prepend>
      <VcIcon class="text-[--color-danger-500]" name="cake" size="sm" />
    </template>

    Widget text
  </VcWidget>`,
});
PrependSlot.args = {
  title: "Widget title",
};

export const AppendSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    Widget text

    <template #append>
      <span class="flex items-center gap-1">
        <a class="text-[--color-accent-600] text-sm underline" href="#">Link</a>
        <VcIcon class="text-[--color-accent-600]" name="arrow-right" size="xs" />
      </span>
    </template>
  </VcWidget>`,
});
AppendSlot.args = {
  title: "Widget title",
};

export const HeaderSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    <template #header>Header text</template>

    Widget text
  </VcWidget>`,
});

export const HeaderContainerSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    <template #header-container>
      <div class="p-4 bg-[--color-info-500] text-[--color-additional-50]">
        Header Container
      </div>
    </template>

    Widget text
  </VcWidget>`,
});

export const DefaultContainerSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    <template #default-container>
      <div class="py-1 px-3 bg-[--color-neutral-100]">
        Default Container
      </div>
      <div class="flex border-t divide-x" v-for="item in [1, 2, 3]">
        <div class="py-1 px-3">{{ item }}</div>
        <div class="grow py-1 px-3">Text</div>
        <div class="grow-[2] py-1 px-3">Text</div>
      </div>
    </template>
  </VcWidget>`,
});

export const FooterSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    Widget text

    <template #footer>Footer text</template>
  </VcWidget>`,
});

export const FooterContainerSlot: StoryFn<typeof VcWidget> = (args) => ({
  components: { VcWidget },
  setup: () => ({ args }),
  template: `<VcWidget v-bind="args">
    Widget text

    <template #footer-container>
      <div class="flex divide-x">
        <div class="grow p-2 text-center rounded-bl bg-[--color-danger-100]">Text 1</div>
        <div class="grow p-2 text-center bg-[--color-warning-100]">Text 2</div>
        <div class="grow p-2 text-center rounded-br bg-[--color-success-100]">Text 3</div>
      </div>
    </template>
  </VcWidget>`,
});
