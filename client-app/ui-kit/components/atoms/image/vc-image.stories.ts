import { VcImage } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta: Meta<typeof VcImage> = {
  title: "Components/Atoms/VcImage",
  component: VcImage,
  argTypes: {
    src: {
      control: "text",
      description: "Image source URL or filename",
    },
    alt: {
      control: "text",
      description: "Alternative text for the image",
    },
    lazy: {
      control: "boolean",
      description: "Enable lazy loading",
    },
    sizeSuffix: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Thumbnail size suffix",
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcImage v-bind="args" class="w-64 h-64 object-cover" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  args: {
    src: "product-example-1.webp",
    alt: "Product image",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcImage src="product-example-1.webp" alt="Product image" />
        `,
      },
    },
  },
};

export const WithLazyLoading: StoryType = {
  args: {
    src: "product-example-1.webp",
    alt: "Product image",
    lazy: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcImage src="product-example-1.webp" alt="Product image" lazy />
        `,
      },
    },
  },
};

export const WithFallback: StoryType = {
  args: {
    src: "non-existent-image.webp",
    alt: "Product image",
    fallbackSrc: "product-example-1.webp",
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcImage src="non-existent-image.webp" alt="Product image" fallback-src="product-example-1.webp" />
        `,
      },
    },
  },
};
