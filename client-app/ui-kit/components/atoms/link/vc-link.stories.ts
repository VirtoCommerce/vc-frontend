import { VcLink } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcLink> = {
  title: "Components/Atoms/VcLink",
  component: VcLink,
  argTypes: {
    to: {
      control: "text",
      description: "Router link destination",
    },
    externalLink: {
      control: "text",
      description: "External link URL",
    },
    disabled: {
      control: "boolean",
      description: "Disable the link",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcLink v-bind="args">Link text</VcLink>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    to: "/",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcLink to="/">Link text</VcLink>
        `,
      },
    },
  },
};

export const ExternalLink: StoryType = {
  args: {
    externalLink: "https://example.com",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcLink external-link="https://example.com">Link text</VcLink>
        `,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    to: "/",
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcLink to="/" disabled>Link text</VcLink>
        `,
      },
    },
  },
};
