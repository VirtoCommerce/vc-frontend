import { VcListbox, VcMenuItem } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const COUNTRIES = ["Albania", "Belgium", "China", "India", "Japan", "Kenya", "Latvia", "Mexico"];

const meta: Meta<typeof VcListbox> = {
  title: "Components/Molecules/VcListbox",
  component: VcListbox,
  parameters: {
    docs: {
      description: {
        component:
          "The list half of a select, without the popover. `VcSelect` renders it inside a `VcPopover`, " +
          "but it is also usable on its own — an organization switcher embedded in an already-open menu, " +
          "for example. It owns the scroll area, the listbox semantics and its own background and radius, " +
          "so it looks the same with or without a popover around it. Options are passed as children, " +
          "which keeps the consumer in charge of their content and selection state.",
      },
    },
  },
  args: {
    dividers: true,
    multiselectable: false,
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Basic: StoryType = {
  render: (args) => ({
    components: { VcListbox, VcMenuItem },
    setup: () => ({ args, COUNTRIES }),
    template: `
      <VcListbox v-bind="args" list-label="Countries" class="w-64">
        <VcMenuItem v-for="country in COUNTRIES" :key="country" role="option" size="sm" :tabindex="-1">
          {{ country }}
        </VcMenuItem>
      </VcListbox>
    `,
  }),
};

export const WithHeaderAndFooter: StoryType = {
  render: (args) => ({
    components: { VcListbox, VcMenuItem },
    setup: () => ({ args, COUNTRIES }),
    template: `
      <VcListbox v-bind="args" list-label="Countries" class="w-64">
        <template #header>
          <div class="p-3 text-sm font-bold">Pick a country</div>
        </template>

        <VcMenuItem v-for="country in COUNTRIES" :key="country" role="option" size="sm" :tabindex="-1">
          {{ country }}
        </VcMenuItem>

        <template #footer>
          <div class="p-3 text-xs text-neutral-600">{{ COUNTRIES.length }} countries</div>
        </template>
      </VcListbox>
    `,
  }),
};

export const Selection: StoryType = {
  args: { multiselectable: true },
  render: (args) => ({
    components: { VcListbox, VcMenuItem },
    setup: () => ({ args, COUNTRIES }),
    template: `
      <VcListbox v-bind="args" list-label="Countries" class="w-64">
        <VcMenuItem
          v-for="(country, index) in COUNTRIES"
          :key="country"
          role="option"
          size="sm"
          :tabindex="-1"
          :active="index === 1"
          :highlighted="index === 3"
          :aria-selected="index === 1"
        >
          {{ country }}
        </VcMenuItem>
      </VcListbox>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "`active` marks the chosen option, `highlighted` marks the one the keyboard is on. " +
          "They are separate because focus stays on the combobox: the highlight is the only " +
          "visual cue the user gets while arrowing through the list.",
      },
    },
  },
};

export const CustomMaxHeight: StoryType = {
  args: { maxHeight: "8rem" },
  render: (args) => ({
    components: { VcListbox, VcMenuItem },
    setup: () => ({ args, COUNTRIES }),
    template: `
      <VcListbox v-bind="args" list-label="Countries" class="w-64">
        <VcMenuItem v-for="country in COUNTRIES" :key="country" role="option" size="sm" :tabindex="-1">
          {{ country }}
        </VcMenuItem>
      </VcListbox>
    `,
  }),
};
