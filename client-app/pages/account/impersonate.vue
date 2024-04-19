<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.impersonate.title") }}
    </VcTypography>

    <VcLoaderOverlay v-if="status === 'loading'" no-bg />

    <VcAlert v-if="status === 'error'" color="danger" class="mt-4" icon>
      {{ $t("pages.account.impersonate.error") }}
    </VcAlert>

    <VcAlert v-if="status === 'success'" color="success" class="mt-4" icon>
      {{ $t("pages.account.impersonate.success") }}
    </VcAlert>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useImpersonate } from "@/core/composables";

const props = defineProps<IProps>();

interface IProps {
  userId: string;
}

const { status, impersonate } = useImpersonate();

onMounted(() => {
  void impersonate(props.userId);
});
</script>
