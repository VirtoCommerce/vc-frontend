<template>
  <div class="all-controls-demo py-10 lg:py-16">
    <div class="mx-auto w-full max-w-screen-xl px-5 md:px-12">
      <!-- Hero header -->
      <div class="all-controls-demo__hero">
        <component :is="heading || 'h2'" class="all-controls-demo__hero-title">
          {{ title || "All Controls Demo" }}
        </component>

        <p class="all-controls-demo__hero-subtitle">
          Edit values in the settings panel — every change reflects here instantly
        </p>
      </div>

      <!-- Cards grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Colors -->
        <div class="demo-card">
          <div class="demo-card__type">Color</div>

          <div class="demo-card__title">Color Pickers</div>

          <div class="demo-card__body">
            <div class="flex flex-wrap gap-3">
              <template v-for="(swatch, key) in colorSwatches" :key="key">
                <div
                  class="demo-card__swatch"
                  :class="swatch ? 'demo-card__swatch--filled' : 'demo-card__swatch--empty'"
                  :style="swatch ? { backgroundColor: swatch } : {}"
                  :title="`${key}: ${swatch ?? 'null'}`"
                />
              </template>
            </div>

            <div v-if="primaryColor" class="demo-card__color-strip" :style="colorStripStyle" />
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="demo-card">
          <div class="demo-card__type">Checkbox</div>

          <div class="demo-card__title">Toggle States</div>

          <div class="demo-card__body space-y-2">
            <div v-for="item in checkboxItems" :key="item.label" class="flex items-center gap-3">
              <span
                class="demo-card__toggle"
                :class="{
                  'demo-card__toggle--on': item.value === true,
                  'demo-card__toggle--off': item.value === false,
                  'demo-card__toggle--null': item.value == null,
                }"
              >
                <span class="demo-card__toggle-dot" />
              </span>

              <span class="text-sm text-neutral-600">{{ item.label }}</span>

              <span
                class="demo-card__badge ml-auto"
                :class="{
                  'demo-card__badge--green': item.value === true,
                  'demo-card__badge--red': item.value === false,
                  'demo-card__badge--gray': item.value == null,
                }"
              >
                {{ item.value === true ? "ON" : item.value === false ? "OFF" : "—" }}
              </span>
            </div>
          </div>
        </div>

        <!-- Numbers -->
        <div class="demo-card">
          <div class="demo-card__type">Number</div>

          <div class="demo-card__title">Numeric Values</div>

          <div class="demo-card__body space-y-3">
            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-500">Basic</span>

              <span class="demo-card__mono">{{ numberBasic ?? "—" }}</span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <span class="text-neutral-500">Default (42)</span>

              <span class="demo-card__mono">{{ numberWithDefault ?? "—" }}</span>
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between text-sm">
                <span class="text-neutral-500">Slider</span>

                <span class="demo-card__mono">{{ numberThumb ?? 0 }} / 100</span>
              </div>

              <div class="demo-card__track">
                <div class="demo-card__fill demo-card__fill--blue" :style="{ width: `${numberThumb ?? 0}%` }" />
              </div>
            </div>

            <div>
              <div class="mb-1.5 flex items-center justify-between text-sm">
                <span class="text-neutral-500">Slider step 5</span>

                <span class="demo-card__mono">{{ numberThumbStep5 ?? 0 }} / 100</span>
              </div>

              <div class="demo-card__track">
                <div class="demo-card__fill demo-card__fill--purple" :style="{ width: `${numberThumbStep5 ?? 0}%` }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar -->
        <div class="demo-card">
          <div class="demo-card__type">Calendar</div>

          <div class="demo-card__title">Date & Time</div>

          <div class="demo-card__body space-y-3">
            <div class="demo-card__date-row">
              <span class="demo-card__date-icon">📅</span>

              <div>
                <div class="text-xs text-neutral-400">Date</div>

                <div class="text-sm font-medium">{{ formatDate(calendarDate) }}</div>
              </div>
            </div>

            <div class="demo-card__date-row">
              <span class="demo-card__date-icon">🕐</span>

              <div>
                <div class="text-xs text-neutral-400">Datetime</div>

                <div class="text-sm font-medium">{{ formatDatetime(calendarDatetime) }}</div>
              </div>
            </div>

            <div class="demo-card__date-row">
              <span class="demo-card__date-icon">⏱</span>

              <div>
                <div class="text-xs text-neutral-400">Time</div>

                <div class="text-sm font-medium">{{ calendarTime || "—" }}</div>
              </div>
            </div>

            <div class="demo-card__date-row">
              <span class="demo-card__date-icon">📆</span>

              <div>
                <div class="text-xs text-neutral-400">Month / Year</div>

                <div class="text-sm font-medium">
                  {{ [calendarMonth, calendarYear].filter(Boolean).join(" · ") || "—" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Strings -->
        <div class="demo-card">
          <div class="demo-card__type">String</div>

          <div class="demo-card__title">Text Values</div>

          <div class="demo-card__body space-y-2">
            <div>
              <div class="mb-1 text-xs text-neutral-400">Basic</div>

              <div class="demo-card__textbox" :class="{ 'demo-card__textbox--empty': !stringBasic }">
                {{ stringBasic || "No value yet…" }}
              </div>
            </div>

            <div>
              <div class="mb-1 text-xs text-neutral-400">With default</div>

              <div class="demo-card__textbox demo-card__textbox--highlight">
                {{ stringWithDefault || "—" }}
              </div>
            </div>

            <div>
              <div class="mb-1 text-xs text-neutral-400">Multiline</div>

              <div class="demo-card__textbox demo-card__textbox--multi">
                {{ stringMultiline || "No multiline text…" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Selects -->
        <div class="demo-card">
          <div class="demo-card__type">Select</div>

          <div class="demo-card__title">Selections</div>

          <div class="demo-card__body space-y-3">
            <div>
              <div class="mb-1 text-xs text-neutral-400">Single (basic)</div>

              <span v-if="selectBasic" class="demo-card__pill demo-card__pill--blue">{{ selectBasic }}</span>

              <span v-else class="text-sm text-neutral-400">—</span>
            </div>

            <div>
              <div class="mb-1 text-xs text-neutral-400">With default</div>

              <span v-if="selectWithDefault" class="demo-card__pill demo-card__pill--green">{{
                selectWithDefault
              }}</span>

              <span v-else class="text-sm text-neutral-400">—</span>
            </div>

            <div>
              <div class="mb-1 text-xs text-neutral-400">Multiple</div>

              <div v-if="selectMultiple?.length" class="flex flex-wrap gap-1.5">
                <span v-for="val in selectMultiple" :key="val" class="demo-card__pill demo-card__pill--purple">{{
                  val
                }}</span>
              </div>

              <span v-else class="text-sm text-neutral-400">—</span>
            </div>

            <div>
              <div class="mb-1 text-xs text-neutral-400">Searchable</div>

              <span v-if="selectSearchable" class="demo-card__pill demo-card__pill--orange">{{
                selectSearchable
              }}</span>

              <span v-else class="text-sm text-neutral-400">—</span>
            </div>
          </div>
        </div>

        <!-- Rich Text — 2 cols -->
        <div class="demo-card sm:col-span-2">
          <div class="demo-card__type">Text</div>

          <div class="demo-card__title">Rich Text Editor</div>

          <div class="demo-card__body">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <div class="mb-1 text-xs text-neutral-400">Text (basic)</div>

                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-if="textBasic" class="demo-card__rich-text" v-html="textBasic" />

                <div v-else class="demo-card__rich-text demo-card__rich-text--empty">No content yet…</div>
              </div>

              <div>
                <div class="mb-1 text-xs text-neutral-400">Text (with default)</div>

                <!-- eslint-disable-next-line vue/no-v-html -->
                <div v-if="textWithDefault" class="demo-card__rich-text" v-html="textWithDefault" />

                <div v-else class="demo-card__rich-text demo-card__rich-text--empty">No content yet…</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Object -->
        <div class="demo-card">
          <div class="demo-card__type">Object</div>

          <div class="demo-card__title">Object Fields</div>

          <div class="demo-card__body">
            <template v-if="objectBasic">
              <div class="space-y-2">
                <div class="demo-card__field">
                  <span class="demo-card__field-key">Title</span>

                  <span class="demo-card__field-val">{{ objectBasic.title || "—" }}</span>
                </div>

                <div class="demo-card__field">
                  <span class="demo-card__field-key">Subtitle</span>

                  <span class="demo-card__field-val">{{ objectBasic.subtitle || "—" }}</span>
                </div>

                <div class="demo-card__field">
                  <span class="demo-card__field-key">Enabled</span>

                  <span
                    class="demo-card__badge"
                    :class="objectBasic.enabled ? 'demo-card__badge--green' : 'demo-card__badge--red'"
                  >
                    {{ objectBasic.enabled ? "Yes" : "No" }}
                  </span>
                </div>

                <div class="demo-card__field">
                  <span class="demo-card__field-key">Count</span>

                  <span class="demo-card__mono">{{ objectBasic.count ?? "—" }}</span>
                </div>

                <div v-if="objectBasic.color" class="demo-card__field">
                  <span class="demo-card__field-key">Color</span>

                  <span class="flex items-center gap-2">
                    <span
                      class="inline-block size-4 rounded-full shadow"
                      :style="{ backgroundColor: objectBasic.color }"
                    />

                    <span class="demo-card__mono text-xs">{{ objectBasic.color }}</span>
                  </span>
                </div>
              </div>
            </template>

            <div v-else class="demo-card__empty">No object configured yet…</div>
          </div>
        </div>

        <!-- Collection — 2 cols -->
        <div class="demo-card sm:col-span-2">
          <div class="demo-card__type">Collection</div>

          <div class="demo-card__title">
            Items

            <span v-if="collectionBasic?.length" class="demo-card__count">
              {{ collectionBasic.length }}
            </span>
          </div>

          <div class="demo-card__body">
            <div v-if="collectionBasic?.length" class="divide-y divide-neutral-100">
              <div v-for="(item, index) in collectionBasic" :key="index" class="flex items-center gap-3 py-2.5">
                <span class="demo-card__index">{{ index + 1 }}</span>

                <span class="flex-1 text-sm font-medium">{{ item.label || `Item ${index + 1}` }}</span>

                <span class="text-xs text-neutral-400">{{ item.value || "—" }}</span>

                <span
                  class="demo-card__badge"
                  :class="item.enabled ? 'demo-card__badge--green' : 'demo-card__badge--red'"
                >
                  {{ item.enabled ? "ON" : "OFF" }}
                </span>
              </div>
            </div>

            <div v-else class="demo-card__empty">No items yet — add items in the Collection settings tab</div>
          </div>
        </div>

        <!-- Image -->
        <div class="demo-card">
          <div class="demo-card__type">Images</div>

          <div class="demo-card__title">Image Preview</div>

          <div class="demo-card__body">
            <div v-if="imagesBasic" class="overflow-hidden rounded-lg">
              <VcImage :src="imagesBasic" class="aspect-video w-full object-cover" />
            </div>

            <div v-else class="demo-card__image-placeholder">
              <span class="text-3xl">🖼</span>

              <span class="mt-2 text-xs text-neutral-400">No image selected</span>
            </div>

            <div v-if="imagesMultiple?.length" class="mt-3 grid grid-cols-3 gap-2">
              <div v-for="(img, i) in imagesMultiple.slice(0, 6)" :key="i" class="overflow-hidden rounded">
                <VcImage v-if="img.url" :src="img.url" class="aspect-square w-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- Search Result -->
        <div class="demo-card">
          <div class="demo-card__type">Search</div>

          <div class="demo-card__title">Search Result</div>

          <div class="demo-card__body">
            <template v-if="searchWithButton">
              <div class="flex items-start gap-3">
                <div v-if="searchWithButton.imgSrc" class="size-16 shrink-0 overflow-hidden rounded-lg">
                  <VcImage :src="searchWithButton.imgSrc" class="size-full object-cover" />
                </div>

                <div class="min-w-0 flex-1 space-y-1">
                  <div class="text-sm font-medium">{{ searchWithButton.name || "—" }}</div>

                  <div class="demo-card__mono text-xs">{{ searchWithButton.code || "—" }}</div>
                </div>
              </div>
            </template>

            <template v-else-if="searchBasic">
              <div class="space-y-1">
                <div class="text-sm font-medium">{{ searchBasic.name || "—" }}</div>

                <div class="demo-card__mono text-xs">{{ searchBasic.code || "—" }}</div>
              </div>
            </template>

            <div v-else class="demo-card__empty">Search for a product in the Search settings tab</div>
          </div>
        </div>

        <!-- Markdown -->
        <div class="demo-card sm:col-span-2">
          <div class="demo-card__type">Markdown</div>

          <div class="demo-card__title">Markdown Editor</div>

          <div class="demo-card__body">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="markdownHtml" class="demo-card__rich-text prose prose-sm max-w-none" v-html="markdownHtml" />

            <div v-else class="demo-card__empty">
              Write markdown in the Markdown settings tab to see it rendered here
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface ObjectBasicType {
  title?: string;
  subtitle?: string;
  enabled?: boolean;
  count?: number;
  color?: string;
}

interface CollectionItemType {
  label?: string;
  value?: string;
  enabled?: boolean;
}

interface ImageItemType {
  url?: string;
  title?: string;
  alt?: string;
}

interface SearchResultType {
  id?: string;
  name?: string;
  code?: string;
  imgSrc?: string;
}

interface IProps {
  // Shared
  title?: string;
  heading?: string;

  // Colors
  colorBasic?: string | null;
  colorNoAlpha?: string | null;
  colorWithDefault?: string | null;
  colorWithClear?: string | null;
  colorPresets?: string | null;
  colorInline?: string | null;

  // Calendar
  calendarDate?: string | null;
  calendarDatetime?: string | null;
  calendarTime?: string | null;
  calendarMonth?: string | null;
  calendarYear?: string | null;

  // Strings
  stringBasic?: string | null;
  stringWithDefault?: string | null;
  stringMultiline?: string | null;

  // Text (rich text)
  textBasic?: string | null;
  textWithDefault?: string | null;

  // Checkboxes
  checkboxBasic?: boolean | null;
  checkboxDefaultTrue?: boolean | null;
  checkboxDefaultFalse?: boolean | null;
  checkboxWithHint?: boolean | null;
  checkboxWithInfo?: boolean | null;

  // Numbers
  numberBasic?: number | null;
  numberWithDefault?: number | null;
  numberThumb?: number | null;
  numberThumbStep5?: number | null;

  // Selects
  selectBasic?: string | null;
  selectWithDefault?: string | null;
  selectMultiple?: string[] | null;
  selectSearchable?: string | null;

  // Object
  objectBasic?: ObjectBasicType | null;

  // Collections
  collectionBasic?: CollectionItemType[] | null;

  // Images
  imagesBasic?: string | null;
  imagesMultiple?: ImageItemType[] | null;

  // Markdown
  markdownHtml?: string | null;

  // Search
  searchBasic?: SearchResultType | null;
  searchWithButton?: SearchResultType | null;
}

const props = withDefaults(defineProps<IProps>(), {
  heading: "h2",
  colorWithDefault: "#3b82f6",
  colorWithClear: "#ef4444",
  checkboxDefaultTrue: true,
  checkboxDefaultFalse: false,
  checkboxWithHint: false,
  checkboxWithInfo: false,
  numberWithDefault: 42,
  numberThumb: 50,
  numberThumbStep5: 50,
  selectWithDefault: "md",
  textWithDefault: "<p>Hello <strong>world</strong></p>",
  stringWithDefault: "Hello world",
});

const colorSwatches = computed(() => ({
  Basic: props.colorBasic,
  "No Alpha": props.colorNoAlpha,
  Default: props.colorWithDefault,
  Clear: props.colorWithClear,
  Presets: props.colorPresets,
  Inline: props.colorInline,
}));

const primaryColor = computed(() => Object.values(colorSwatches.value).find((c) => c != null));

const colorStripStyle = computed(() => {
  const colors = Object.values(colorSwatches.value).filter(Boolean) as string[];

  if (colors.length === 0) return {};
  if (colors.length === 1) return { backgroundColor: colors[0] };

  return { background: `linear-gradient(to right, ${colors.join(", ")})` };
});

const checkboxItems = computed(() => [
  { label: "No default", value: props.checkboxBasic },
  { label: "Default: true", value: props.checkboxDefaultTrue },
  { label: "Default: false", value: props.checkboxDefaultFalse },
  { label: "With hint", value: props.checkboxWithHint },
  { label: "With info", value: props.checkboxWithInfo },
]);

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

function formatDatetime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
</script>

<style lang="scss" scoped>
.all-controls-demo {
  &__hero {
    @apply mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 px-8 py-10 text-center text-neutral-50;
  }

  &__hero-title {
    @apply mb-3 text-3xl font-bold lg:text-5xl;
  }

  &__hero-subtitle {
    @apply text-sm text-neutral-400;
  }
}

.demo-card {
  @apply flex flex-col rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm;

  &__type {
    @apply mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400;
  }

  &__title {
    @apply mb-4 flex items-center gap-2 text-base font-semibold text-neutral-800;
  }

  &__body {
    @apply flex-1 text-neutral-700;
  }

  // Color swatch circle
  &__swatch {
    @apply size-9 rounded-full border-2 border-neutral-50 shadow transition-transform hover:scale-110;

    &--filled {
      @apply border-neutral-50;
    }

    &--empty {
      @apply border-dashed border-neutral-300 bg-neutral-50;
    }
  }

  // Gradient strip below swatches
  &__color-strip {
    @apply mt-4 h-3 rounded-full transition-all duration-500;
  }

  // Toggle switch visual
  &__toggle {
    @apply relative inline-flex h-5 w-9 shrink-0 cursor-default items-center rounded-full transition-colors duration-200;

    &--on {
      @apply bg-green-500;
    }

    &--off {
      @apply bg-red-400;
    }

    &--null {
      @apply bg-neutral-300;
    }
  }

  &__toggle-dot {
    @apply pointer-events-none absolute size-3.5 rounded-full bg-neutral-50 shadow transition-all duration-200;

    .demo-card__toggle--on & {
      @apply right-0.5;
    }

    .demo-card__toggle--off &,
    .demo-card__toggle--null & {
      @apply left-0.5;
    }
  }

  // Pill badge
  &__badge {
    @apply inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium;

    &--green {
      @apply bg-green-100 text-green-700;
    }

    &--red {
      @apply bg-red-100 text-red-700;
    }

    &--gray {
      @apply bg-neutral-100 text-neutral-500;
    }
  }

  // Progress track
  &__track {
    @apply h-2 w-full overflow-hidden rounded-full bg-neutral-100;
  }

  &__fill {
    @apply h-full rounded-full transition-all duration-300;

    &--blue {
      @apply bg-blue-500;
    }

    &--purple {
      @apply bg-purple-500;
    }
  }

  // Mono value display
  &__mono {
    @apply font-mono text-sm font-semibold text-neutral-800;
  }

  // Date row
  &__date-row {
    @apply flex items-start gap-3;
  }

  &__date-icon {
    @apply shrink-0 text-base leading-5;
  }

  // Text boxes
  &__textbox {
    @apply rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700;

    &--empty {
      @apply text-neutral-400 italic;
    }

    &--highlight {
      @apply border-blue-100 bg-blue-50;
    }

    &--multi {
      @apply min-h-[3.5rem] whitespace-pre-wrap;
    }
  }

  // Option pills
  &__pill {
    @apply inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium;

    &--blue {
      @apply bg-blue-100 text-blue-700;
    }

    &--green {
      @apply bg-green-100 text-green-700;
    }

    &--purple {
      @apply bg-purple-100 text-purple-700;
    }

    &--orange {
      @apply bg-orange-100 text-orange-700;
    }
  }

  // Rich text preview area
  &__rich-text {
    @apply rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm leading-relaxed;

    &--empty {
      @apply text-neutral-400 italic;
    }

    :deep(strong) {
      @apply font-semibold;
    }

    :deep(em) {
      @apply italic;
    }

    :deep(a) {
      @apply text-blue-600 underline;
    }

    :deep(ul),
    :deep(ol) {
      @apply my-1 pl-4;
    }

    :deep(li) {
      list-style: inherit;
    }
  }

  // Object fields
  &__field {
    @apply flex items-center justify-between gap-2 text-sm;
  }

  &__field-key {
    @apply shrink-0 text-neutral-500;
  }

  &__field-val {
    @apply text-right font-medium text-neutral-800;
  }

  // Collection item index bubble
  &__index {
    @apply flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-500;
  }

  // Item count badge next to title
  &__count {
    @apply rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-600;
  }

  // Image placeholder
  &__image-placeholder {
    @apply flex aspect-video flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50;
  }

  // Empty state
  &__empty {
    @apply rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-400 italic;
  }
}
</style>
