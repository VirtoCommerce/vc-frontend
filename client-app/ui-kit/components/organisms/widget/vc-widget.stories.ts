import { VcWidget } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const SIZES = ["xs", "sm", "md", "lg"];

const meta: Meta<typeof VcWidget> = {
  title: "Components/Organisms/VcWidget",
  component: VcWidget,
  parameters: {
    docs: {
      description: {
        component: [
          "A plate with an optional header, a body and a footer. A theme or a design restyles it through these CSS variables:",
          "",
          "| Variable | Classic value |",
          "| --- | --- |",
          "| `--vc-widget-radius` | `var(--vc-radius)`, 0.5rem |",
          "| `--vc-widget-border-width` | 1px; a length, so `0px` rather than `0` |",
          "| `--vc-widget-border-color` | neutral-200 |",
          "| `--vc-widget-divide-color` | the border colour |",
          "| `--vc-widget-bg-color` | additional-50 |",
          "| `--vc-widget-shadow` | the `shadow-md` parts |",
          "| `--vc-widget-padding-x` | xs, sm 1rem · md 1rem, 1.5rem from `sm` · lg 1rem, 1.75rem from `lg` |",
          "| `--vc-widget-title-font-weight` | `var(--vc-heading-font-weight)`, else 700 |",
          "| `--vc-widget-title-text-transform` | `var(--vc-heading-text-transform)`, else uppercase |",
          "| `--vc-widget-title-letter-spacing` | `var(--vc-heading-letter-spacing)`, else inherited |",
        ].join("\n"),
      },
    },
  },
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
    template: '<VcWidget v-bind="args">Widget text</VcWidget>',
  }),
};

export default meta;
type StoryType = StoryObj<typeof meta>;

const renderWidget = (template: string) => (args: Record<string, unknown>) => ({
  setup: () => ({ args }),
  template,
});

export const Basic: StoryType = {};

export const NoShadow: StoryType = {
  args: {
    shadow: false,
  },
};

export const NoBorder: StoryType = {
  args: {
    border: false,
  },
};

export const Title: StoryType = {
  args: {
    title: "Widget title",
  },
};

export const PrependIcon: StoryType = {
  args: {
    title: "Widget title",
    prependIcon: "academic-cap",
  },
};

export const AppendIcon: StoryType = {
  args: {
    title: "Widget title",
    appendIcon: "check-circle",
  },
};

export const Collapsible: StoryType = {
  args: {
    title: "Widget title",
    collapsible: true,
  },
};

export const Collapsed: StoryType = {
  args: {
    title: "Widget title",
    collapsible: true,
    collapsed: true,
  },
};

export const CollapsibleCustomIcon: StoryType = {
  args: {
    title: "Widget title",
    collapsible: true,
  },
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #append="{ collapsed }">
      <VcIcon :name="collapsed ? 'arrow-down' : 'arrow-up'" />
    </template>
  </VcWidget>`),
};

export const PrependSlot: StoryType = {
  args: {
    title: "Widget title",
  },
  render: renderWidget(`<VcWidget v-bind="args">
    <template #prepend>
      <VcIcon class="text-danger" name="cake" size="sm" />
    </template>

    Widget text
  </VcWidget>`),
};

export const AppendSlot: StoryType = {
  args: {
    title: "Widget title",
  },
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #append>
      <span class="flex items-center gap-1">
        <a class="text-accent-600 text-sm underline" href="#">Link</a>
        <VcIcon class="text-accent-600" name="arrow-right" size="xs" />
      </span>
    </template>
  </VcWidget>`),
};

export const HeaderSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    <template #header>Header text</template>

    Widget text
  </VcWidget>`),
};

export const HeaderContainerSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    <template #header-container>
      <div class="p-4 bg-info text-additional-50">
        Header Container
      </div>
    </template>

    Widget text
  </VcWidget>`),
};

export const DefaultContainerSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    <template #default-container>
      <div class="py-1 px-3 bg-neutral-100">
        Default Container
      </div>
      <div class="flex border-t divide-x" v-for="item in [1, 2, 3]">
        <div class="py-1 px-3">{{ item }}</div>
        <div class="grow py-1 px-3">Text</div>
        <div class="grow-[2] py-1 px-3">Text</div>
      </div>
    </template>
  </VcWidget>`),
};

export const FooterSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #footer>Footer text</template>
  </VcWidget>`),
};

export const FooterContainerSlot: StoryType = {
  render: renderWidget(`<VcWidget v-bind="args">
    Widget text

    <template #footer-container>
      <div class="flex divide-x">
        <div class="grow p-2 text-center rounded-bl bg-danger-100">Text 1</div>
        <div class="grow p-2 text-center bg-warning-100">Text 2</div>
        <div class="grow p-2 text-center rounded-br bg-success-100">Text 3</div>
      </div>
    </template>
  </VcWidget>`),
};

export const HeaderOnly: StoryType = {
  args: {
    title: "Widget title",
  },
  render: renderWidget(`<VcWidget v-bind="args" />`),
};

export const FooterOnly: StoryType = {
  render: renderWidget(`<VcWidget>
    <template #footer>Footer text</template>
  </VcWidget>`),
};

export const HeaderFooterOnly: StoryType = {
  render: renderWidget(`<VcWidget>
    <template #header>Header text</template>

    <template #footer>Footer text</template>
  </VcWidget>`),
};

export const Seamless: StoryType = {
  render: renderWidget(`<VcWidget title="Account" size="lg">
    <div class="space-y-6">
      <VcWidget title="Orders" size="sm" seamless>
        <ul class="space-y-2">
          <li>Order history</li>
          <li>Returns</li>
        </ul>
      </VcWidget>

      <VcWidget title="Company" size="sm" seamless>
        <ul class="space-y-2">
          <li>Company info</li>
          <li>Members</li>
        </ul>
      </VcWidget>
    </div>
  </VcWidget>`),
  parameters: {
    docs: {
      description: {
        story:
          "`seamless` draws no plate and no inline padding, so a widget inside another card lines its rows up with that card's heading.",
      },
    },
  },
};
