<template>
  <div class="layout-stats">
    <div v-if="editing" :id="`${scope}-visible-stats`" class="layout-stats__label">
      {{ t("sales_rep.hub.layout.visible_stats") }}
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
      :empty-text="t('sales_rep.hub.layout.empty_visible')"
      @reorder="$emit('reorder', $event)"
      @set-hidden="(id, hidden, index) => $emit('setHidden', id, hidden, index)"
      @announce="$emit('announce', $event)"
    >
      <template #default="{ id }">
        <StatWidget v-if="cardOf(id)" v-bind="cardProps(id)">
          <template v-if="editing" #leading>
            <!-- Decorative: the card itself is the control, so this must not be announced twice. -->
            <span class="layout-stats__handle" aria-hidden="true">
              <VcIcon name="switch-vertical" :size="16" />
            </span>
          </template>
        </StatWidget>
      </template>
    </LayoutRegion>

    <template v-if="editing">
      <div :id="`${scope}-parked-stats`" class="layout-stats__label layout-stats__label--parked">
        <VcIcon name="eye-off" :size="14" />
        {{ t("sales_rep.hub.layout.hidden_stats") }}
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
        :empty-text="t('sales_rep.hub.layout.empty_hidden')"
        @reorder="$emit('reorderHidden', $event)"
        @set-hidden="(id, isHidden, index) => $emit('setHidden', id, isHidden, index)"
        @announce="$emit('announce', $event)"
      >
        <template #default="{ id }">
          <StatWidget v-if="cardOf(id)" v-bind="cardProps(id)">
            <template v-if="editing" #leading>
              <!-- Decorative: the card itself is the control, so this must not be announced twice. -->
              <span class="layout-stats__handle" aria-hidden="true">
                <VcIcon name="switch-vertical" :size="16" />
              </span>
            </template>
          </StatWidget>
        </template>
      </LayoutRegion>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LayoutRegion from "./layout-region.vue";
import StatWidget from "./stat-widget.vue";
import type { KeyboardSortSignalType, SalesRepLayoutScopeType } from "../types/layout";
import type { StatWidgetCardType } from "../types/widgets";

interface IProps {
  scope: SalesRepLayoutScopeType;
  visible: readonly string[];
  hidden: readonly string[];
  /** Cards from the surface's statistics composable, matched to layout ids by `key`. */
  cards: readonly StatWidgetCardType[];
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
const group = computed(() => `sales-rep-stats-${props.scope}`);

// Keyed lookup rather than a find per card: the row re-renders on every drag step.
const byKey = computed(() => new Map(props.cards.map((card) => [card.key, card])));

const cardOf = (id: string) => byKey.value.get(id);

// Explicit, not spread: `key` and `labelKey` are not StatWidget props and would leak onto its root.
// Total return keeps the required props non-optional; the template's `v-if` skips an unknown id.
function cardProps(id: string) {
  const card = cardOf(id);
  return {
    label: card ? t(card.labelKey) : id,
    value: card?.value ?? "",
    icon: card?.icon ?? "",
    accent: card?.accent,
    sub: card?.sub,
    delta: card?.delta,
    deltaTone: card?.deltaTone,
    deltaIcon: card?.deltaIcon,
    // Per card, not per row: each is fed by exactly one statistics query (VCST-5586), so a slow or
    // failed query must only mark its own cards.
    loading: card?.loading,
    errorText: card?.failed ? t("sales_rep.hub.dashboard.stats.load_failed") : "",
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

  // Decorative only — the card itself is the control. Inside `.stat-widget`, so it inherits
  // `--stat-widget-accent` and matches the card's edge bar.
  &__handle {
    @apply -me-0.5 inline-flex;

    color: var(--stat-widget-accent);
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
