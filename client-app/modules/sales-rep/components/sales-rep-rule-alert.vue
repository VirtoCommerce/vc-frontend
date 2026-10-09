<template>
  <VcAlert v-if="message" color="danger" size="sm" variant="soft" icon>
    {{ message }}
  </VcAlert>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  // The surface's filter rules could not be loaded, so it offers no filter.
  filterFailed?: boolean;
  // The surface's sort rules could not be loaded, so no column is sortable.
  sortFailed?: boolean;
}

const props = defineProps<IProps>();

const { t } = useI18n();

// One line per combination: naming a control that did load would misreport what is degraded.
const message = computed(() => {
  if (props.filterFailed && props.sortFailed) {
    return t("sales_rep.rules.load_failed.both");
  }

  if (props.filterFailed) {
    return t("sales_rep.rules.load_failed.filter");
  }

  if (props.sortFailed) {
    return t("sales_rep.rules.load_failed.sort");
  }

  return "";
});
</script>
