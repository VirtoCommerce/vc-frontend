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
    template: '<VcImage v-bind="args" class="size-64" />',
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

export const ObjectFit: StoryType = {
  render: (args) => ({
    components: { VcImage },
    setup: () => ({ args }),
    template: `
      <div class="flex gap-4">
        <VcImage v-bind="args" class="size-64 border" />
        <VcImage v-bind="args" class="size-64 border [--vc-image-object-fit:contain]" />
        <VcImage v-bind="args" class="size-64 border [--vc-image-object-fit:cover] [--vc-image-object-position:left]" />
      </div>
    `,
  }),
  args: {
    src: "product-example-1.webp",
    alt: "Product image",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Set how the image fills its box with `--vc-image-object-fit` (default `fill`, first image) and `--vc-image-object-position` (default `50% 50%`). For the fallback image see Fallback Fit.",
      },
      source: {
        code: `
<VcImage src="product-example-1.webp" alt="Product image" class="size-64" />
<VcImage src="product-example-1.webp" alt="Product image" class="size-64 [--vc-image-object-fit:contain]" />
<VcImage src="product-example-1.webp" alt="Product image" class="size-64 [--vc-image-object-fit:cover] [--vc-image-object-position:left]" />
        `,
      },
    },
  },
};

export const WithoutSrc: StoryType = {
  args: {
    alt: "No image",
  },
  parameters: {
    docs: {
      description: {
        story: "Without `src` the fallback image is shown, `scale-down` unless a fit token says otherwise.",
      },
      source: {
        code: `
<VcImage alt="No image" />
        `,
      },
    },
  },
};

export const FallbackFit: StoryType = {
  render: (args) => ({
    components: { VcImage },
    setup: () => ({ args }),
    template: `
      <div class="flex gap-4">
        <VcImage v-bind="args" class="size-64 border" />
        <VcImage v-bind="args" class="size-64 border [--vc-image-object-fit:cover]" />
        <VcImage v-bind="args" class="size-64 border [--vc-image-object-fit:cover] [--vc-image-fallback-object-fit:scale-down]" />
      </div>
    `,
  }),
  args: {
    alt: "No image",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The fallback image fits by `--vc-image-fallback-object-fit`, else by `--vc-image-object-fit`, else `scale-down`; its position follows `--vc-image-object-position`.",
      },
      source: {
        code: `
<VcImage alt="No image" class="size-64" />
<VcImage alt="No image" class="size-64 [--vc-image-object-fit:cover]" />
<VcImage alt="No image" class="size-64 [--vc-image-object-fit:cover] [--vc-image-fallback-object-fit:scale-down]" />
        `,
      },
    },
  },
};
