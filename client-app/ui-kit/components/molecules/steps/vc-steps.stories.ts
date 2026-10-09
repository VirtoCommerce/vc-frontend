import { VcSteps } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const steps: IStepsItem[] = [
  { text: "Cart" },
  { text: "Shipping" },
  { text: "Payment" },
  { text: "Review" },
  { text: "Confirmation" },
];

const meta: Meta<typeof VcSteps> = {
  title: "Components/Molecules/VcSteps",
  component: VcSteps,
  argTypes: {
    currentStepIndex: {
      control: { type: "range", min: 1, max: 6, step: 1 },
      description: "Index of the currently active step (1-based by default)",
    },
    disabled: {
      control: "boolean",
      description: "Disables all step navigation links",
    },
  },
  args: {
    steps,
    currentStepIndex: 1,
    disabled: false,
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcSteps v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const FirstStep: StoryType = {
  args: {
    currentStepIndex: 1,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcSteps
            :steps="[{ text: 'Cart' }, { text: 'Shipping' }, { text: 'Payment' }, { text: 'Confirmation' }]"
            :current-step-index="1"
          />
        `,
      },
    },
  },
};

export const MiddleProgress: StoryType = {
  args: {
    currentStepIndex: 3,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcSteps :steps="steps" :current-step-index="3" />`,
      },
    },
  },
};

export const LastStep: StoryType = {
  args: {
    currentStepIndex: 5,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcSteps :steps="steps" :current-step-index="5" />`,
      },
    },
  },
};

export const AllCompleted: StoryType = {
  args: {
    currentStepIndex: 6,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcSteps :steps="steps" :current-step-index="6" />`,
      },
    },
  },
};

export const Disabled: StoryType = {
  args: {
    currentStepIndex: 3,
    disabled: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<VcSteps :steps="steps" :current-step-index="3" disabled />`,
      },
    },
  },
};
