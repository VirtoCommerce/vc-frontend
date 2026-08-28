<template>
  <!-- Renders VcMenuItem directly (instead of the shared AccountNavigationItem) so the highlight
       logic stays inside the module: reuse the same `account-navigation-item` class for identical
       styling, but keep the link active on the customer profile too — a sibling detail route that
       useLink alone wouldn't match. -->
  <VcMenuItem color="secondary" :active="isCurrent || isActive" :to="item.route" class="account-navigation-item">
    <template #prepend>
      <VcIcon size="sm" :name="item.icon" />
    </template>

    {{ capitalize(item?.title) }}

    <template v-if="count" #append>
      <VcBadge variant="tonal" size="sm" color="neutral" rounded>
        {{ $n(count, { style: "decimal", notation: "compact" }) }}
      </VcBadge>
    </template>
  </VcMenuItem>
</template>

<script setup lang="ts">
import { capitalize } from "lodash-es";
import { computed, toRef } from "vue";
import { useLink, useRoute } from "vue-router";
import { useSharedSalesRepCustomersCount } from "../composables/useSalesRepCustomersCount";
import { CUSTOMER_PROFILE_ROUTE_NAME } from "../constants";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  item: ExtendedMenuLinkType;
}

const props = defineProps<IProps>();

const item = toRef(props, "item");

const { count } = useSharedSalesRepCustomersCount();

// Route-based highlight for the link's own route, kept active on the customer profile (its detail
// page is a sibling route, so useLink wouldn't mark it active on its own).
const { isActive } = useLink({ to: item.value?.route ?? {} });
const route = useRoute();
const isCurrent = computed(() => route.name === CUSTOMER_PROFILE_ROUTE_NAME);
</script>
