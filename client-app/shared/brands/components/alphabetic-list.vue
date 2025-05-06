<template>
  <div class="alphabetic-list">
    <VcButton
      v-for="letter in letters"
      :key="letter"
      :variant="activeLetter === letter.value ? 'solid' : 'no-background'"
      size="xs"
      :color="activeLetter === letter.value ? 'primary' : 'neutral'"
      class="alphabetic-list__item"
      :class="{ 'alphabetic-list__item--disabled': !enabledLettersList.includes(letter.value) }"
      :disabled="!enabledLettersList.includes(letter.value)"
      @click="selectLetter(letter.value)"
    >
      {{ letter.name }}
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  enabledLetters: string[];
}

const props = defineProps<IProps>();

const { t } = useI18n();

const LATIN_UPPERCASE_LETTERS = Array.from({ length: 26 }, (_, i) => ({
  name: String.fromCharCode(65 + i),
  value: String.fromCharCode(65 + i),
}));

const letters = [
  { name: t("pages.brands.all"), value: "all" },
  ...LATIN_UPPERCASE_LETTERS,
  { name: "0-9", value: "numbers" },
  { name: "#", value: "others" },
];

const activeLetter = defineModel<string>("active-letter", { required: false, default: "all" });

const enabledLettersList = computed(() => {
  return [...props.enabledLetters, "all"];
});

function selectLetter(letter: string) {
  activeLetter.value = letter;
}
</script>

<style lang="scss">
.alphabetic-list {
  @apply flex overflow-x-auto py-1;

  &__item {
    --px: theme("padding[2.5]");
    @apply shrink-0;

    &--disabled {
      @apply xl:opacity-20 xl:block hidden;
    }
  }
}
</style>
