<template>
  <VcAlert color="info" variant="outline" icon :title="$t('password_tips.title')">
    <ul class="ml-3.5 mt-1 list-disc">
      <li v-for="(requirementLabel, index) in requirementsLabels" :key="index">
        {{ requirementLabel }}
      </li>
    </ul>
  </VcAlert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { PasswordOptionsType } from "@/core/types";

interface IProps {
  requirements: PasswordOptionsType;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const requirementsLabels = computed<string[]>(() => {
  const result: string[] = [];

  if (props.requirements.requireDigit) {
    result.push(t("password_tips.required_digit"));
  }
  if (props.requirements.requireLowercase) {
    result.push(t("password_tips.required_lowercase"));
  }
  if (props.requirements.requireNonAlphanumeric) {
    result.push(t("password_tips.required_non_alphanumeric"));
  }
  if (props.requirements.requireUppercase) {
    result.push(t("password_tips.required_uppercase"));
  }
  if (props.requirements.requiredLength) {
    result.push(
      t("password_tips.required_length", [props.requirements.requiredLength], props.requirements.requiredLength),
    );
  }
  if (props.requirements.requiredUniqueChars) {
    result.push(
      t(
        "password_tips.required_unique_chars",
        [props.requirements.requiredUniqueChars],
        props.requirements.requiredUniqueChars,
      ),
    );
  }

  return result;
});
</script>
