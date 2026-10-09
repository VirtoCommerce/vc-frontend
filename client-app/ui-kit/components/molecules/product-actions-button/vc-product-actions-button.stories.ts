import { VcProductActionsButton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcProductActionsButton> = {
  title: "Components/Molecules/VcProductActionsButton",
  component: VcProductActionsButton,
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "info", "neutral", "warning", "danger", "accent"],
    },
    iconSize: {
      control: "select",
      options: ["xxs", "xs", "sm", "md", "lg", "xl", "xxl"],
    },
    icon: {
      control: "text",
    },
    tooltipText: {
      control: "text",
    },
    ariaLabel: {
      control: "text",
    },
    ariaPressed: {
      control: "boolean",
    },
    active: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcProductActionsButton v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    ariaLabel: "Add to wishlist",
    tooltipText: "Add to wishlist",
  },
};

export const Active: StoryType = {
  args: {
    icon: "compare",
    active: true,
    ariaLabel: "Remove from comparison",
    tooltipText: "Remove from comparison",
    ariaPressed: true,
  },
};

export const ActiveColor: StoryType = {
  args: {
    active: true,
    color: "danger",
    ariaLabel: "Remove from wishlist",
    tooltipText: "Remove from wishlist",
    ariaPressed: true,
  },
};

export const IconSize: StoryType = {
  args: {
    active: true,
    color: "danger",
    iconSize: "xs",
    ariaLabel: "Small wishlist button",
    tooltipText: "Wishlist",
  },
};

export const Disabled: StoryType = {
  args: {
    disabled: true,
    ariaLabel: "Add to wishlist (unavailable)",
    tooltipText: "Add to wishlist (unavailable)",
  },
};

export const Loading: StoryType = {
  args: {
    loading: true,
    ariaLabel: "Adding to wishlist",
    tooltipText: "Adding to wishlist",
  },
};

export const LoadingActive: StoryType = {
  args: {
    loading: true,
    active: true,
    color: "danger",
    ariaLabel: "Removing from wishlist",
    tooltipText: "Removing from wishlist",
  },
};

export const ToggleButton: StoryType = {
  args: {
    icon: "heart",
    ariaLabel: "Add to wishlist",
    tooltipText: "Add to wishlist",
    ariaPressed: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Example of a toggle button with `ariaPressed` prop. Use `ariaPressed` for buttons that toggle between two states.",
      },
    },
  },
};

export const ToggleButtonPressed: StoryType = {
  args: {
    icon: "heart",
    active: true,
    color: "danger",
    ariaLabel: "Remove from wishlist",
    tooltipText: "Remove from wishlist",
    ariaPressed: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Toggle button in pressed state with `ariaPressed={true}`.",
      },
    },
  },
};

export const CompareButton: StoryType = {
  args: {
    icon: "compare",
    ariaLabel: "Add to comparison",
    tooltipText: "Add to comparison",
    ariaPressed: false,
  },
};

export const AllColors: StoryType = {
  render: () => ({
    template: `
      <div class="flex gap-4 items-center">
        <VcProductActionsButton color="primary" active ariaLabel="Primary" tooltipText="Primary" />
        <VcProductActionsButton color="secondary" active ariaLabel="Secondary" tooltipText="Secondary" />
        <VcProductActionsButton color="success" active ariaLabel="Success" tooltipText="Success" />
        <VcProductActionsButton color="info" active ariaLabel="Info" tooltipText="Info" />
        <VcProductActionsButton color="neutral" active ariaLabel="Neutral" tooltipText="Neutral" />
        <VcProductActionsButton color="warning" active ariaLabel="Warning" tooltipText="Warning" />
        <VcProductActionsButton color="danger" active ariaLabel="Danger" tooltipText="Danger" />
        <VcProductActionsButton color="accent" active ariaLabel="Accent" tooltipText="Accent" />
      </div>
    `,
  }),
};

export const AllStates: StoryType = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <div class="flex gap-4 items-center">
          <span class="w-24 text-sm">Default:</span>
          <VcProductActionsButton ariaLabel="Default state" tooltipText="Default" />
        </div>
        <div class="flex gap-4 items-center">
          <span class="w-24 text-sm">Active:</span>
          <VcProductActionsButton active color="danger" ariaLabel="Active state" tooltipText="Active" ariaPressed />
        </div>
        <div class="flex gap-4 items-center">
          <span class="w-24 text-sm">Disabled:</span>
          <VcProductActionsButton disabled ariaLabel="Disabled state" tooltipText="Disabled" />
        </div>
        <div class="flex gap-4 items-center">
          <span class="w-24 text-sm">Loading:</span>
          <VcProductActionsButton loading ariaLabel="Loading state" tooltipText="Loading" />
        </div>
        <div class="flex gap-4 items-center">
          <span class="w-24 text-sm">Loading Active:</span>
          <VcProductActionsButton loading active color="danger" ariaLabel="Loading active state" tooltipText="Loading active" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Demonstrates all button states: default, active, disabled, and loading.",
      },
    },
  },
};
