<template>
  <VcAlert type="warning" icon="information-circle">
    <div class="flex flex-col">
      <VcTypography variant="medium" weight="bold">
        {{ $t("password_tips.title") }}
      </VcTypography>

      <VcTypography variant="small">
        <li v-for="(requirementLabel, index) in requirementsLabels" :key="index">
          {{ requirementLabel }}
        </li>
      </VcTypography>
    </div>
  </VcAlert>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { PasswordOptionsType } from "@/core/types";

interface IProps {
  requirements: PasswordOptionsType;
}

const props = defineProps<IProps>();

const { t } = useI18n();

const requirementsLabels = ref<string[]>([]);

if (props.requirements.requireDigit) {
  requirementsLabels.value.push(t("password_tips.required_digit"));
}
if (props.requirements.requireLowercase) {
  requirementsLabels.value.push(t("password_tips.required_lowercase"));
}
if (props.requirements.requireNonAlphanumeric) {
  requirementsLabels.value.push(t("password_tips.required_non_alphanumeric"));
}
if (props.requirements.requireUppercase) {
  requirementsLabels.value.push(t("password_tips.required_uppercase"));
}
if (props.requirements.requiredLength) {
  requirementsLabels.value.push(t("password_tips.required_length", [props.requirements.requiredLength]));
}
if (props.requirements.requiredUniqueChars) {
  requirementsLabels.value.push(t("password_tips.required_unique_chars", [props.requirements.requiredUniqueChars]));
}
</script>
