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
    variant: {
      control: "select",
      options: ["solid", "outline"],
      description: "Icon variant",
    },
    strokeWidth: {
      control: "number",
      description: "Stroke width for outline icons",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcIcon v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const solidList = import.meta.glob("../../../icons/solid/*.svg", { eager: true });
const outlineList = import.meta.glob("../../../icons/outline/*.svg", { eager: true });

export const Basic: StoryType = {
  args: {
    name: "credit-card",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcIcon name="credit-card" />
        `,
      },
    },
  },
};

export const Color: StoryType = {
  render: () => ({
    components: { VcIcon },
    template: `
      <div class="flex items-center gap-4">
        <VcIcon name="document-text" color="danger" />
        <VcIcon name="credit-card" color="primary" />
        <VcIcon name="document-text" class="text-success" />
        <VcIcon name="credit-card" class="text-warning" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcIcon name="document-text" color="danger" />
          <VcIcon name="credit-card" color="primary" />
          <VcIcon name="document-text" class="text-success" />
          <VcIcon name="credit-card" class="text-warning" />
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

export const Outline: StoryType = {
  args: { name: "credit-card", size: "lg" },
  render: (args) => ({
    components: { VcIcon },
    setup: () => ({ args }),
    template: `<VcIcon v-bind="args" />`,
  }),
};

export const StrokeBuckets: StoryType = {
  render: () => ({
    components: { VcIcon },
    setup: () => ({ sizes: ["xxs", "xs", "sm", "md", "lg", "xl", "xxl"] }),
    template: `
      <div class="flex items-end gap-4">
        <div v-for="s in sizes" :key="s" class="text-center">
          <VcIcon name="credit-card" :size="s" />
          <div class="text-xs mt-1">{{ s }}</div>
        </div>
      </div>
    `,
  }),
};

export const StrokeWidths: StoryType = {
  render: () => ({
    components: { VcIcon },
    setup: () => ({ widths: [1, 1.5, 2, 2.5, 3] }),
    template: `
      <div class="flex items-end gap-6">
        <div v-for="w in widths" :key="w" class="text-center">
          <VcIcon name="credit-card" size="xxl" :strokeWidth="w" />
          <div class="text-xs mt-1">strokeWidth: {{ w }}</div>
        </div>
      </div>
    `,
  }),
};

export const AllIcons: StoryType = {
  args: { size: "md" },
  render: (args) => ({
    components: { VcIcon },
    setup() {
      const toNames = (rec: Record<string, unknown>) =>
        Object.keys(rec).map((p) => {
          // eslint-disable-next-line sonarjs/null-dereference -- path is a typed string key; the rule is a false positive here
          return p.split("/").pop()?.replace(".svg", "");
        });
      const solid = toNames(solidList);
      const outline = toNames(outlineList);
      return { args, solid, outline };
    },
    template: `
      <div>
        <h3 class="font-bold mb-2">Outline ({{ outline.length }})</h3>
        <div class="flex flex-wrap gap-3 mb-6">
          <div v-for="i in outline" :key="'o'+i" class="border rounded p-2 text-center">
            <VcIcon :name="i" variant="outline" v-bind="args" /><div class="text-xs">{{ i }}</div>
          </div>
        </div>
        <h3 class="font-bold mb-2">Solid ({{ solid.length }})</h3>
        <div class="flex flex-wrap gap-3">
          <div v-for="i in solid" :key="'s'+i" class="border rounded p-2 text-center">
            <VcIcon :name="i" variant="solid" v-bind="args" /><div class="text-xs">{{ i }}</div>
          </div>
        </div>
      </div>
    `,
  }),
};
