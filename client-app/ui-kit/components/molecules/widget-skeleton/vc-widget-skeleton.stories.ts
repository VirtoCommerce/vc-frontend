import { VcWidgetSkeleton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];

const meta: Meta<typeof VcWidgetSkeleton> = {
  title: "Components/Molecules/VcWidgetSkeleton",
  component: VcWidgetSkeleton,
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
    template: '<VcWidgetSkeleton v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderSkeleton = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args }),
  template,
});

export const Basic: StoryType = {};

export const Head: StoryType = {
  args: {
    head: true,
  },
};

export const Foot: StoryType = {
  args: {
    foot: true,
  },
};

export const HeaderSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #header>
      <div class="w-full flex gap-4 items-center">
        <div class="flex-none h-8 w-8 rounded-full"></div>
        <div class="flex-none w-52"></div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
};

export const DefaultSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <div class="flex gap-4 mb-3">
      <div class="flex-none h-10 w-10 rounded-full"></div>

      <div class="grow">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div v-for="i in [1, 2, 3, 4, 5]"></div>
  </VcWidgetSkeleton>`),
};

export const FooterSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #footer>
      <div class="w-full flex gap-4 items-center">
        <div class="flex-none h-8 w-8 rounded-full"></div>
        <div class="flex-none w-52"></div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
};

export const HeaderContainerSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #header-container>
      <div class="flex divide-x">
        <div class="p-1">
          <div class="h-6 w-8"></div>
        </div>
        <div class="p-1">
          <div class="h-6 w-52"></div>
        </div>
        <div class="grow p-1">
          <div class="h-6"></div>
        </div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
};

export const DefaultContainerSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #default-container>
      <div class="p-1">
        <div class="h-52 w-full"></div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
};

export const FooterContainerSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #footer-container>
      <div class="flex divide-x">
        <div class="p-1">
          <div class="h-8 w-8"></div>
        </div>
        <div class="p-1">
          <div class="h-8 w-52"></div>
        </div>
        <div class="grow p-1">
          <div class="h-8 w-full"></div>
        </div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
};
