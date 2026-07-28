<template>
  <div class="layout-stats">
    <p v-if="editing" :id="`${scope}-visible-stats`" class="layout-stats__label">
      {{ t("sales_rep.hub.layout.visible_stats") }}
    </p>

    <!--
      Always mounted, so its Sortable instance is created once and merely enabled/disabled as edit
      mode flips. The hidden zone below only exists while editing, which is when it can be a target.

      Grouped and labelled while editing: both zones name their cards "Reorder {title}", so without
      this a screen reader cannot tell a parked card from a visible one.
    -->
    <LayoutRegion
      :role="editing ? 'group' : undefined"
      :aria-labelledby="editing ? `${scope}-visible-stats` : undefined"
      :scope="scope"
      :entries="visible"
      orientation="horizontal"
      drag-whole
      :group="group"
      :editing="editing"
      :zone="editing"
      :drop-hidden="false"
      :empty-text="t('sales_rep.hub.layout.empty_visible')"
      @reorder="$emit('reorder', $event)"
      @set-hidden="(id, hidden, index) => $emit('setHidden', id, hidden, index)"
      @announce="$emit('announce', $event)"
    >
      <template #default="{ entry }">
        <StatWidget v-if="cardOf(entry.id)" v-bind="cardProps(entry.id)">
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
      <p :id="`${scope}-hidden-stats`" class="layout-stats__label layout-stats__label--hidden">
        <VcIcon name="eye-off" :size="14" />
        {{ t("sales_rep.hub.layout.hidden_stats") }}
      </p>

      <LayoutRegion
        role="group"
        :aria-labelledby="`${scope}-hidden-stats`"
        class="layout-stats__hidden"
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
        <template #default="{ entry }">
          <StatWidget v-if="cardOf(entry.id)" v-bind="cardProps(entry.id)">
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
import { getStatCard } from "../layout/stat-cards";
import LayoutRegion from "./layout-region.vue";
import StatWidget from "./stat-widget.vue";
import type { KeyboardSortSignalType, SalesRepLayoutEntryType, SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
  visible: SalesRepLayoutEntryType[];
  hidden: SalesRepLayoutEntryType[];
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

const cardOf = (id: string) => getStatCard(props.scope, id);

// Built explicitly rather than spread: `key` and `labelKey` are not StatWidget props and would
// otherwise leak onto its root element as stray attributes. The return stays total so the required
// props keep their non-optional types — the template's `v-if` is what skips an unknown id, which
// only happens if a registry block and its card data disagree.
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
  };
}
</script>

<style lang="scss">
.layout-stats {
  @apply flex flex-col gap-2;

  &__label {
    @apply m-0 mt-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500;

    &--hidden {
      @apply text-neutral-400;
    }
  }

  // Sits ahead of the card's accent icon and only signals "this is draggable" — the card is the
  // control, so this stays decorative and out of the accessibility tree. It renders inside
  // `.stat-widget` via the leading slot, so it inherits `--stat-widget-accent` and picks up the same
  // colour as the card's edge bar and title icon, per the design.
  &__handle {
    @apply -me-0.5 inline-flex;

    color: var(--stat-widget-accent);
  }

  // Diagonal hatching marks the parked zone as inert without hiding what is in it.
  &__hidden {
    @apply opacity-70;

    background: repeating-linear-gradient(
      45deg,
      var(--color-neutral-50),
      var(--color-neutral-50) 9px,
      var(--color-neutral-100) 9px,
      var(--color-neutral-100) 18px
    );

    .stat-widget {
      @apply bg-additional-50;
    }
  }
}
</style>
