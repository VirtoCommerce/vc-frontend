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
import { useAuth } from "@/core/composables";

const props = defineProps<IProps>();

interface IProps {
  userId: string;
}

const { impersonate, revokeImpersonate, impersonateState } = useAuth();

async function onRevoke() {
  await revokeImpersonate();
}

onMounted(async () => {
  if (!impersonateState.value.isImpersonated) {
    await impersonate(props.userId);
  }
});
</script>
