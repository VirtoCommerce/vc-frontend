<template>
  <div class="layout-skeleton">
    <div class="layout-skeleton__stats">
      <!-- The kit's card in its loading state, captioned from the registry: the card it stands in for. -->
      <VcStatWidget v-for="id in statIds" :key="id" :label="titleOf(id)" loading class="layout-skeleton__card" />
    </div>

    <div v-if="fullIds.length" class="layout-skeleton__full">
      <VcWidgetSkeleton v-for="id in fullIds" :key="id" head size="md">
        <div v-for="row in rowsOf(id)" :key="row"></div>
      </VcWidgetSkeleton>
    </div>

    <div class="layout-skeleton__row">
      <!-- Empty divs are the kit's contract for a placeholder line. An empty column is skipped, as in
           layout-surface, and `md` is the size every registered widget renders at. -->
      <div v-for="column in columns" :key="column.name" :class="`layout-skeleton__${column.name}`">
        <VcWidgetSkeleton v-for="id in column.blocks" :key="id" head size="md">
          <div v-for="row in rowsOf(id)" :key="row"></div>
        </VcWidgetSkeleton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { reconcileLayout } from "../../document";
import { getBlock, getBlockRegistry } from "../../registry";

interface IProps {
  scope: string;
}

const props = defineProps<IProps>();

// A short list's height, for a block that names none of its own (`skeletonRows`).
const BLOCK_ROWS = 5;

// A never-saved layout's arrangement: the saved one is exactly what is not known yet.
const defaults = computed(() => reconcileLayout(null, getBlockRegistry(props.scope)).regions);

const statIds = computed(() => defaults.value.statistics.visible);
const fullIds = computed(() => defaults.value.fullWidth.visible);

const { t } = useI18n();
const titleOf = (id: string): string => {
  const titleKey = getBlock(props.scope, id)?.titleKey;
  return titleKey ? t(titleKey) : "";
};

function rowsOf(id: string): number {
  const block = getBlock(props.scope, id);
  return (block && "skeletonRows" in block ? block.skeletonRows : undefined) ?? BLOCK_ROWS;
}

const columns = computed(() =>
  [
    { name: "main", blocks: defaults.value.mainLeft.visible },
    { name: "aside", blocks: defaults.value.mainRight.visible },
  ].filter((column) => column.blocks.length > 0),
);
</script>

<style lang="scss">
// Stands in until the saved document arrives — registry defaults would show a layout that is not the
// user's, then shuffle it.
.layout-skeleton {
  @apply flex flex-col gap-5;

  &__stats {
    @apply flex flex-wrap gap-4;
  }

  // Above the columns, as on the surface.
  &__full {
    @apply flex flex-col gap-5;
  }

  &__row {
    @apply flex flex-col gap-5;

    @media (width >= theme("screens.xl")) {
      @apply flex-row items-start;
    }
  }

  &__main {
    @apply flex min-w-0 flex-1 flex-col gap-5;
  }

  &__aside {
    @apply flex min-w-0 flex-col gap-5;

    @media (width >= theme("screens.xl")) {
      @apply w-[22rem] shrink-0;
    }
  }

  // Wraps like layout-region--horizontal; the card pulses on its own.
  &__card {
    @apply min-w-0 grow basis-44;
  }
}
</style>
