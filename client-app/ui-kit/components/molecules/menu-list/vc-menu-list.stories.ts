import { ref } from "vue";
import { VcMenuItem, VcMenuList } from "..";
import { VcScrollbar } from "../../atoms";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "SEK", "NOK", "PLN"];

const meta: Meta<typeof VcMenuList> = {
  title: "Components/Molecules/VcMenuList",
  component: VcMenuList,
  args: {
    role: "listbox",
  },
  argTypes: {
    role: {
      control: "inline-radio",
      options: ["listbox", "menu"],
    },
  },
  parameters: {
    docs: {
      description: {
        component: [
          "Makes the `VcMenuItem` rows inside it one keyboard widget. Nothing visual: the rows look as they do anywhere else.",
          "",
          "- `role` is required: `listbox` for a choice of options (rows become `option`, `aria-selected` follows `active`),",
          "  `menu` for actions or links (rows become `menuitem`). Name the list with `aria-label` or `aria-labelledby`.",
          "- One tab stop: the row focused last, else the `active` row, else the first enabled one.",
          "- Keys: Up and Down move between the enabled rows and wrap, Home and End go to the ends;",
          "  keys with Shift, Ctrl, Alt or Meta are left to the browser.",
          "- Rows may sit at any depth (a `VcScrollbar` between them is fine); a row teleported out of the list does not join it.",
          "- `focus()` (template ref) moves focus to the tab stop — e.g. ArrowDown in a search field above the list.",
        ].join("\n"),
      },
    },
  },
};

export default meta;
type StoryType = StoryObj<typeof meta>;

export const Listbox: StoryType = {
  render: (args) => ({
    components: { VcMenuItem, VcMenuList, VcScrollbar },
    setup: () => ({ args, currencies: CURRENCIES, current: ref("EUR") }),
    template: `
      <VcMenuList v-bind="args" aria-label="Currency" class="w-64">
        <VcScrollbar vertical class="max-h-48">
          <VcMenuItem
            v-for="code in currencies"
            :key="code"
            color="secondary"
            :active="code === current"
            @click="current = code"
          >
            {{ code }}
          </VcMenuItem>
        </VcScrollbar>
      </VcMenuList>
    `,
  }),
};

export const MenuOfLinks: StoryType = {
  args: {
    role: "menu",
  },
  render: (args) => ({
    components: { VcMenuItem, VcMenuList },
    setup: () => ({ args }),
    template: `
      <VcMenuList v-bind="args" aria-label="Account" class="w-64">
        <VcMenuItem external-link="#orders" active>Orders</VcMenuItem>
        <VcMenuItem external-link="#lists">Lists</VcMenuItem>
        <VcMenuItem external-link="#addresses">Addresses</VcMenuItem>
      </VcMenuList>
    `,
  }),
};

export const DisabledItemsNoActive: StoryType = {
  render: (args) => ({
    components: { VcMenuItem, VcMenuList },
    setup: () => ({ args, current: ref<string>() }),
    template: `
      <VcMenuList v-bind="args" aria-label="Organization" class="w-64">
        <VcMenuItem disabled>Locked organization</VcMenuItem>
        <VcMenuItem :active="current === 'north'" @click="current = 'north'">North branch</VcMenuItem>
        <VcMenuItem disabled>Archived organization</VcMenuItem>
        <VcMenuItem :active="current === 'south'" @click="current = 'south'">South branch</VcMenuItem>
      </VcMenuList>
    `,
  }),
};
