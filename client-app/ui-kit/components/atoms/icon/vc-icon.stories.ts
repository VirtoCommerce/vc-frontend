import { VcIcon } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcIcon> = {
  title: "Components/Atoms/VcIcon",
  component: VcIcon,
  argTypes: {
    name: {
      control: "text",
      description: "Icon name (filename without .svg extension)",
    },
    size: {
      control: "text",
      description: "Icon size (number or string)",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcIcon v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const iconList = import.meta.glob("../../../icons/*.svg", { eager: true });

export const Basic: StoryType = {
  args: {
    name: "document-text",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcIcon name="document-text" />
        `,
      },
    },
  },
};

export const Color: StoryType = {
  args: {
    name: "document-text",
    class: "fill-danger",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcIcon name="document-text" class="fill-danger" />
        `,
      },
    },
  },
};

export const Size: StoryType = {
  args: {
    name: "document-text",
    size: 50,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcIcon name="document-text" :size="50" />
        `,
      },
    },
  },
};

export const SizeString: StoryType = {
  args: {
    name: "document-text",
    size: "md",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcIcon name="document-text" size="md" />
        `,
      },
    },
  },
};

export const AllIcons: StoryType = {
  args: {
    size: "md",
    class: "text-secondary-600",
  },
  render: (args) => ({
    setup() {
      const icons = Object.keys(iconList).map((path) => path.split("/").pop()?.replace(".svg", ""));

      return { args, icons };
    },
    template: `
      <div class="flex flex-wrap gap-3">
        <div v-for="icon in icons" :key="icon" class="border rounded p-2 text-center">
          <VcIcon :name="icon" v-bind="args" />
          <div>{{ icon }}</div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <div class="flex flex-wrap gap-3">
            <div v-for="icon in icons" :key="icon" class="border rounded p-2 text-center">
              <VcIcon :name="icon" size="md" class="text-secondary-600" />
              <div>{{ icon }}</div>
            </div>
          </div>
        `,
      },
    },
  },
};
