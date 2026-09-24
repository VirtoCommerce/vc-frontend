<template>
  <div class="header-account-menu-panel" data-test-id="account-menu">
    <!-- The head is a menu item in its own right: it leads to the dashboard, which is where the
         name chip used to lead, so the entry point into the account is not lost. -->
    <router-link
      to="/account/dashboard"
      class="header-account-menu-panel__head"
      data-test-id="dashboard-link"
      @click="emit('navigate')"
    >
      <span class="header-account-menu-panel__avatar" aria-hidden="true">{{ initials }}</span>

      <span class="header-account-menu-panel__identity">
        <b class="header-account-menu-panel__name">{{ displayName }}</b>

        <span v-if="subtitle" class="header-account-menu-panel__subtitle">{{ subtitle }}</span>
      </span>
    </router-link>

    <!-- Delegated, because AccountNavigationItem has two root nodes and Vue drops a listener bound
         on a fragment. Keyboard activation of a link dispatches `click` too, so this is not a
         mouse-only path. -->
    <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
    <div class="header-account-menu-panel__columns" @click="onRowClick">
      <div v-for="(column, index) in columns" :key="index" class="header-account-menu-panel__column">
        <section v-for="section in column" :key="section.id" class="header-account-menu-panel__group">
          <h3 class="header-account-menu-panel__title">{{ section.title }}</h3>

          <!-- Deliberately NOT through `accountMenu`: that registry is the left rail's, and its
               core entries expand the rail's contextual sub-navigation — every wishlist, every
               order-status facet — which belongs in a full-height column, not in a dropdown. A
               module that wants to customise the row HERE needs its own category; measured on
               /account/orders, wrapping this row pulled two facet rows into the panel. -->
          <AccountNavigationItem
            v-for="link in section.children"
            :key="linkKey(link)"
            :format-text-function="capitalize"
            :item="link"
          />
        </section>
      </div>
    </div>

    <!-- Impersonation and the organization switcher are ours, not the design's: they have nowhere
         else to live, and both end the session they belong to, so they sit with Sign out. -->
    <div class="header-account-menu-panel__footer">
      <button
        v-if="operator"
        type="button"
        class="header-account-menu-panel__row"
        data-test-id="back-to-operator-row"
        @click="emit('backToOperator')"
      >
        <VcIcon name="arrow-left" size="sm" />

        <span class="header-account-menu-panel__row-text">{{ backToOperatorLabel }}</span>
      </button>

      <button
        type="button"
        class="header-account-menu-panel__row header-account-menu-panel__row--danger"
        data-test-id="sign-out-button"
        @click="emit('signOut')"
      >
        <VcIcon name="logout" size="sm" />

        <span class="header-account-menu-panel__row-text">{{ $t("shared.layout.header.link_logout") }}</span>
      </button>
    </div>

    <TopHeaderOrganizations
      v-if="IS_ORGANIZATION_SWITCHER_SHOWN && isMultiOrganization"
      class="header-account-menu-panel__organizations"
      @organization-selected="emit('navigate')"
    />
  </div>
</template>

<script setup lang="ts">
import { capitalize } from "lodash-es";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useImpersonate, useUser } from "@/shared/account";
import { useAccountMenuSections } from "@/shared/account/composables/useAccountMenuSections";
import TopHeaderOrganizations from "./top-header-organizations.vue";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { AccountMenuSectionType } from "@/shared/account/composables/useAccountMenuSections";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

const emit = defineEmits<{
  navigate: [];
  signOut: [];
  backToOperator: [];
}>();

defineProps<IProps>();

interface IProps {
  displayName: string;
  initials: string;
}

/**
 * The organisation switcher is the one block in this panel the design has not drawn. It is the old
 * header's component standing unstyled next to rows that were, so it reads as a different product.
 * Held out rather than deleted: the wiring around it — the multi-organisation guard and the
 * `navigate` emit that closes the panel after a switch — is exactly what has to come back, so
 * turning this to `true` is the whole restore. Flip it when the design arrives.
 */
const IS_ORGANIZATION_SWITCHER_SHOWN = false;

const { user, operator, organization, isMultiOrganization } = useUser();
const { backToOperatorLabel } = useImpersonate();
const { sections } = useAccountMenuSections();
const route = useRoute();

// The design puts "role · company" here. This store knows the company; a role it does not, so the
// line carries the organization for corporate members and the sign-in address for everyone else.
const subtitle = computed(() => organization.value?.name || user.value?.email);

// The design splits the groups down the middle by COUNT, not by height, and takes the larger half
// on the left. Sections are priority-ordered, so this keeps Purchasing at the top left.
const columns = computed<AccountMenuSectionType[][]>(() => {
  const half = Math.ceil(sections.value.length / 2);
  return [sections.value.slice(0, half), sections.value.slice(half)];
});

// The corporate section's two rows are the only ones config/menu.json ships without an `id`, and
// both carry a route — so the route is what tells them apart.
function linkKey(link: ExtendedMenuLinkType): string {
  return link.id ?? JSON.stringify(link.route);
}

// Closing on the navigation alone is not enough: clicking the row for the page you are already on
// is a redundant navigation, which vue-router refuses without touching `currentRoute` — and those
// rows are the highlighted ones, so they invite exactly that click. The click closes the menu; the
// watcher stays for a module row that navigates without one.
function onRowClick(event: MouseEvent): void {
  // A modified click opens the row somewhere else and leaves this page — and this menu — where it
  // was, so it must not dismiss it. Measured: a middle click never reaches here at all (it fires
  // `auxclick`), but cmd/ctrl-click does.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  if ((event.target as HTMLElement).closest("a")) {
    emit("navigate");
  }
}

watch(
  () => route.fullPath,
  () => emit("navigate"),
);
</script>

<style lang="scss">
.header-account-menu-panel {
  // The outline is the design's. The FILL is not here: VcPopover is a positioning primitive whose
  // surface stays transparent until a consumer names one (vc-popover.vue), and it is passed as a
  // prop so the fill, the radius and the shadow all land on the same element.
  @apply flex flex-col rounded-[--vc-radius] border border-neutral-200 p-6;

  // One knob for every hoverable thing in the panel — the rows, the head, Sign out — so dark
  // has a single place to brighten instead of three. The two inks are here rather than inlined at
  // their use site so a fork retints them from one list. See dark/shared/layout/…
  --hover-plate: theme("colors.neutral.100");
  --active-plate: theme("colors.secondary.100");
  --sign-out-ink: theme("colors.danger.700");
  --subtitle-ink: theme("colors.neutral.600");

  // The design pins the width rather than letting the two columns size it: the panel is aligned to
  // the trigger's right edge, so a width that follows its content drags the left edge across the
  // screen for a few frames after it opens. Same reasoning as the preferences panel next to it.
  // vc-header.vue swaps in the mobile header below `lg`, so the panel never renders narrower than
  // 1024px and the two columns always fit; min() is the guard, not a layout.
  inline-size: min(34.5rem, calc(100vw - 2rem));

  // The store decides how many sections there are, and a module may add more.
  max-height: calc(100vh - 7rem);
  overflow-y: auto;

  &__head {
    @apply mb-3 flex w-full items-center gap-3 rounded-[--vc-radius] px-2.5 py-2;

    // Not `inherit`: the panel renders inside the header plate, which paints its own band ink,
    // while the panel's surface comes from the palette. A fork that darkens the header would
    // otherwise put light ink on this white plate.
    color: var(--body-text-color);
    transition: background var(--transition-duration, 0.2s) ease;

    &:hover {
      background: var(--hover-plate);
    }
  }

  &__avatar {
    @apply grid size-10 flex-none place-items-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-800;

    @apply font-geologica tracking-wide;
  }

  &__identity {
    @apply min-w-0;
  }

  &__name {
    @apply block truncate font-bold leading-tight;
  }

  &__subtitle {
    @apply block truncate text-xs leading-snug;

    // Its own knob, because this is the one muted text that can end up on the hover plate (it sits
    // inside the head), where neutral-600 falls under AA in the darker presets.
    color: var(--subtitle-ink);
  }

  &__columns {
    @apply grid grid-cols-2 items-start gap-4;
  }

  &__column {
    @apply flex min-w-0 flex-col gap-4;
  }

  &__group {
    // Each section is its own outlined tile, as the design draws it, instead of the lists running
    // together down one surface with only their titles to separate them.
    @apply rounded-[--vc-radius] border border-neutral-200 p-1 pb-1.5;

    // A nav hover is a neutral tint, so the secondary fill is left to say "you are here" and
    // nothing else — the same pairing the account sidebar uses. BOTH halves are declared here, on
    // one selector: a theme that moves only one of them collapses the pair into a single colour,
    // and scoping them to the tiles keeps them off the organization switcher below.
    --vc-menu-item-hover-bg: var(--hover-plate);
    --vc-menu-item-active-bg: var(--active-plate);
  }

  &__title {
    @apply px-2.5 pb-1.5 pt-2 text-xs font-bold uppercase tracking-wider text-neutral-600;
  }

  &__footer {
    @apply mt-3.5 flex flex-col;
  }

  &__row {
    @apply flex w-full cursor-pointer items-center gap-2 rounded-[--vc-radius] px-2.5 py-2 text-start;

    transition: background var(--transition-duration, 0.2s) ease;

    &:hover {
      background: var(--hover-plate);
    }

    // Sign out is not another section of the account, so it is the one row that carries a colour.
    // Its own knob: measured against the hover plate, danger-700 holds AA in light but not in the
    // darker presets — coffee and watermelon land at 2.55:1 — so dark moves it up the ramp.
    &--danger {
      color: var(--sign-out-ink);
    }
  }

  &__row-text {
    @apply truncate;
  }

  // The switcher draws itself as the flush bottom slab of a popover that had no padding of its own
  // (it is shared with the legacy top header, which still wants exactly that). Bleed it back out to
  // the panel's edges rather than restyling a component two headers depend on.
  &__organizations {
    @apply -mx-6 -mb-6 mt-4;

    // Bleeding it to the edge puts its corners on the panel's for the first time, and its own
    // `rounded-b-md` is half the panel's radius. Restated here rather than in the shared component,
    // which the legacy top header still wants square-cornered.
    border-end-start-radius: var(--vc-radius);
    border-end-end-radius: var(--vc-radius);
  }
}
</style>
