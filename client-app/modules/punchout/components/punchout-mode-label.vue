<template>
  <template v-if="isVisible">
    <span class="whitespace-nowrap font-bold" data-test-id="punchout-mode-label">
      {{ $t("punchout.mode_label") }}
    </span>

    <span class="mx-3 h-5 w-px bg-primary" />
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useUser } from "@/shared/account/composables/useUser";
import { usePunchoutSession } from "../composables/usePunchoutSession";

const { isPunchoutMode } = usePunchoutSession();
const { isAuthenticated } = useUser();

const isVisible = computed(() => isPunchoutMode.value && isAuthenticated.value);
</script>
