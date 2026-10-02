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
    disabled: { control: "boolean" },
    liveRegion: { control: "boolean" },
    handle: { control: false, table: { type: { summary: "boolean | string" } } },
    group: { control: "text" },
    name: { control: "text" },
    tag: { control: "text" },
    itemKey: { control: false, table: { type: { summary: "(item: T) => string" } } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Reorders a list by pointer and by keyboard. The layout, the item markup and its look stay the consumer's: bind the slot's `attrs` to the item's single root element and style the container with your own class. Keyboard: Space/Enter grabs and drops, the arrows along `orientation` move, Escape puts the item back, and leaving the item cancels. The list announces each step in its own localized `aria-live` region; `announce` reports each step unlocalized, and `live-region` off hands the wording to you. A keyboard move into another list keeps the item held unless `drop-on-list-change` is set on the list it leaves. `grab` and `release` report a grab by pointer or keyboard. A keyboard-held whole item shows a double focus ring, so it reads apart from a focused one; that ring reaches 8px outside the item (a plain focus ring, 4px), so leave that much room around whole items and do not clip them with `overflow`. The drag states retheme through `--vc-sortable-cursor`, `--vc-sortable-active-cursor`, `--vc-sortable-accent-color`, `--vc-sortable-grabbed-opacity`, `--vc-sortable-grabbed-shadow` (handle mode only) and `--vc-sortable-ghost-opacity`; in development, a mis-bound item or list warns in the console.",
      },
    },
  },
} as Meta<typeof VcSortable>;

export default meta;
type StoryType = StoryObj<typeof meta>;

// For a story that takes the wording over through `announce` with `live-region` off; otherwise the list speaks for itself.
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
      return `Moved ${signal.id} to ${signal.to}${signal.dropped ? " and dropped" : ""}`;
    case "noTarget":
      return "No list in that direction takes it";
  }
}

export const WholeItem: StoryType = {
  args: { orientation: "vertical", disabled: false },
  parameters: {
    docs: {
      description: {
        story:
          "Without a `handle` the whole item drags and is itself the keyboard control. Nothing else is needed for screen readers: the list announces every step itself.",
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
      return { args, items };
    },
    template: `
      <div class="flex flex-col gap-3 max-w-sm">
        <VcSortable
          v-model="items"
          v-bind="args"
          :class="args.orientation === 'horizontal' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'"
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
      </div>
    `,
  }),
};

export const ReorderMode: StoryType = {
  parameters: {
    docs: {
      description: {
        story:
          "A chip is a control of its own, so `disabled` gates a reorder mode: while the list is disabled the chips filter and do not drag; while it is not, the whole chip is the handle and loses its own action.",
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
        <VcSortable v-model="statuses" :disabled="!reordering" orientation="horizontal" class="flex flex-wrap gap-2">
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
      <template v-if="item?.handleAttrs" #prepend>
        <VcButton
          v-bind="item.handleAttrs"
          :aria-label="'Reorder ' + title"
          icon="switch-vertical"
          size="xs"
          variant="ghost"
          color="secondary"
          :style="item.grabbed ? { '--vc-button-ghost-secondary-icon': 'var(--vc-sortable-accent-color)' } : undefined"
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
          "With `handle` only the handle starts a pointer drag and takes the keyboard: a component inside the item picks `handleAttrs` up with `useSortableItem()` and binds it to its own control. The held look is that control's own, here through VcButton's icon variable. A selector instead of `true` adds what it matches to that pointer grip; controls inside it stay clickable when listed in `filter`. A `handle` selector is matched against the item's rendered DOM, so make it name markup your template owns. A class inside another kit component is that component's internal and may change without notice. If you must target one, record the coupling next to the selector and cover it with a test that mounts the real component.",
      },
      source: {
        code: `<!-- Dashboard.vue -->
<template>
  <VcSortable v-model="widgets" handle class="flex flex-col gap-4">
    <template #item="{ item, attrs }">
      <div v-bind="attrs"><MyWidget :title="item" /></div>
    </template>
  </VcSortable>
</template>

<!-- MyWidget.vue -->
<script setup lang="ts">
import { useSortableItem } from "@/ui-kit/composables";

defineProps<{ title: string }>();

const item = useSortableItem(); // undefined outside a VcSortable
</script>

<template>
  <VcWidget :title="title">
    <template v-if="item?.handleAttrs" #prepend>
      <VcButton
        v-bind="item.handleAttrs"
        :aria-label="'Reorder ' + title"
        icon="switch-vertical"
        variant="ghost"
        color="secondary"
        :style="item.grabbed ? { '--vc-button-ghost-secondary-icon': 'var(--vc-sortable-accent-color)' } : undefined"
      />
    </template>
  </VcWidget>
</template>`,
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
        <VcSortable v-model="widgets" handle class="flex flex-col gap-4">
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
  args: { dropOnListChange: false },
  argTypes: { dropOnListChange: { control: "boolean" } },
  parameters: {
    docs: {
      description: {
        story:
          "Lists sharing a `group` exchange items, and `list-order` lets the cross-axis arrows (↑/↓ here) move a grabbed item to the neighbouring list. A move is emitted, never applied: the owner of both arrays applies it. `accepts` is asked on both paths — “archive” refuses “Invoices”, by pointer and by keyboard alike, and the story marks the refusing list from `grab` to `release`. That marking is the consumer's: VcSortable does not dim refusing lists itself. This story turns `live-region` off and listens to `announce` to explain a refusal in its own words. Turn `dropOnListChange` on to end the grab as the item enters the next list.",
      },
    },
  },
  render: (args) => ({
    components: { VcSortable },
    setup() {
      const lists = ref<Record<string, string[]>>({
        shown: ["Orders", "Quotes", "Returns"],
        parked: ["Invoices"],
        archive: [],
      });
      const listOrder = ["shown", "parked", "archive"];
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

      function onAnnounce(signal: SortableSignalType) {
        message.value =
          signal.kind === "noTarget" && signal.id === REFUSED && lists.value.parked.includes(REFUSED)
            ? `No list below takes “${REFUSED}” — “archive” refuses it`
            : describeSignal(signal);
      }

      return { args, lists, listOrder, message, onMove, acceptsIn, refuses, held, onAnnounce, REFUSED };
    },
    template: `
      <div class="flex flex-col gap-4">
        <div v-for="name in listOrder" :key="name" class="flex flex-col gap-1">
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
            :list-order="listOrder"
            :accepts="acceptsIn(name)"
            orientation="horizontal"
            :live-region="false"
            :drop-on-list-change="args.dropOnListChange"
            :class="[
              'flex min-h-12 flex-wrap gap-2 rounded-[--vc-radius] border border-dashed p-2',
              refuses(name) ? 'border-danger-500 bg-danger-50' : 'border-neutral-300',
            ]"
            @move="onMove"
            @announce="onAnnounce"
            @grab="held = $event.id"
            @release="held = undefined"
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
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story: "While `disabled` the list is inert: no drag, no keyboard control, no drag styling.",
      },
    },
  },
  render: WholeItem.render,
};
