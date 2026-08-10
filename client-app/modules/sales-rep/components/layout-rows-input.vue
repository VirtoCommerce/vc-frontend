<template>
  <div class="layout-rows-input">
    <!-- Decorative: `ariaLabel` names the field, and VcInput generates the input's id internally. -->
    <span class="layout-rows-input__label" aria-hidden="true">{{ t("sales_rep.hub.layout.max_rows") }}</span>

    <VcInput
      v-model="draft"
      class="layout-rows-input__field"
      type="number"
      size="xs"
      :min="setting.min"
      :max="setting.max"
      :aria-label="t('sales_rep.hub.layout.a11y.max_rows', { title, min: setting.min, max: setting.max })"
      @blur="commit(true)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { MaxRowsSettingType } from "../composables/useLayoutSettings";

interface IProps {
  modelValue: number;
  setting: MaxRowsSettingType;
  /** Localized block name — the field is one of several in the header, so its label must say which. */
  title: string;
}

interface IEmits {
  (event: "update:modelValue", value: number): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();

// Local draft, not the bound number: clearing the field to retype is a legitimate intermediate state,
// and clamping on every keystroke would rewrite "1" to the minimum before the second digit arrives.
// Not a plain string — Vue's own `v-model` casts a `type="number"` field to a number, and VcInput's
// setter maps an emptied one to `undefined`.
const draft = ref<string | number | undefined>();

// Seeded by the watcher rather than from `props` in root scope, so the initial value tracks the prop
// like every later one does.
watch(
  () => props.modelValue,
  (value) => {
    draft.value = value;
  },
  { immediate: true },
);

// In-range values commit as typed; out-of-range ones wait for blur, so a typo is corrected rather
// than silently accepted.
function commit(clamp = false): void {
  const raw = String(draft.value ?? "");
  const parsed = Math.trunc(Number(raw));
  const valid = Number.isFinite(parsed) && raw.trim() !== "";

  if (valid && parsed >= props.setting.min && parsed <= props.setting.max) {
    emit("update:modelValue", parsed);
  } else if (clamp) {
    const corrected = valid ? Math.min(Math.max(parsed, props.setting.min), props.setting.max) : props.modelValue;
    draft.value = corrected;
    emit("update:modelValue", corrected);
  }
}

watch(draft, () => commit());
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.layout-rows-input {
  @apply flex flex-none cursor-auto items-center gap-1.5;

  &__label {
    @apply whitespace-nowrap text-xs font-normal normal-case text-neutral-500;
  }

  // Sizing a kit component from outside: the class lands on VcInput's own root through attribute
  // fallthrough, so nothing here selects a `.vc-input*` class.
  &__field {
    @apply w-16;
  }
}
</style>
