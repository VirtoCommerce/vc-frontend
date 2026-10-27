<template>
  <div class="vc-record-card" :class="{ 'vc-record-card--link': isLink, 'vc-record-card--disabled': disabled }">
    <div class="vc-record-card__head">
      <div v-if="$slots.lead || initials" class="vc-record-card__lead">
        <slot name="lead">
          <VcBadge
            class="vc-record-card__initials"
            color="neutral"
            variant="soft"
            size="lg"
            rounded
            square
            nowrap
            aria-hidden="true"
          >
            {{ initials }}
          </VcBadge>
        </slot>
      </div>

      <div class="vc-record-card__identity">
        <slot name="title">
          <component :is="titleTag" v-bind="titleAttrs" class="vc-record-card__title" @click="onTitleClick">
            {{ title }}
          </component>
        </slot>

        <slot name="subtitle" />
      </div>

      <!-- Actions never reach a click/Enter handler bound to the whole card. -->
      <div v-if="$slots.actions || $slots.menu" class="vc-record-card__actions" @click.stop @keydown.enter.stop>
        <slot name="actions">
          <VcDropdownMenu placement="bottom-end" :disabled="disabled">
            <template #trigger="{ triggerProps }">
              <VcButton
                class="vc-record-card__menu-button"
                :aria-label="menuLabel || $t('ui_kit.labels.actions')"
                :disabled="disabled"
                icon="ellipsis-vertical"
                color="secondary"
                variant="ghost"
                size="xs"
                v-bind="triggerProps"
              />
            </template>

            <template #content="{ close }">
              <slot name="menu" :close="close" />
            </template>
          </VcDropdownMenu>
        </slot>
      </div>
    </div>

    <div v-if="hasContext" class="vc-record-card__context">
      <div class="vc-record-card__description">
        <slot name="description">{{ description }}</slot>
      </div>

      <div v-if="hasMetric" class="vc-record-card__metric">
        <slot name="metric">{{ metric }}</slot>
      </div>
    </div>

    <div v-if="$slots.default" class="vc-record-card__content">
      <slot />
    </div>

    <div v-if="hasFooter" class="vc-record-card__footer">
      <div class="vc-record-card__meta">
        <slot name="meta-content">
          <span v-for="(item, index) in meta" :key="index" class="vc-record-card__meta-item" :title="item.text">
            <VcIcon v-if="item.icon" class="vc-record-card__meta-icon" :name="item.icon" />

            <span class="vc-record-card__meta-text">{{ item.text }}</span>
          </span>
        </slot>
      </div>

      <div v-if="$slots.status" class="vc-record-card__status" @click.stop @keydown.enter.stop>
        <slot name="status" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePopoverHostTeleport } from "@/ui-kit/composables";
import type { RouteLocationRaw } from "vue-router";

interface IEmits {
  (event: "titleClick", value: MouseEvent): void;
}

interface IProps {
  /** Primary identifier (Row A). Rendered as an accent link when `to` or `externalLink` is set. */
  title?: string | number; // eslint-disable-line sonarjs/no-redundant-optional -- false positive on any optional union
  /** Makes the title a `router-link`; the whole card becomes its click target. */
  to?: RouteLocationRaw | null;
  /** Makes the title an `<a href>`; the whole card becomes its click target. */
  externalLink?: string;
  /** Applies to `to` and `externalLink`; `_blank` adds `rel="noopener noreferrer"`. */
  target?: "_self" | "_blank";
  /** Secondary line on the left of Row B (date, email, description). */
  description?: string;
  /** Headline number on the right of Row B (total, amount). */
  metric?: string | number; // eslint-disable-line sonarjs/no-redundant-optional -- false positive on any optional union
  /** Up to two icon + text items in Row C; the longest one truncates. */
  meta?: VcRecordCardMetaItemType[];
  /** Accessible name of the ⋮ menu button. */
  menuLabel?: string;
  /** One or two letters shown in a round avatar as the lead (people, organizations). The `lead` slot replaces it. */
  initials?: string;
  disabled?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  to: null,
  meta: () => [],
});

const slots = defineSlots<{
  /** Optional leading element of Row A (unread dot, icon); replaces the `initials` avatar. */
  lead?: () => unknown;
  /** Replaces the whole title element, link included (e.g. a button that opens an editor). */
  title?: () => unknown;
  /** Extra line under the title inside Row A. */
  subtitle?: () => unknown;
  /** Replaces the ⋮ menu with custom actions. */
  actions?: () => unknown;
  /** `VcMenuItem`s of the ⋮ menu; `close` closes it. */
  menu?: (scope: { close: () => void }) => unknown;
  /** Replaces the `description` text (Row B, left). */
  description?: () => unknown;
  /** Replaces the `metric` text (Row B, right). */
  metric?: () => unknown;
  /** Free content between Row B and the divider. */
  default?: () => unknown;
  /** Replaces the `meta` items (Row C, left). */
  "meta-content"?: () => unknown;
  /** Status chip pinned to the end of Row C. */
  status?: () => unknown;
}>();

// Menus inside the card (its own ⋮ and any dropdown passed to #actions/#status) float in the app-level
// popover host: rendered in place they are sized by the narrow actions column and painted under the next card.
usePopoverHostTeleport();

const titleTag = computed(() => {
  if (props.disabled) {
    return "span";
  }

  if (props.to) {
    return "router-link";
  }

  if (props.externalLink) {
    return "a";
  }

  return "span";
});

const isLink = computed(() => titleTag.value !== "span");

const titleAttrs = computed(() => {
  if (!isLink.value) {
    return {};
  }

  return {
    ...(titleTag.value === "router-link" ? { to: props.to } : { href: props.externalLink }),
    target: props.target,
    rel: props.target === "_blank" ? "noopener noreferrer" : undefined,
  };
});

// `0` is a valid metric (a zero balance), so only nullish and empty values hide it.
const hasMetric = computed(() => !!slots.metric || (props.metric != null && props.metric !== ""));

const hasContext = computed(() => !!slots.description || !!props.description || hasMetric.value);

const hasFooter = computed(() => !!slots["meta-content"] || props.meta.length > 0 || !!slots.status);

function onTitleClick(event: MouseEvent): void {
  if (isLink.value) {
    emit("titleClick", event);
  }
}
</script>

<style lang="scss">
.vc-record-card {
  $link: "";
  $disabled: "";

  --radius: var(--vc-record-card-radius, var(--vc-radius, 0.5rem));
  --padding: var(--vc-record-card-padding, 0.875rem);
  --bg-color: var(--vc-record-card-bg-color, var(--color-additional-50));
  --border-color: var(--vc-record-card-border-color, var(--color-neutral-200));
  --divider-color: var(--vc-record-card-divider-color, var(--color-neutral-200));
  --menu-icon-size: var(--vc-record-card-menu-icon-size, 1.25rem);

  @apply relative flex w-full min-w-0 flex-col gap-1.5 rounded-[--radius] border border-[--border-color] bg-[--bg-color] p-[--padding] text-start text-sm;

  &--disabled {
    $disabled: &;

    @apply opacity-60;
  }

  &--link {
    $link: &;

    &:hover {
      @apply shadow-md;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    @apply transition-shadow;
  }

  &__head {
    @apply flex min-w-0 items-center gap-2.5;
  }

  &__lead {
    @apply flex flex-none items-center;
  }

  &__initials {
    --vc-badge-size: var(--vc-record-card-initials-size, 2rem);
    --vc-badge-font-size: var(--vc-record-card-initials-font-size, theme("fontSize.xs"));
    --vc-badge-soft-neutral-bg: var(--vc-record-card-initials-bg-color, var(--color-neutral-200));
    --vc-badge-soft-neutral-border: var(--vc-record-card-initials-bg-color, var(--color-neutral-200));
    --vc-badge-soft-neutral-text: var(--vc-record-card-initials-text-color, var(--color-neutral-800));
  }

  &__identity {
    @apply flex min-w-0 grow flex-col;
  }

  &__title {
    @apply truncate text-sm font-bold text-neutral-950;

    #{$link} & {
      @apply text-[--link-color] no-underline;

      // Stretched link: the whole card is the click target, the accessible name stays the title.
      &::after {
        @apply absolute inset-0 z-[1] rounded-[inherit];

        content: "";
      }

      &:hover {
        @apply text-[--link-hover-color];
      }
    }
  }

  &__actions {
    // The ⋮ trigger (ours or a dropdown passed to #actions) reads this VcButton token.
    --vc-button-icon-size: var(--menu-icon-size);

    @apply relative z-[2] -my-1 -me-1.5 flex flex-none items-center;
  }

  &__context {
    @apply flex min-w-0 items-baseline justify-between gap-3;
  }

  &__description {
    @apply min-w-0 grow text-xs text-neutral-600 [word-break:break-word];
  }

  &__metric {
    @apply flex-none text-end text-base font-bold text-neutral-950;
  }

  &__content {
    @apply relative z-[2] min-w-0 text-xs text-neutral-700;
  }

  &__footer {
    @apply mt-1 flex min-w-0 items-center justify-between gap-3 border-t border-[--divider-color] pt-2.5;
  }

  &__meta {
    @apply flex min-w-0 grow items-center gap-x-3 text-xs text-neutral-600;
  }

  &__meta-item {
    @apply flex min-w-0 items-center gap-1;

    // The first item (name, address, organization) gives way first; the short trailing one stays readable.
    &:not(:first-child) {
      @apply max-w-[50%] shrink-0;
    }
  }

  &__meta-icon {
    --vc-icon-size: var(--vc-record-card-meta-icon-size, 0.875rem);
    --vc-icon-color: var(--vc-record-card-meta-icon-color, var(--color-neutral-500));

    @apply flex-none;
  }

  &__meta-text {
    @apply truncate;
  }

  &__status {
    @apply relative z-[2] flex flex-none items-center gap-1.5;
  }
}
</style>
