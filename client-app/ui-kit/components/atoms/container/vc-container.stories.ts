import { VcContainer } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcContainer> = {
  title: "Components/Atoms/VcContainer",
  component: VcContainer,
  argTypes: {
    loading: {
      control: "boolean",
      description: "Applies reduced opacity and disables pointer events",
    },
    maxWidth: {
      control: "text",
      description: "Maximum width of the inner content wrapper",
    },
    bgColor: {
      control: "color",
      description: "Background color (overrides CSS variable)",
    },
    hasBgImage: {
      control: "boolean",
      description: "Whether to display the decorative background SVG image",
    },
    noPadding: {
      control: "boolean",
      description: "Removes all padding from the container",
    },
  },
  args: {
    loading: false,
    hasBgImage: true,
    noPadding: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: `<VcContainer v-bind="args">
      <div class="rounded bg-additional-50 p-6 shadow-sm">Page content goes here</div>
    </VcContainer>`,
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `<VcContainer>Page content goes here</VcContainer>`,
      },
    },
  },
};

export const NoBgImage: StoryType = {
  args: {
    hasBgImage: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcContainer :has-bg-image="false">Page content goes here</VcContainer>`,
      },
    },
  },
};

export const NoPadding: StoryType = {
  args: {
    noPadding: true,
    hasBgImage: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcContainer no-padding>Page content goes here</VcContainer>`,
      },
    },
  },
};

export const Loading: StoryType = {
  args: {
    loading: true,
    hasBgImage: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcContainer loading>Page content goes here</VcContainer>`,
      },
    },
  },
};

export const WithMaxWidth: StoryType = {
  args: {
    hasBgImage: false,
    maxWidth: "40rem",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcContainer max-width="40rem">Page content goes here</VcContainer>`,
      },
    },
  },
};
