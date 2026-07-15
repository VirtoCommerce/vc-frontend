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
          <VcIcon name="document-text" />
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
        <VcIcon name="file-text" color="danger" />
        <VcIcon name="credit-card" color="primary" />
        <VcIcon name="file-text" class="text-success" />
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
          <VcIcon name="file-text" class="text-success" />
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
    setup: () => ({
      sizes: [10, 12, 14, 16, 20, 24, 28, 36, 56],
      icons: ["credit-card", "bell", "settings", "heart", "search"],
    }),
    template: `
      <table class="border-collapse">
        <thead>
          <tr>
            <th class="text-xs font-mono text-start p-2"></th>
            <th v-for="px in sizes" :key="px" class="text-xs font-mono p-2">{{ px }}px</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="icon in icons" :key="icon">
            <td class="text-xs font-mono text-start p-2">{{ icon }}</td>
            <td v-for="px in sizes" :key="px" class="p-2 text-center">
              <VcIcon :name="icon" :size="px" />
            </td>
          </tr>
        </tbody>
      </table>
    `,
  }),
};

export const StrokeWidths: StoryType = {
  render: () => ({
    components: { VcIcon },
    setup: () => ({
      widths: [0.75, 1, 1.25, 1.5, 1.75, 2, 2.5],
      icons: [
        "credit-card",
        "calendar",
        "user",
        "bell",
        "heart",
        "settings",
        "search",
        "shopping-cart",
        "star",
        "mail",
      ],
    }),
    template: `
      <table class="border-collapse">
        <thead>
          <tr>
            <th class="text-xs font-mono text-start p-2"></th>
            <th v-for="w in widths" :key="w" class="text-xs font-mono p-2">{{ w }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="icon in icons" :key="icon">
            <td class="text-xs font-mono text-start p-2">{{ icon }}</td>
            <td v-for="w in widths" :key="w" class="p-2 text-center">
              <VcIcon :name="icon" :size="40" :strokeWidth="w" />
            </td>
          </tr>
        </tbody>
      </table>
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
