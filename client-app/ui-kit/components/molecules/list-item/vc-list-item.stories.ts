import { VcListItem } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcListItem> = {
  title: "Components/Molecules/VcListItem",
  component: VcListItem,
  argTypes: {
    title: {
      control: "text",
      description: "Item title displayed in bold",
    },
    description: {
      control: "text",
      description: "Item description displayed below the title",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<ul class="list-disc ps-5"><VcListItem v-bind="args" /></ul>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    title: "Item title",
    description: "Item description with additional details.",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <ul class="list-disc ps-5">
            <VcListItem title="Item title" description="Item description with additional details." />
          </ul>
        `,
      },
    },
  },
};

export const TitleOnly: StoryType = {
  args: {
    title: "Title without description",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <ul class="list-disc ps-5">
            <VcListItem title="Title without description" />
          </ul>
        `,
      },
    },
  },
};

export const WithSlots: StoryType = {
  render: (args) => ({
    setup: () => ({ args }),
    template: `<ul class="list-disc ps-5">
      <VcListItem v-bind="args">
        <template #title><span class="text-primary font-black">Custom title slot</span></template>
        <span class="text-neutral-600 text-sm">Custom default slot content</span>
      </VcListItem>
    </ul>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <ul class="list-disc ps-5">
            <VcListItem>
              <template #title><span class="text-primary font-black">Custom title slot</span></template>
              <span class="text-neutral-600 text-sm">Custom default slot content</span>
            </VcListItem>
          </ul>
        `,
      },
    },
  },
};

export const MultipleItems: StoryType = {
  render: () => ({
    template: `<ul class="list-disc ps-5 space-y-1">
      <VcListItem title="First item" description="Description for the first item." />
      <VcListItem title="Second item" description="Description for the second item." />
      <VcListItem title="Third item" description="Description for the third item." />
    </ul>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <ul class="list-disc ps-5">
            <VcListItem title="First item" description="Description for the first item." />
            <VcListItem title="Second item" description="Description for the second item." />
            <VcListItem title="Third item" description="Description for the third item." />
          </ul>
        `,
      },
    },
  },
};
