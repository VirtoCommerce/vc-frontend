import { VcWidget } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];

const meta: Meta<typeof VcWidget> = {
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
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcWidget v-bind="args">Widget text</VcWidget>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderWidget = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args }),
  template,
});

export const Basic: StoryType = {};

export const NoShadow: StoryType = {
  args: {
    shadow: false,
  },
};

export const NoBorder: StoryType = {
  args: {
    border: false,
  },
};

export const Title: StoryType = {
  args: {
    title: "Widget title",
  },
};

export const PrependIcon: StoryType = {
  args: {
    title: "Widget title",
    prependIcon: "academic-cap",
  },
};

export const AppendIcon: StoryType = {
  args: {
    title: "Widget title",
    appendIcon: "check-circle",
  },
};

export const Collapsible: StoryType = {
  args: {
    title: "Widget title",
    collapsible: true,
  },
};

export const Collapsed: StoryType = {
  args: {
    title: "Widget title",
    collapsible: true,
    collapsed: true,
  },
};

export const CollapsibleCustomIcon: StoryType = {
  args: {
    title: "Widget title",
    collapsible: true,
  },
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #append="{ collapsed }">
      <VcIcon :name="collapsed ? 'arrow-down' : 'arrow-up'" />
    </template>
  </VcWidget>`),
};

export const PrependSlot: StoryType = {
  args: {
    title: "Widget title",
  },
  render: renderWidget(`<VcWidget v-bind="args">
    <template #prepend>
      <VcIcon class="fill-danger" name="cake" size="sm" />
    </template>

    Widget text
  </VcWidget>`),
};

export const AppendSlot: StoryType = {
  args: {
    title: "Widget title",
  },
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #append>
      <span class="flex items-center gap-1">
        <a class="text-accent-600 text-sm underline" href="#">Link</a>
        <VcIcon class="fill-accent-600" name="arrow-right" size="xs" />
      </span>
    </template>
  </VcWidget>`),
};

export const HeaderSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    <template #header>Header text</template>

    Widget text
  </VcWidget>`),
};

export const HeaderContainerSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    <template #header-container>
      <div class="p-4 bg-info text-additional-50">
        Header Container
      </div>
    </template>

    Widget text
  </VcWidget>`),
};

export const DefaultContainerSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    <template #default-container>
      <div class="py-1 px-3 bg-neutral-100">
        Default Container
      </div>
      <div class="flex border-t divide-x" v-for="item in [1, 2, 3]">
        <div class="py-1 px-3">{{ item }}</div>
        <div class="grow py-1 px-3">Text</div>
        <div class="grow-[2] py-1 px-3">Text</div>
      </div>
    </template>
  </VcWidget>`),
};

export const FooterSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #footer>Footer text</template>
  </VcWidget>`),
};

export const FooterContainerSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #footer-container>
      <div class="flex divide-x">
        <div class="grow p-2 text-center rounded-bl bg-danger-100">Text 1</div>
        <div class="grow p-2 text-center bg-warning-100">Text 2</div>
        <div class="grow p-2 text-center rounded-br bg-success-100">Text 3</div>
      </div>
    </template>
  </VcWidget>`),
};
