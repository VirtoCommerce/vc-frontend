<template>
  <button
    v-show="isVisible"
    type="button"
    class="flex items-center gap-2 border-t border-neutral-200 p-3 text-start hover:bg-neutral-50"
    data-test-id="punchout-exit-row"
    @click="exitPunchoutMode"
  >
    <VcIcon class="text-primary" name="arrow-left" />

    <span class="truncate">
      {{ $t("punchout.back_to_customer_mode") }}
    </span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUser } from "@/shared/account/composables/useUser";
import { usePunchoutSession } from "../composables/usePunchoutSession";

const router = useRouter();
const { isPunchoutMode, endSession } = usePunchoutSession();
const { isAuthenticated } = useUser();

const isVisible = computed(() => isPunchoutMode.value && isAuthenticated.value);

async function exitPunchoutMode() {
  endSession();
  await router.push({ path: "/" });
}
</script>
