import { VcInputDetails } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcInputDetails> = {
  title: "Components/Atoms/VcInputDetails",
  component: VcInputDetails,
  argTypes: {
    message: {
      control: "text",
      description: "Helper or error message",
    },
    error: {
      control: "boolean",
      description: "Error state styling",
    },
    counter: {
      control: "boolean",
      description: "Show character counter",
    },
    showEmpty: {
      control: "boolean",
      description: "Show component even when empty",
    },
    singleLine: {
      control: "boolean",
      description: "Truncate message to single line with tooltip",
    },
    textLength: {
      control: "number",
      description: "Current text length for counter",
    },
    maxLength: {
      control: "number",
      description: "Maximum text length for counter",
    },
  },
  args: {
    error: false,
    counter: false,
    showEmpty: false,
    singleLine: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcInputDetails v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    message: "Hint message",
    textLength: 15,
    maxLength: 400,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInputDetails message="Hint message" :text-length="15" :max-length="400" />
        `,
      },
    },
  },
};

export const Counter: StoryType = {
  args: {
    message: "Hint message",
    textLength: 15,
    maxLength: 400,
    counter: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInputDetails message="Hint message" :text-length="15" :max-length="400" counter />
        `,
      },
    },
  },
};

export const ErrorState: StoryType = {
  args: {
    message: "Error message",
    textLength: 15,
    maxLength: 400,
    counter: true,
    error: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcInputDetails message="Error message" :text-length="15" :max-length="400" counter error />
        `,
      },
    },
  },
};

export const SingleLine: StoryType = {
  args: {
    message:
      "Long long long hint message. Very long hint message. Amet doloremque rerum debitis debitis officia Blanditiis impedit id distinctio voluptatibus enim. Ab magni explicabo consectetur explicabo omnis ex Qui dolorem numquam rerum temporibus sit Hic debitis error sapiente aperiam",
    textLength: 15,
    maxLength: 400,
    counter: true,
    singleLine: true,
  },
  decorators: [
    () => ({
      template: '<div id="popover-host"></div><story />',
    }),
  ],
  parameters: {
    docs: {
      source: {
        code: `
          <VcInputDetails
            message="Long long long hint message..."
            :text-length="15"
            :max-length="400"
            counter
            single-line
          />
        `,
      },
    },
  },
};
