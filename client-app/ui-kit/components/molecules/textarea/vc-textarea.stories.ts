import { VcTextarea } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcTextarea> = {
  title: "Components/Molecules/VcTextarea",
  component: VcTextarea,
  argTypes: {
    rows: {
      control: { type: "number", min: 1, max: 20 },
      description: "Number of visible text rows",
    },
    noResize: {
      control: "boolean",
      description: "Disables the manual resize handle",
    },
    counter: {
      control: "boolean",
      description: "Shows a character counter below the textarea",
    },
    error: {
      control: "boolean",
      description: "Applies error styling",
    },
    disabled: {
      control: "boolean",
      description: "Disables the textarea",
    },
    readonly: {
      control: "boolean",
      description: "Makes the textarea read-only",
    },
    required: {
      control: "boolean",
      description: "Marks the field as required",
    },
  },
  args: {
    readonly: false,
    disabled: false,
    required: false,
    error: false,
    counter: false,
    noResize: false,
    rows: 2,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcTextarea v-bind="args" v-model="args.modelValue" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const commonArgs = {
  label: "Comment",
  placeholder: "Write your comment here…",
  message: "Max 500 characters",
};

export const Basic: StoryType = {
  args: {
    ariaLabel: "Comment field",
  },
};

export const Common: StoryType = {
  args: commonArgs,
  parameters: {
    docs: {
      source: {
        code: `<VcTextarea label="Comment" placeholder="Write your comment here…" message="Max 500 characters" />`,
      },
    },
  },
};

export const Required: StoryType = {
  args: {
    ...commonArgs,
    required: true,
  },
};

export const ErrorState: StoryType = {
  args: {
    ...commonArgs,
    error: true,
    message: "This field is required",
  },
  parameters: {
    docs: {
      source: {
        code: `<VcTextarea label="Comment" error message="This field is required" />`,
      },
    },
  },
};

export const WithCounter: StoryType = {
  args: {
    ...commonArgs,
    counter: true,
    maxLength: 500,
    rows: 4,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcTextarea label="Comment" counter :max-length="500" :rows="4" />`,
      },
    },
  },
};

export const NoResize: StoryType = {
  args: {
    ...commonArgs,
    noResize: true,
    rows: 4,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcTextarea label="Comment" no-resize :rows="4" />`,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    ...commonArgs,
    disabled: true,
    modelValue: "This content cannot be edited.",
  },
};

export const Readonly: StoryType = {
  args: {
    ...commonArgs,
    readonly: true,
    modelValue: "Read-only content that cannot be modified.",
  },
};
