import { VcWidgetSkeleton } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];

const meta: Meta<typeof VcWidgetSkeleton> = {
  title: "Components/Organisms/VcWidgetSkeleton",
  component: VcWidgetSkeleton,
  argTypes: {
    size: {
      control: "inline-radio",
      options: SIZES,
      type: { name: "string", required: false },
      table: {
        type: {
          summary: SIZES.join(" | "),
        },
      },
    },
  },
  render: (args) => ({
    setup: () => ({ args }),
    template: '<VcWidgetSkeleton v-bind="args" />',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderSkeleton = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args }),
  template,
});

export const Basic: StoryType = {
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton />
        `,
      },
    },
  },
};

export const Head: StoryType = {
  args: {
    head: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton head />
        `,
      },
    },
  },
};

export const Foot: StoryType = {
  args: {
    foot: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton foot />
        `,
      },
    },
  },
};

export const HeaderSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #header>
      <div class="w-full flex gap-4 items-center">
        <div class="flex-none h-8 w-8 rounded-full"></div>
        <div class="flex-none w-52"></div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton>
            <template #header>
              <div class="w-full flex gap-4 items-center">
                <div class="flex-none h-8 w-8 rounded-full"></div>
                <div class="flex-none w-52"></div>
              </div>
            </template>
          </VcWidgetSkeleton>
        `,
      },
    },
  },
};

export const DefaultSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <div class="flex gap-4 mb-3">
      <div class="flex-none h-10 w-10 rounded-full"></div>

      <div class="grow">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div v-for="i in [1, 2, 3, 4, 5]"></div>
  </VcWidgetSkeleton>`),
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton>
            <div class="flex gap-4 mb-3">
              <div class="flex-none h-10 w-10 rounded-full"></div>

              <div class="grow">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div v-for="i in [1, 2, 3, 4, 5]" :key="i"></div>
          </VcWidgetSkeleton>
        `,
      },
    },
  },
};

export const FooterSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #footer>
      <div class="w-full flex gap-4 items-center">
        <div class="flex-none h-8 w-8 rounded-full"></div>
        <div class="flex-none w-52"></div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton>
            <template #footer>
              <div class="w-full flex gap-4 items-center">
                <div class="flex-none h-8 w-8 rounded-full"></div>
                <div class="flex-none w-52"></div>
              </div>
            </template>
          </VcWidgetSkeleton>
        `,
      },
    },
  },
};

export const HeaderContainerSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #header-container>
      <div class="flex divide-x">
        <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
          <div class="h-6 w-8"></div>
        </div>
        <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
          <div class="h-6 w-52"></div>
        </div>
        <div class="grow p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
          <div class="h-6"></div>
        </div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton>
            <template #header-container>
              <div class="flex divide-x">
                <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                  <div class="h-6 w-8"></div>
                </div>
                <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                  <div class="h-6 w-52"></div>
                </div>
                <div class="grow p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                  <div class="h-6"></div>
                </div>
              </div>
            </template>
          </VcWidgetSkeleton>
        `,
      },
    },
  },
};

export const DefaultContainerSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #default-container>
      <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
        <div class="h-52 w-full"></div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton>
            <template #default-container>
              <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                <div class="h-52 w-full"></div>
              </div>
            </template>
          </VcWidgetSkeleton>
        `,
      },
    },
  },
};

export const FooterContainerSlot: StoryType = {
  render: renderSkeleton(`<VcWidgetSkeleton v-bind="args">
    <template #footer-container>
      <div class="flex divide-x">
        <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
          <div class="h-8 w-8"></div>
        </div>
        <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
          <div class="h-8 w-52"></div>
        </div>
        <div class="grow p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
          <div class="h-8 w-full"></div>
        </div>
      </div>
    </template>
  </VcWidgetSkeleton>`),
  parameters: {
    docs: {
      source: {
        code: `
          <VcWidgetSkeleton>
            <template #footer-container>
              <div class="flex divide-x">
                <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                  <div class="h-8 w-8"></div>
                </div>
                <div class="p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                  <div class="h-8 w-52"></div>
                </div>
                <div class="grow p-[calc(var(--vc-widget-radius,var(--vc-radius))/2)]">
                  <div class="h-8 w-full"></div>
                </div>
              </div>
            </template>
          </VcWidgetSkeleton>
        `,
      },
    },
  },
};

export const WithWidget: StoryType = {
  render: renderSkeleton(`<div class="space-y-6">
    <div v-for="size in ['xs', 'sm', 'md', 'lg']" :key="size" class="grid items-start gap-4 lg:grid-cols-3">
      <VcWidgetSkeleton :size="size" head foot />

      <VcWidget v-for="icon in ['', 'academic-cap']" :key="icon" :size="size" :title="'Size ' + size" :prepend-icon="icon">
        <div v-for="i in [1, 2, 3, 4, 5]" :key="i" class="h-4 mb-2 last:mb-0">Widget text</div>

        <template #footer>Footer text</template>
      </VcWidget>
    </div>
  </div>`),
  parameters: {
    docs: {
      description: {
        story:
          "A skeleton is the VcWidget of its size: radius, insets and header height match a loaded widget with a title. A prepend icon taller than the title line makes the loaded header taller where the header hugs its content.",
      },
      source: {
        code: `
          <VcWidgetSkeleton v-if="loading" size="sm" head foot />

          <VcWidget v-else size="sm" title="Size sm" prepend-icon="academic-cap">
            Widget text

            <template #footer>Footer text</template>
          </VcWidget>
        `,
      },
    },
  },
};
