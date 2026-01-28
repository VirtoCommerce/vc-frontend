<template>
  <VcModal
    :title="$t('shared.checkout.select_bopis_modal.title')"
    max-width="73rem"
    is-mobile-fullscreen
    :scrollable="false"
    hide-actions
    class="select-address-map-modal"
  >
    <template #container>
      <component
        :is="isMobile ? SelectAddressMapMobile : SelectAddressMapDesktop"
        :addresses="addresses"
        :api-key="apiKey"
        :current-address="currentAddress"
        @result="$emit('result', $event)"
        @filter-change="$emit('filterChange')"
      />
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { SelectAddressMapDesktop, SelectAddressMapMobile } from "./select-address-map";
import type { PickupLocationType } from "./select-address-map";

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
  currentAddress?: { id: string };
}

interface IEmits {
  (event: "result", value: string): void;
  (event: "filterChange"): void;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});

const breakpoints = useBreakpoints(breakpointsTailwind);
// Mobile layout for screens smaller than md (768px)
const isMobile = breakpoints.smaller("md");
</script>

<style lang="scss">
.select-address-map-modal {
  @media (min-width: theme("screens.md")) {
    --vc-dialog-max-height: 48rem;
  }
}
</style>
