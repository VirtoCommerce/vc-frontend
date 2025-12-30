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

const generateItems = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

export const Vertical: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args, items: generateItems(20) }),
    template: `
      <VcScrollbar v-bind="args" vertical class="h-64">
        <div class="p-2 space-y-2">
          <div v-for="i in items" :key="i" class="p-3 bg-neutral-100 rounded">Item {{ i }}</div>
        </div>
      </VcScrollbar>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcScrollbar vertical class="h-64">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</VcScrollbar>
        `,
      },
    },
  },
};

export const Horizontal: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args, items: generateItems(20) }),
    template: `
      <VcScrollbar v-bind="args" horizontal>
        <div class="flex gap-2 p-2">
          <div v-for="i in items" :key="i" class="flex-none w-32 h-32 bg-neutral-100 rounded flex items-center justify-center">{{ i }}</div>
        </div>
      </VcScrollbar>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcScrollbar horizontal>
  <div class="flex gap-2">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</VcScrollbar>
        `,
      },
    },
  },
};

export const VerticalAndHorizontal: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args }),
    template: `
      <VcScrollbar v-bind="args" vertical horizontal class="h-64">
        <div class="p-2 space-y-2">
          <div v-for="row in 10" :key="row" class="flex gap-2">
            <div v-for="col in 10" :key="col" class="flex-none w-32 h-20 bg-neutral-100 rounded flex items-center justify-center">
              {{ row }}-{{ col }}
            </div>
          </div>
        </div>
      </VcScrollbar>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcScrollbar vertical horizontal class="h-64">
  <!-- Content larger than container -->
</VcScrollbar>
        `,
      },
    },
  },
};

export const HiddenScrollbar: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args, items: generateItems(20) }),
    template: `
      <VcScrollbar v-bind="args" vertical no-bar class="h-64">
        <div class="p-2 space-y-2">
          <div v-for="i in items" :key="i" class="p-3 bg-neutral-100 rounded">Item {{ i }}</div>
        </div>
      </VcScrollbar>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<!-- Scrollable but without visible scrollbar -->
<VcScrollbar vertical no-bar class="h-64">
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</VcScrollbar>
        `,
      },
    },
  },
};

export const CustomColors: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args, items: generateItems(20) }),
    template: `
      <VcScrollbar v-bind="args" vertical class="h-64" track-color="#e0f2fe" thumb-color="#0284c7">
        <div class="p-2 space-y-2">
          <div v-for="i in items" :key="i" class="p-3 bg-neutral-100 rounded">Item {{ i }}</div>
        </div>
      </VcScrollbar>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<VcScrollbar
  vertical
  track-color="#e0f2fe"
  thumb-color="#0284c7"
>
  <!-- content -->
</VcScrollbar>
        `,
      },
    },
  },
};

export const EdgeEvents: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => {
      const items = generateItems(30);
      const events = ref<string[]>([]);

      const logEvent = (name: string) => {
        events.value = [`${name} - ${new Date().toLocaleTimeString()}`, ...events.value.slice(0, 4)];
      };

      return { args, items, events, logEvent };
    },
    template: `
      <div class="flex flex-col gap-4">
        <VcScrollbar
          v-bind="args"
          vertical
          class="h-64 border border-neutral-200 rounded"
          :edge-threshold="20"
          @reach-top="logEvent('reachTop')"
          @reach-bottom="logEvent('reachBottom')"
        >
          <div class="p-2 space-y-2">
            <div v-for="i in items" :key="i" class="p-3 bg-neutral-100 rounded">Item {{ i }}</div>
          </div>
        </VcScrollbar>

        <div class="p-3 bg-neutral-100 rounded text-sm">
          <div class="font-bold mb-2">Events (edgeThreshold: 20px):</div>
          <div v-if="events.length === 0" class="text-neutral-600">Scroll to top/bottom...</div>
          <div v-for="(event, i) in events" :key="i">{{ event }}</div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<script setup lang="ts">
function onReachBottom() {
  // Load more data
}
</script>

<template>
  <VcScrollbar
    vertical
    :edge-threshold="20"
    @reach-bottom="onReachBottom"
  >
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
  </VcScrollbar>
</template>
        `,
      },
    },
  },
};

export const ScrollEvent: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => {
      const scrollInfo = ref<VcScrollbarPayloadType>({
        scrollTop: 0,
        scrollLeft: 0,
        isAtTop: true,
        isAtBottom: false,
        isAtLeft: true,
        isAtRight: false,
      });

      return { args, scrollInfo };
    },
    template: `
      <div class="flex flex-col gap-4">
        <VcScrollbar
          v-bind="args"
          vertical
          horizontal
          class="h-64 border border-neutral-200 rounded"
          @scroll="scrollInfo = $event"
        >
          <div class="p-2 space-y-2">
            <div v-for="row in 15" :key="row" class="flex gap-2">
              <div v-for="col in 10" :key="col" class="flex-none w-32 h-12 bg-neutral-100 rounded flex items-center justify-center">
                {{ row }}-{{ col }}
              </div>
            </div>
          </div>
        </VcScrollbar>

        <div class="p-3 bg-neutral-100 rounded grid grid-cols-2 gap-2 text-sm">
          <div>scrollTop: {{ scrollInfo.scrollTop.toFixed(0) }}px</div>
          <div>isAtTop: <span :class="scrollInfo.isAtTop ? 'text-success-700' : ''">{{ scrollInfo.isAtTop }}</span></div>
          <div>scrollLeft: {{ scrollInfo.scrollLeft.toFixed(0) }}px</div>
          <div>isAtBottom: <span :class="scrollInfo.isAtBottom ? 'text-success-700' : ''">{{ scrollInfo.isAtBottom }}</span></div>
          <div>isAtLeft: <span :class="scrollInfo.isAtLeft ? 'text-success-700' : ''">{{ scrollInfo.isAtLeft }}</span></div>
          <div>isAtRight: <span :class="scrollInfo.isAtRight ? 'text-success-700' : ''">{{ scrollInfo.isAtRight }}</span></div>
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<script setup lang="ts">
const scrollInfo = ref<VcScrollbarPayloadType>();

function onScroll(payload: VcScrollbarPayloadType) {
  scrollInfo.value = payload;
  // payload: { scrollTop, scrollLeft, isAtTop, isAtBottom, isAtLeft, isAtRight }
}
</script>

<template>
  <VcScrollbar vertical horizontal @scroll="onScroll">
    <!-- content -->
  </VcScrollbar>
</template>
        `,
      },
    },
  },
};

export const WithInfiniteScroll: StoryType = {
  render: (args) => ({
    components: { VcScrollbar, VcInfinityScrollLoader },
    setup: () => {
      const items = ref<number[]>(generateItems(15));
      const loading = ref(false);
      const currentPage = ref(1);
      const totalPages = 5;

      const loadMore = async () => {
        if (loading.value || currentPage.value >= totalPages) {
          return;
        }

        loading.value = true;
        await new Promise((resolve) => setTimeout(resolve, 800));

        const start = items.value.length;
        items.value.push(...Array.from({ length: 15 }, (_, i) => start + i + 1));
        currentPage.value++;
        loading.value = false;
      };

      return { args, items, loading, currentPage, totalPages, loadMore };
    },
    template: `
      <div class="flex flex-col gap-4">
        <div class="text-sm text-neutral-600">
          {{ items.length }} items, page {{ currentPage }}/{{ totalPages }}
        </div>

        <VcScrollbar v-bind="args" vertical class="h-64 border border-neutral-200 rounded">
          <div class="p-2 space-y-2">
            <div v-for="item in items" :key="item" class="p-3 bg-neutral-100 rounded">
              Item {{ item }}
            </div>

            <VcInfinityScrollLoader
              :loading="loading"
              :page-number="currentPage"
              :pages-count="totalPages"
              @visible="loadMore"
            />
          </div>
        </VcScrollbar>
      </div>
    `,
  }),
  parameters: {
    docs: {
      source: {
        code: `
<script setup lang="ts">
const items = ref([]);
const loading = ref(false);
const page = ref(1);

async function loadMore() {
  loading.value = true;
  const newItems = await fetchItems(page.value);
  items.value.push(...newItems);
  page.value++;
  loading.value = false;
}
</script>

<template>
  <!-- VcInfinityScrollLoader automatically uses VcScrollbar as viewport -->
  <VcScrollbar vertical class="h-64">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>

    <VcInfinityScrollLoader
      v-if="hasMore"
      :loading="loading"
      :page-number="page"
      :pages-count="totalPages"
      @visible="loadMore"
    />
  </VcScrollbar>
</template>
        `,
      },
    },
  },
};

export const AsCustomElement: StoryType = {
  render: (args) => ({
    components: { VcScrollbar },
    setup: () => ({ args, items: generateItems(10) }),
    template: `
      <VcScrollbar v-bind="args" tag="ul" vertical class="h-64">
        <li v-for="i in items" :key="i" class="p-3 border-b border-neutral-200">List item {{ i }}</li>
      </VcScrollbar>
    `,
  }),
  args: {
    tag: "ul",
  },
  parameters: {
    docs: {
      source: {
        code: `
<!-- Renders as <ul> instead of <div> -->
<VcScrollbar tag="ul" vertical class="h-64">
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</VcScrollbar>
        `,
      },
    },
  },
};
