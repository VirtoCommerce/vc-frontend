<template>
  <VcCalendar
    class="sales-rep-task-calendar"
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
      <span v-if="days[date]" class="sales-rep-task-calendar__dots" aria-hidden="true">
        <span
          v-for="kind in days[date].kinds"
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
  /** ISO day → what that day carries: the conditions to dot, and how many tasks are due. */
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
 * What each day draws, resolved once per data change rather than per cell — a fixed-weeks grid asks 42 times.
 * Normalising through the shared TASK_MARKER_KINDS keeps the dots, the legend and buildDayMarkers in one order, and
 * drops any kind that has no colour (a canceled task earns no dot).
 */
const days = computed<SalesRepTaskDayMarkersType>(() => {
  const result: SalesRepTaskDayMarkersType = {};

  for (const [date, day] of Object.entries(props.dayMarkers ?? {})) {
    const kinds = TASK_MARKER_KINDS.filter((kind) => day.kinds.includes(kind));
    if (kinds.length) {
      result[date] = { kinds, count: day.count };
    }
  }

  return result;
});

// The screen-reader counterpart of the dots. Named rather than a bare list ("Upcoming, Overdue" alone, read
// straight after the date, sounds like a property of the date), and led by the one thing the dots cannot
// say: how many tasks are actually there. One dot can stand for five (VCST-5732 QA A-10).
const dayDescriptions = computed<Record<string, string>>(() => {
  const result: Record<string, string> = {};

  for (const [date, day] of Object.entries(days.value)) {
    result[date] = t(
      "sales_rep.tasks.day_markers",
      { count: day.count, kinds: day.kinds.map((kind) => t(`sales_rep.tasks.legend.${kind}`)).join(", ") },
      day.count,
    );
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
  // The selected day takes the same orange as the primary button, so the one highlighted cell on the page
  // reads as the same brand accent as New task rather than a darker relative of it.
  //
  // This is the `--color-vc-*-solid-primary` pair vc-calendar deliberately does NOT use: its own note
  // records white ink on primary-500 at 2.11:1 in the default preset, against primary-700 clearing AA in
  // all 14. A deliberate call — the date on the selected tile is the one thing it costs, and the storefront
  // already ships that pairing on every solid primary button.
  --vc-calendar-selected-bg: var(--color-vc-background-solid-primary, var(--color-primary-500));

  &.vc-calendar {
    @apply border-0 p-0;
  }

  &__dots {
    // .vc-calendar__day is position:relative, so the row sits under the number without shifting the grid.
    @apply pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-0.5;

    line-height: 0;
  }

  &__dot {
    @apply size-1 rounded-full;

    // Shades chosen for DISCRIMINATION, and kept in lockstep with the page legend. The ramps come from the
    // store's theme settings and step lightness independently of hue, so info-500 and success-500 land on the
    // SAME luminance (4.51:1 on white each), leaving hue as the only cue — which is what made the blue and the
    // green hard to tell apart. Green therefore moves a step, and -600 rather than -400: the lighter step
    // separated them but scored 2.69:1 on white, under the 3:1 a meaningful graphic needs (QA A-11).
    &--upcoming {
      background-color: var(--color-info-500);
    }

    &--overdue {
      background-color: var(--color-danger-500);
    }

    // -600, not -400: the lighter step scored 2.69:1 on white, under the 3:1 a meaningful graphic needs (QA
    // A-11). A text equivalent on the cell does not exempt it — 1.4.11 is about seeing the mark. The ramps
    // step lightness independently of hue, so -500 would put the green at exactly the blue's luminance, which
    // is what sent it to -400 in the first place; darker answers both at once.
    &--completed {
      background-color: var(--color-success-600);
    }

    // The selected day fills with solid primary, against which every dot drops under 3:1 — the blue to
    // 1.60:1 (QA A-11). A hairline ring in the surface colour restores the edge so each dot still reads as
    // a distinct mark without giving up its hue. A full light plate behind the row would carry the ratio
    // properly, but it reads as a white blob on a 2rem cell; that half of A-11 is knowingly left open.
    [data-selected] & {
      box-shadow: 0 0 0 1px var(--color-additional-50);
    }
  }
}
</style>
