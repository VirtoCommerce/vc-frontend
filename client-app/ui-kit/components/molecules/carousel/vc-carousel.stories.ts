import { VcCarousel } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta = {
  title: "Components/Molecules/VcCarousel",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: VcCarousel as any,
  argTypes: {
    navigation: {
      control: "boolean",
      description: "Shows prev/next navigation buttons",
    },
    pagination: {
      control: "boolean",
      description: "Shows pagination dots below the carousel",
    },
  },
  args: {
    navigation: false,
    pagination: false,
  },
  decorators: [
    () => ({
      template: '<div class="mx-auto max-w-xl p-8"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VcCarousel>;

export default meta;
type StoryType = StoryObj<typeof meta>;

const slides = [
  { title: "Spring Collection", subtitle: "Fresh styles for a new season", color: "bg-primary-50" },
  { title: "Summer Sale", subtitle: "Up to 40% off selected items", color: "bg-success-50" },
  { title: "New Arrivals", subtitle: "Discover the latest trends", color: "bg-warning-50" },
  { title: "Exclusive Deals", subtitle: "Members-only offers this week", color: "bg-danger-50" },
];

export const Basic: StoryType = {
  render: (args) => ({
    components: { VcCarousel },
    setup: () => ({ args, slides }),
    template: `<VcCarousel v-bind="args" :slides="slides">
      <template #slide="{ slide }">
        <div :class="[slide.color, 'flex h-48 flex-col items-center justify-center rounded p-6 text-center']">
          <p class="text-lg font-bold text-neutral-900">{{ slide.title }}</p>
          <p class="mt-1 text-sm text-neutral-600">{{ slide.subtitle }}</p>
        </div>
      </template>
    </VcCarousel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `
          <VcCarousel :slides="slides">
            <template #slide="{ slide }">
              <div class="flex h-48 flex-col items-center justify-center rounded p-6 text-center">
                <p class="font-bold">{{ slide.title }}</p>
              </div>
            </template>
          </VcCarousel>
        `,
      },
    },
  },
};

export const WithNavigation: StoryType = {
  args: {
    navigation: true,
  },
  render: (args) => ({
    components: { VcCarousel },
    setup: () => ({ args, slides }),
    template: `<VcCarousel v-bind="args" :slides="slides">
      <template #slide="{ slide }">
        <div :class="[slide.color, 'flex h-48 flex-col items-center justify-center rounded p-6 text-center']">
          <p class="text-lg font-bold text-neutral-900">{{ slide.title }}</p>
          <p class="mt-1 text-sm text-neutral-600">{{ slide.subtitle }}</p>
        </div>
      </template>
    </VcCarousel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcCarousel navigation :slides="slides"><template #slide="{ slide }">...</template></VcCarousel>`,
      },
    },
  },
};

export const WithPagination: StoryType = {
  args: {
    pagination: true,
  },
  render: (args) => ({
    components: { VcCarousel },
    setup: () => ({ args, slides }),
    template: `<VcCarousel v-bind="args" :slides="slides">
      <template #slide="{ slide }">
        <div :class="[slide.color, 'flex h-48 flex-col items-center justify-center rounded p-6 text-center']">
          <p class="text-lg font-bold text-neutral-900">{{ slide.title }}</p>
          <p class="mt-1 text-sm text-neutral-600">{{ slide.subtitle }}</p>
        </div>
      </template>
    </VcCarousel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcCarousel pagination :slides="slides"><template #slide="{ slide }">...</template></VcCarousel>`,
      },
    },
  },
};

export const WithNavigationAndPagination: StoryType = {
  args: {
    navigation: true,
    pagination: true,
  },
  render: (args) => ({
    components: { VcCarousel },
    setup: () => ({ args, slides }),
    template: `<VcCarousel v-bind="args" :slides="slides">
      <template #slide="{ slide }">
        <div :class="[slide.color, 'flex h-48 flex-col items-center justify-center rounded p-6 text-center']">
          <p class="text-lg font-bold text-neutral-900">{{ slide.title }}</p>
          <p class="mt-1 text-sm text-neutral-600">{{ slide.subtitle }}</p>
        </div>
      </template>
    </VcCarousel>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `<VcCarousel navigation pagination :slides="slides"><template #slide="{ slide }">...</template></VcCarousel>`,
      },
    },
  },
};
