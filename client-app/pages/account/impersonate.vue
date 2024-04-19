<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.impersonate.title") }}
    </VcTypography>

    <VcAlert v-if="impersonateState.isError" color="danger" class="mt-4" icon>
      {{ $t("pages.account.impersonate.error") }}
    </VcAlert>
    <VcAlert v-else-if="impersonateState.isImpersonated" color="success" class="mt-4" icon>
      {{ $t("pages.account.impersonate.success") }}
    </VcAlert>

    <div>
      <VcButton @click="onRevoke">{{ $t("pages.account.impersonate.reset_button") }}</VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useImpersonate } from "@/core/composables";

const props = defineProps<IProps>();

interface IProps {
  userId: string;
}

const { checkImpersonate, revokeImpersonate, impersonateState } = useImpersonate();

async function onRevoke() {
  await revokeImpersonate();
}

onMounted(async () => {
  await checkImpersonate(props.userId);
});
</script>
