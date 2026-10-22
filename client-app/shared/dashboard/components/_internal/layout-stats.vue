<template>
  <div class="layout-stats">
    <div v-if="editing" :id="`${scope}-visible-stats`" class="layout-stats__label">
      {{ t("shared.dashboard.visible_stats") }}
    </div>

    <!-- Always mounted, so its Sortable instance is built once and toggled. Labelled while editing —
         both zones name their cards "Reorder {title}", so the zone is all that tells them apart. -->
    <LayoutRegion
      :role="editing ? 'group' : undefined"
      :aria-labelledby="editing ? `${scope}-visible-stats` : undefined"
      :scope="scope"
      :entries="visible"
      orientation="horizontal"
      drag-whole
      :group="group"
      :editing="editing"
      zone
      :drop-hidden="false"
      :empty-text="t('shared.dashboard.empty_visible')"
      @reorder="$emit('reorder', $event)"
      @set-hidden="(id, hidden, index) => $emit('setHidden', id, hidden, index)"
      @announce="$emit('announce', $event)"
    >
      <template #default="{ id }">
        <VcStatWidget v-if="propsById[id]" v-bind="propsById[id]">
          <template v-if="editing" #prepend>
            <!-- Decorative: the card itself is the control, so this must not be announced twice. -->
            <span class="layout-stats__handle" aria-hidden="true">
              <VcIcon name="switch-vertical" :size="16" />
            </span>
          </template>
        </VcStatWidget>
      </template>
    </LayoutRegion>

    <template v-if="editing">
      <div :id="`${scope}-parked-stats`" class="layout-stats__label layout-stats__label--parked">
        <VcIcon name="eye-off" :size="14" />
        {{ t("shared.dashboard.hidden_stats") }}
      </div>

      <LayoutRegion
        role="group"
        :aria-labelledby="`${scope}-parked-stats`"
        class="layout-stats__parked-zone"
        :scope="scope"
        :entries="hidden"
        orientation="horizontal"
        drag-whole
        :group="group"
        editing
        zone
        drop-hidden
        :empty-text="t('shared.dashboard.empty_hidden')"
        @reorder="$emit('reorderHidden', $event)"
        @set-hidden="(id, isHidden, index) => $emit('setHidden', id, isHidden, index)"
        @announce="$emit('announce', $event)"
      >
        <template #default="{ id }">
          <VcStatWidget v-if="propsById[id]" v-bind="propsById[id]">
            <template #prepend>
              <!-- Decorative: the card itself is the control, so this must not be announced twice. -->
              <span class="layout-stats__handle" aria-hidden="true">
                <VcIcon name="switch-vertical" :size="16" />
              </span>
            </template>
          </VcStatWidget>
        </template>
      </LayoutRegion>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LayoutRegion from "./layout-region.vue";
import type { KeyboardSortSignalType, StatCardType, StatDeltaToneType } from "../../types";

interface IProps {
  scope: string;
  visible: readonly string[];
  hidden: readonly string[];
  /** Cards from the page's statistics composables, matched to layout ids by `key`. */
  cards: readonly StatCardType[];
  editing?: boolean;
}

interface IEmits {
  (event: "reorder" | "reorderHidden", ids: string[]): void;
  (event: "setHidden", id: string, hidden: boolean, index?: number): void;
  (event: "announce", signal: KeyboardSortSignalType): void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();

// One group name per surface, shared by both zones — that shared name is what makes a card
// draggable from visible to hidden and back.
const group = computed(() => `layout-stats-${props.scope}`);

// Keyed by id and built once per cards change, not per lookup: the row re-renders on every drag step. The
// template's `v-if` skips an id with no card.
const propsById = computed(() => Object.fromEntries(props.cards.map((card) => [card.key, cardProps(card)])));

// A rise reads as good news, a fall as bad; the widget only knows colors.
const DELTA_COLORS: Record<StatDeltaToneType, VcStatWidgetColorType> = {
  positive: "success",
  negative: "danger",
  neutral: "neutral",
};

// Explicit, not spread: `key` and `labelKey` are not VcStatWidget props and would leak onto its root.
function cardProps(card: StatCardType) {
  return {
    label: t(card.labelKey),
    value: card.value,
    valueSuffix: card.valueSuffix,
    icon: card.icon,
    color: card.color,
    description: card.sub,
    delta: card.delta,
    deltaColor: DELTA_COLORS[card.deltaTone ?? "positive"],
    deltaIcon: card.deltaIcon,
    // Per card, not per row: each is fed by exactly one statistics query (VCST-5586), so a slow or
    // failed query must only mark its own cards.
    loading: card.loading,
    errorText: card.failed ? t("shared.dashboard.stats.load_failed") : "",
  };
}
</script>

<style lang="scss">
.layout-stats {
  // Zone frames are painted 12px outside their box, so the gap has to clear that band before it reads
  // as space: 20px here plus the label's 4px margin leaves the same 12px the padded frame used to.
  @apply flex flex-col gap-5;

  &__label {
    @apply mt-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500;

    &--parked {
      @apply text-neutral-400;
    }
  }

  // Decorative only — the card itself is the control. The widget's `prepend` slot paints it in the card's
  // accent, so it matches the edge bar.
  &__handle {
    @apply -me-0.5 inline-flex;
  }

  // Hatching marks the zone as set aside; the cards in it stay rendered and draggable.
  &__parked-zone {
    @apply opacity-70;

    background: repeating-linear-gradient(
      45deg,
      var(--color-neutral-50),
      var(--color-neutral-50) 9px,
      var(--color-neutral-100) 9px,
      var(--color-neutral-100) 18px
    );
  }
}
</style>
