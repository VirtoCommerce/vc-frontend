import { ref } from "vue";
import { VcButton, VcChip, VcSortable, VcSwitch, VcWidget } from "../..";
import { useSortableItem } from "../../../composables";
import type { SortableMovePayloadType, SortableSignalType } from "../../../composables";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

const meta = {
  title: "Components/Molecules/VcSortable",
  component: VcSortable,
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
      table: { type: { summary: "vertical | horizontal" } },
    },
    enabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Reorders a list by pointer and by keyboard. The layout, the item markup and its look stay the consumer's: bind the slot's `attrs` to the item's single root element and style the container with your own class. Keyboard: Space/Enter grabs and drops, the arrows along `orientation` move, Escape puts the item back, and leaving the item cancels. The drag states retheme through the `--vc-sortable-*` tokens.",
      },
    },
  },
} as Meta<typeof VcSortable>;

export default meta;
type StoryType = StoryObj<typeof meta>;

// A visually hidden live region: the keyboard's only feedback. The consumer owns the wording.
function describeSignal(signal: SortableSignalType): string {
  switch (signal.kind) {
    case "grabbed":
      return `Grabbed ${signal.id}, position ${signal.index + 1} of ${signal.total}`;
    case "moved":
      return `Moved to position ${signal.index + 1} of ${signal.total}`;
    case "dropped":
      return `Dropped ${signal.id}, position ${signal.index + 1} of ${signal.total}`;
    case "edge":
      return "No further to go";
    case "cancelled":
      return `Cancelled: ${signal.id} is back where it started`;
    case "movedList":
      return `Moved ${signal.id} to ${signal.to}`;
    case "noTarget":
      return "No list in that direction takes it";
  }
}

export const WholeItem: StoryType = {
  args: { orientation: "vertical", enabled: true },
  parameters: {
    docs: {
      description: {
        story: "Without a `handle` the whole item drags and is itself the keyboard control.",
      },
      source: {
        code: `<VcSortable v-model="items" class="my-list">
  <template #item="{ item, attrs }">
    <div v-bind="attrs" :aria-label="\`Reorder \${item}\`" class="my-list__card">{{ item }}</div>
  </template>
</VcSortable>`,
      },
    },
  },
  render: (args) => ({
    components: { VcSortable },
    setup() {
      const items = ref(["Orders", "Quotes", "Returns", "Invoices"]);
      const message = ref("");
      return { args, items, message, describeSignal };
    },
    template: `
      <div class="flex flex-col gap-3 max-w-sm">
        <VcSortable
          v-model="items"
          v-bind="args"
          :class="args.orientation === 'horizontal' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'"
          @announce="message = describeSignal($event)"
        >
          <template #item="{ item, attrs }">
            <div
              v-bind="attrs"
              :aria-label="'Reorder ' + item"
              class="rounded-[--vc-radius] border border-neutral-300 bg-additional-50 px-3 py-2 text-sm outline-offset-2"
            >
              {{ item }}
            </div>
          </template>
        </VcSortable>
        <div class="text-xs text-neutral-600">Order: {{ items.join(", ") }}</div>
        <p class="sr-only" aria-live="polite">{{ message }}</p>
      </div>
    `,
  }),
};

export const ReorderMode: StoryType = {
  parameters: {
    docs: {
      description: {
        story:
          "A chip is a control of its own, so `enabled` gates a reorder mode: while it is off the chips filter and do not drag; while it is on the whole chip is the handle and loses its own action.",
      },
    },
  },
  render: () => ({
    components: { VcSortable, VcChip, VcSwitch },
    setup() {
      const statuses = ref(["New", "Processing", "Shipped", "Completed", "Cancelled"]);
      const applied = ref<string[]>([]);
      const reordering = ref(false);
      const toggle = (status: string) => {
        applied.value = applied.value.includes(status)
          ? applied.value.filter((item) => item !== status)
          : [...applied.value, status];
      };
      return { statuses, applied, reordering, toggle };
    },
    template: `
      <div class="flex flex-col gap-3">
        <VcSwitch v-model="reordering">Reorder mode</VcSwitch>
        <VcSortable v-model="statuses" :enabled="reordering" orientation="horizontal" class="flex flex-wrap gap-2">
          <template #item="{ item, attrs, grabbed }">
            <VcChip
              v-bind="attrs"
              :aria-label="reordering ? 'Reorder ' + item : undefined"
              :color="grabbed || applied.includes(item) ? 'primary' : 'neutral'"
              :clickable="!reordering"
              @click="reordering || toggle(item)"
            >
              {{ item }}
            </VcChip>
          </template>
        </VcSortable>
        <div class="text-xs text-neutral-600">Order: {{ statuses.join(", ") }} · Filter: {{ applied.join(", ") || "none" }}</div>
      </div>
    `,
  }),
};

// The handle is rendered deep inside the item, by the widget itself.
const HandleWidget = {
  components: { VcWidget, VcButton },
  props: { title: { type: String, required: true } },
  setup() {
    return { item: useSortableItem() };
  },
  template: `
    <VcWidget :title="title" size="sm">
      <template v-if="item?.handleAttrs.value" #prepend>
        <VcButton
          v-bind="item.handleAttrs.value"
          :aria-label="'Reorder ' + title"
          icon="switch-vertical"
          size="xs"
          variant="ghost"
          color="secondary"
          :style="item.grabbed.value ? { '--vc-button-ghost-secondary-icon': 'var(--vc-sortable-accent-color)' } : undefined"
        />
      </template>
      <div class="text-sm text-neutral-600">Body of {{ title }}</div>
    </VcWidget>
  `,
};

export const Handle: StoryType = {
  parameters: {
    docs: {
      description: {
        story:
          "With a `handle` only that part starts a pointer drag, and the keyboard goes through `handleAttrs`, which a component inside the item picks up with `useSortableItem()`. Controls inside the handle stay clickable when listed in `filter`.",
      },
      source: {
        code: `<VcSortable v-model="widgets" handle=".vc-widget__header-container" class="flex flex-col gap-4">
  <template #item="{ item, attrs }">
    <div v-bind="attrs" class="rounded-[--vc-radius]"><MyWidget :title="item" /></div>
  </template>
</VcSortable>

// MyWidget
const item = useSortableItem(); // undefined outside a VcSortable
<VcButton
  v-if="item?.handleAttrs.value"
  v-bind="item.handleAttrs.value"
  aria-label="Reorder"
  icon="switch-vertical"
  variant="ghost"
  color="secondary"
  :style="item.grabbed.value ? { '--vc-button-ghost-secondary-icon': 'var(--vc-sortable-accent-color)' } : undefined"
/>`,
      },
    },
  },
  render: () => ({
    components: { VcSortable, HandleWidget },
    setup() {
      const widgets = ref(["Recent orders", "Top sellers", "Tasks"]);
      return { widgets };
    },
    template: `
      <div class="flex flex-col gap-3 max-w-md">
        <VcSortable v-model="widgets" handle=".vc-widget__header-container" class="flex flex-col gap-4">
          <template #item="{ item, attrs }">
            <div v-bind="attrs" class="rounded-[--vc-radius]"><HandleWidget :title="item" /></div>
          </template>
        </VcSortable>
        <div class="text-xs text-neutral-600">Order: {{ widgets.join(", ") }}</div>
      </div>
    `,
  }),
};

export const LinkedLists: StoryType = {
  parameters: {
    docs: {
      description: {
        story:
          "Lists sharing a `group` exchange items, and `ring` lets the cross-axis arrows (↑/↓ here) move a grabbed item to the neighbouring list. A move is emitted, never applied: the owner of both arrays applies it. `accepts` is asked on both paths — “archive” refuses “Invoices”, by pointer and by keyboard alike, and the story marks the refusing list while “Invoices” is held. That marking is the consumer's: VcSortable does not dim refusing lists itself.",
      },
    },
  },
  render: () => ({
    components: { VcSortable },
    setup() {
      const lists = ref<Record<string, string[]>>({
        shown: ["Orders", "Quotes", "Returns"],
        parked: ["Invoices"],
        archive: [],
      });
      const ring = ["shown", "parked", "archive"];
      const message = ref("");

      function onMove({ id, from, to, index }: SortableMovePayloadType) {
        lists.value[from] = lists.value[from].filter((item) => item !== id);
        const target = [...lists.value[to]];
        target.splice(index ?? target.length, 0, id);
        lists.value[to] = target;
      }

      const REFUSED = "Invoices";
      const acceptsIn = (name: string) => (id: string) => name !== "archive" || id !== REFUSED;

      // What is held right now, by pointer or keyboard, so the story can mark the list that refuses it.
      const held = ref<string>();
      const refuses = (name: string) => held.value !== undefined && !acceptsIn(name)(held.value);

      // SortableJS's own `choose` / `unchoose` bubble from the list on press and release, by mouse and by
      // touch alike — and a press also ends a keyboard grab without a signal of its own.
      function onChoose(event: Event) {
        held.value = (event as Event & { item: HTMLElement }).item.dataset.sortableId;
      }

      function onAnnounce(signal: SortableSignalType) {
        message.value =
          signal.kind === "noTarget" && signal.id === REFUSED && lists.value.parked.includes(REFUSED)
            ? `No list below takes “${REFUSED}” — “archive” refuses it`
            : describeSignal(signal);
        if (signal.kind === "grabbed") {
          held.value = signal.id;
        } else if (signal.kind === "dropped" || signal.kind === "cancelled") {
          held.value = undefined;
        }
      }

      return { lists, ring, message, onMove, acceptsIn, refuses, held, onChoose, onAnnounce, REFUSED };
    },
    template: `
      <div class="flex flex-col gap-4" @choose="onChoose" @unchoose="held = undefined">
        <div v-for="name in ring" :key="name" class="flex flex-col gap-1">
          <div class="flex items-baseline gap-2 text-xs">
            <span class="font-bold uppercase text-neutral-500">{{ name }}</span>
            <span v-if="!acceptsIn(name)(REFUSED)" :class="refuses(name) ? 'font-bold text-danger-700' : 'text-neutral-600'">
              refuses “{{ REFUSED }}”
            </span>
          </div>
          <VcSortable
            v-model="lists[name]"
            :name="name"
            group="linked"
            :ring="ring"
            :accepts="acceptsIn(name)"
            orientation="horizontal"
            :class="[
              'flex min-h-12 flex-wrap gap-2 rounded-[--vc-radius] border border-dashed p-2',
              refuses(name) ? 'border-danger-500 bg-danger-50' : 'border-neutral-300',
            ]"
            @move="onMove"
            @announce="onAnnounce"
          >
            <template #item="{ item, attrs }">
              <div
                v-bind="attrs"
                :aria-label="'Reorder ' + item"
                class="rounded-[--vc-radius] border border-neutral-300 bg-additional-50 px-3 py-1.5 text-sm outline-offset-2"
              >
                {{ item }}
              </div>
            </template>
          </VcSortable>
        </div>
        <div class="text-xs text-neutral-600" aria-live="polite">{{ message }}</div>
      </div>
    `,
  }),
};

export const Disabled: StoryType = {
  args: { enabled: false },
  parameters: {
    docs: {
      description: {
        story: "While `enabled` is false the list is inert: no drag, no keyboard control, no drag styling.",
      },
    },
  },
  render: WholeItem.render,
};
