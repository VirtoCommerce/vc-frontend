import { ref } from "vue";
import { VcInput, VcMenuItem, VcMenuList } from "..";
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
          "- One tab stop: the `active` row, else the first enabled one; while focus stays inside, the row focused last.",
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

// Each template takes the list's role binding: `v-bind="args"` in the story, the role itself in "Show code".
const BIND_ARGS = 'v-bind="args"';

function source(code: string) {
  return { docs: { source: { code } } };
}

const LISTBOX = (role: string) => `<VcMenuList ${role} aria-label="Currency" class="w-64">
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
</VcMenuList>`;

export const Listbox: StoryType = {
  render: (args) => ({
    components: { VcMenuItem, VcMenuList, VcScrollbar },
    setup: () => ({ args, currencies: CURRENCIES, current: ref("EUR") }),
    template: LISTBOX(BIND_ARGS),
  }),
  parameters: source(LISTBOX('role="listbox"')),
};

const MENU_OF_LINKS = (role: string) => `<VcMenuList ${role} aria-label="Account" class="w-64">
  <VcMenuItem external-link="#orders" active>Orders</VcMenuItem>
  <VcMenuItem external-link="#lists">Lists</VcMenuItem>
  <VcMenuItem external-link="#addresses">Addresses</VcMenuItem>
</VcMenuList>`;

export const MenuOfLinks: StoryType = {
  args: {
    role: "menu",
  },
  render: (args) => ({
    components: { VcMenuItem, VcMenuList },
    setup: () => ({ args }),
    template: MENU_OF_LINKS(BIND_ARGS),
  }),
  parameters: source(MENU_OF_LINKS('role="menu"')),
};

const DISABLED_ITEMS_NO_ACTIVE = (role: string) => `<VcMenuList ${role} aria-label="Organization" class="w-64">
  <VcMenuItem disabled>Locked organization</VcMenuItem>
  <VcMenuItem :active="current === 'north'" @click="current = 'north'">North branch</VcMenuItem>
  <VcMenuItem disabled>Archived organization</VcMenuItem>
  <VcMenuItem :active="current === 'south'" @click="current = 'south'">South branch</VcMenuItem>
</VcMenuList>`;

export const DisabledItemsNoActive: StoryType = {
  render: (args) => ({
    components: { VcMenuItem, VcMenuList },
    setup: () => ({ args, current: ref<string>() }),
    template: DISABLED_ITEMS_NO_ACTIVE(BIND_ARGS),
  }),
  parameters: source(DISABLED_ITEMS_NO_ACTIVE('role="listbox"')),
};

const WITH_SEARCH_FIELD = (role: string) => `<div class="w-64">
  <VcInput aria-label="Search currencies" @keydown.down.prevent="list?.focus()" />

  <VcMenuList ref="list" ${role} aria-label="Currency" class="mt-2">
    <VcMenuItem
      v-for="code in currencies"
      :key="code"
      color="secondary"
      :active="code === current"
      @click="current = code"
    >
      {{ code }}
    </VcMenuItem>
  </VcMenuList>
</div>`;

export const WithSearchField: StoryType = {
  render: (args) => ({
    components: { VcInput, VcMenuItem, VcMenuList },
    setup: () => ({
      args,
      currencies: CURRENCIES.slice(0, 4),
      current: ref("EUR"),
      list: ref<{ focus: () => void }>(),
    }),
    template: WITH_SEARCH_FIELD(BIND_ARGS),
  }),
  parameters: source(WITH_SEARCH_FIELD('role="listbox"')),
};
