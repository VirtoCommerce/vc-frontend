<template>
  <VcModal
    :title="$t('shared.checkout.select_bopis_modal.title')"
    max-width="73rem"
    height="48rem"
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
        :selectable="selectable"
        @result="$emit('result', $event)"
        @filter-change="$emit('filterChange')"
      />
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { toRef } from "vue";
import { providePickupFilterContext } from "@/shared/checkout/composables";
import { SelectAddressMapDesktop, SelectAddressMapMobile } from "./select-address-map";
import type { PickupLocationType } from "./select-address-map";
import type { IPickupFilterContext } from "@/shared/checkout/composables";

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
  currentAddress?: { id: string };
  selectable?: boolean;
  filterContext: IPickupFilterContext;
}

interface IEmits {
  (event: "result", value: string): void;
  (event: "filterChange"): void;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
  selectable: true,
});

providePickupFilterContext(toRef(props, "filterContext").value);

const breakpoints = useBreakpoints(breakpointsTailwind);
// Mobile layout for screens smaller than md (768px)
const isMobile = breakpoints.smaller("md");
</script>
