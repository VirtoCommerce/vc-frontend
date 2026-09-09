<template>
  <VcCalendar
    :model-value="modelValue"
    :month="month"
    :size="size"
    :day-descriptions="dayDescriptions"
    @update:model-value="onSelect"
    @update:month="$emit('update:month', $event)"
  >
    <!--
      Decoration only: the accessible half is `dayDescriptions`, which VcCalendar wires to the cell as
      aria-describedby. Slot content cannot do that job — reka puts an explicit aria-label (the full date) on
      the cell trigger, so anything rendered in here is excluded from the accessible name.
    -->
    <template #day="{ date }">
      <span v-if="dots[date]" class="sales-rep-task-calendar__dots" aria-hidden="true">
        <span
          v-for="kind in dots[date]"
          :key="kind"
          :class="`sales-rep-task-calendar__dot sales-rep-task-calendar__dot--${kind}`"
        />
      </span>
    </template>
  </VcCalendar>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { TASK_MARKER_KINDS } from "../tasks";
import type { SalesRepTaskDayMarkersType } from "../types/tasks";

interface IProps {
  /** Selected day, ISO "YYYY-MM-DD". Omit for no selection at all. */
  modelValue?: string;
  /** Displayed month, ISO "YYYY-MM-01" — controlled, so the dots query and the grid cannot drift apart. */
  month?: string;
  /** ISO day → the conditions present on it. A kind means "at least one", never a count. */
  dayMarkers?: SalesRepTaskDayMarkersType;
  size?: VcCalendarSizeType;
}

const emit = defineEmits<{
  (event: "update:modelValue", day: string): void;
  (event: "update:month", month: string): void;
}>();

const props = withDefaults(defineProps<IProps>(), {
  modelValue: undefined,
  month: undefined,
  dayMarkers: undefined,
  size: "md",
});

const { t } = useI18n();

/**
 * Which dots each day gets, resolved once per data change rather than per cell — a fixed-weeks grid asks 42 times.
 * Normalising through the shared TASK_MARKER_KINDS keeps the dots, the legend and buildDayMarkers in one order, and
 * drops any kind that has no colour (a canceled task earns no dot).
 */
const dots = computed<SalesRepTaskDayMarkersType>(() => {
  const result: SalesRepTaskDayMarkersType = {};

  for (const [date, kinds] of Object.entries(props.dayMarkers ?? {})) {
    const shown = TASK_MARKER_KINDS.filter((kind) => kinds.includes(kind));
    if (shown.length) {
      result[date] = shown;
    }
  }

  return result;
});

// The screen-reader counterpart of the dots. Named rather than a bare list ("Upcoming, Overdue" alone, read
// straight after the date, sounds like a property of the date).
const dayDescriptions = computed<Record<string, string>>(() => {
  const result: Record<string, string> = {};

  for (const [date, kinds] of Object.entries(dots.value)) {
    result[date] = t("sales_rep.tasks.day_markers", {
      kinds: kinds.map((kind) => t(`sales_rep.tasks.legend.${kind}`)).join(", "),
    });
  }

  return result;
});

// VcCalendar can clear its selection; these surfaces always show some day, so a clear is ignored rather than
// leaving the list with nothing to scope to.
function onSelect(day: string | undefined): void {
  if (day) {
    emit("update:modelValue", day);
  }
}
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.sales-rep-task-calendar {
  &__dots {
    // .vc-calendar__day is position:relative, so the row sits under the number without shifting the grid.
    @apply pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-0.5;

    line-height: 0;
  }

  &__dot {
    @apply size-1 rounded-full;

    // Shades chosen for DISCRIMINATION, and kept in lockstep with the page legend.
    // The ramps come from the store's theme settings; the darker steps desaturate towards a common grey
    // (info-700 #325c76 vs success-700 #316144), so -700 was unusable. But -500 was not enough either:
    // info-500 and success-500 land on the SAME luminance (4.51:1 on white each), leaving hue as the only
    // cue — which is precisely what made the blue and green dots hard to tell apart. Green therefore drops a
    // step to -400 (#5bae7e), separating it on lightness and saturation as well as hue.
    &--upcoming {
      background-color: var(--color-info-500);
    }

    &--overdue {
      background-color: var(--color-danger-500);
    }

    // -400 sits below the 3:1 guideline for a meaningful graphic (2.69:1). Acceptable here because the dots are
    // aria-hidden decoration with a full text equivalent on the cell (dayDescriptions -> aria-describedby), so
    // the colour is never the sole carrier of the information.
    &--completed {
      background-color: var(--color-success-400);
    }

    // The selected day fills with solid primary, against which the dots all but vanish (green scores 1.27:1 on
    // it). A hairline ring in the surface colour restores the edge, so each dot still reads as a distinct mark
    // without giving up its hue.
    [data-selected] & {
      box-shadow: 0 0 0 1px var(--color-additional-50);
    }
  }
}
</style>
