import { ref } from "vue";
import { VcScrollbar, VcInfinityScrollLoader } from "..";
import type { Meta, StoryObj } from "@storybook/vue3-vite";

export default {
  title: "Components/Atoms/VcScrollbar",
  component: VcScrollbar,
  argTypes: {
    vertical: { control: "boolean" },
    horizontal: { control: "boolean" },
    disabled: { control: "boolean" },
    noBar: { control: "boolean" },
    tag: { control: "text" },
    trackColor: { control: "color" },
    thumbColor: { control: "color" },
    edgeThreshold: { control: { type: "number", min: 0, max: 100 } },
  },
} as Meta<typeof VcScrollbar>;

type StoryType = StoryObj<typeof VcScrollbar>;

const defaultTemplate = `
  <VcScrollbar v-bind="args">
    <div class="flex gap-3">
      <div v-for="i in 100" class="flex-none w-32 h-32 bg-neutral-300 rounded"></div>
    </div>
    <div class="flex gap-3 mt-3">
      <div v-for="i in 100" class="flex-none w-32 h-32 bg-neutral-300 rounded"></div>
    </div>
    <div class="flex gap-3 mt-3">
      <div v-for="i in 100" class="flex-none w-32 h-32 bg-neutral-300 rounded"></div>
    </div>
  </VcScrollbar>
`;

export const Basic: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
};

export const Vertical: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
  args: {
    vertical: true,
    class: "h-44",
  },
};

export const Horizontal: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
  args: {
    horizontal: true,
  },
};

export const VerticalHorizontal: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
  args: {
    class: "h-44",
    vertical: true,
    horizontal: true,
  },
};

export const Disabled: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
  args: {
    class: "h-44",
    vertical: true,
    horizontal: true,
    disabled: true,
  },
};

export const NoBar: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
  args: {
    class: "h-44",
    vertical: true,
    horizontal: true,
    noBar: true,
  },
};

export const CustomColors: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: defaultTemplate,
  }),
  args: {
    class: "h-44",
    vertical: true,
    horizontal: true,
    trackColor: "#e0f2fe",
    thumbColor: "#0284c7",
  },
};

export const WithEvents: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => {
      const events = ref<string[]>([]);

      const addEvent = (name: string) => {
        events.value = [`${name} - ${new Date().toLocaleTimeString()}`, ...events.value.slice(0, 9)];
      };

      return { args, events, addEvent };
    },
    template: `
      <div class="flex flex-col gap-4">
        <VcScrollbar
          v-bind="args"
          class="h-44 border border-neutral-200 rounded"
          vertical
          horizontal
          :edge-threshold="20"
          @reach-top="addEvent('reachTop')"
          @reach-bottom="addEvent('reachBottom')"
          @reach-left="addEvent('reachLeft')"
          @reach-right="addEvent('reachRight')"
        >
          <div class="flex gap-3">
            <div v-for="i in 50" :key="i" class="flex-none w-32 h-32 bg-neutral-300 rounded flex items-center justify-center">{{ i }}</div>
          </div>
          <div class="flex gap-3 mt-3">
            <div v-for="i in 50" :key="i" class="flex-none w-32 h-32 bg-neutral-300 rounded flex items-center justify-center">{{ i + 50 }}</div>
          </div>
          <div class="flex gap-3 mt-3">
            <div v-for="i in 50" :key="i" class="flex-none w-32 h-32 bg-neutral-300 rounded flex items-center justify-center">{{ i + 100 }}</div>
          </div>
        </VcScrollbar>

        <div class="p-3 bg-neutral-100 rounded">
          <div class="text-sm font-bold mb-2">Events log (edgeThreshold: 20px):</div>
          <div v-if="events.length === 0" class="text-neutral-600 text-sm">Scroll to trigger events...</div>
          <div v-for="(event, index) in events" :key="index" class="text-sm">{{ event }}</div>
        </div>
      </div>
    `,
  }),
};

export const ScrollPayload: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => {
      const scrollInfo = ref({
        scrollTop: 0,
        scrollLeft: 0,
        isAtTop: true,
        isAtBottom: false,
        isAtLeft: true,
        isAtRight: false,
      });

      const onScroll = (payload: VcScrollbarPayloadType) => {
        scrollInfo.value = payload;
      };

      return { args, scrollInfo, onScroll };
    },
    template: `
      <div class="flex flex-col gap-4">
        <VcScrollbar
          v-bind="args"
          class="h-44 border border-neutral-200 rounded"
          vertical
          horizontal
          @scroll="onScroll"
        >
          <div class="flex gap-3">
            <div v-for="i in 50" :key="i" class="flex-none w-32 h-32 bg-neutral-300 rounded flex items-center justify-center">{{ i }}</div>
          </div>
          <div class="flex gap-3 mt-3">
            <div v-for="i in 50" :key="i" class="flex-none w-32 h-32 bg-neutral-300 rounded flex items-center justify-center">{{ i + 50 }}</div>
          </div>
          <div class="flex gap-3 mt-3">
            <div v-for="i in 50" :key="i" class="flex-none w-32 h-32 bg-neutral-300 rounded flex items-center justify-center">{{ i + 100 }}</div>
          </div>
        </VcScrollbar>

        <div class="p-3 bg-neutral-100 rounded grid grid-cols-2 gap-2 text-sm">
          <div>scrollTop: {{ scrollInfo.scrollTop.toFixed(0) }}px</div>
          <div>scrollLeft: {{ scrollInfo.scrollLeft.toFixed(0) }}px</div>
          <div>isAtTop: <span :class="scrollInfo.isAtTop ? 'text-success-700' : 'text-neutral-600'">{{ scrollInfo.isAtTop }}</span></div>
          <div>isAtBottom: <span :class="scrollInfo.isAtBottom ? 'text-success-700' : 'text-neutral-600'">{{ scrollInfo.isAtBottom }}</span></div>
          <div>isAtLeft: <span :class="scrollInfo.isAtLeft ? 'text-success-700' : 'text-neutral-600'">{{ scrollInfo.isAtLeft }}</span></div>
          <div>isAtRight: <span :class="scrollInfo.isAtRight ? 'text-success-700' : 'text-neutral-600'">{{ scrollInfo.isAtRight }}</span></div>
        </div>
      </div>
    `,
  }),
};

export const WithInfinityScrollLoader: StoryType = {
  render: (args) => ({
    components: { VcScrollbar, VcInfinityScrollLoader },
    setup: () => {
      const items = ref<number[]>(Array.from({ length: 20 }, (_, i) => i + 1));
      const loading = ref(false);
      const currentPage = ref(1);
      const pagesCount = 5;

      const loadMore = async () => {
        if (loading.value || currentPage.value >= pagesCount) return;

        loading.value = true;
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const start = items.value.length;
        items.value.push(...Array.from({ length: 20 }, (_, i) => start + i + 1));
        currentPage.value++;
        loading.value = false;
      };

      return { args, items, loading, currentPage, pagesCount, loadMore };
    },
    template: `
      <div class="flex flex-col gap-4">
        <div class="text-sm">Scroll down to load more items ({{ items.length }} items, page {{ currentPage }}/{{ pagesCount }})</div>

        <VcScrollbar
          v-bind="args"
          class="h-64 border border-neutral-200 rounded"
          vertical
        >
          <div class="p-2 space-y-2">
            <div
              v-for="item in items"
              :key="item"
              class="p-3 bg-neutral-100 rounded"
            >
              Item {{ item }}
            </div>

            <VcInfinityScrollLoader
              v-if="currentPage < pagesCount"
              :loading="loading"
              distance="50"
              @visible="loadMore"
            />
          </div>
        </VcScrollbar>
      </div>
    `,
  }),
};
