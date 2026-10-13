<template>
  <!-- VcMenuItem directly, not AccountNavigationItem, to carry the count badge (same class, same styling).
       The highlight follows the link's own area rule, written once in routes.ts. -->
  <VcMenuItem color="secondary" :active="isActive" :to="item.route" class="account-navigation-item">
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
import { isMenuLinkActive } from "@/core/utilities/menu";
import { useSharedSalesRepCustomersCount } from "../composables/useSalesRepCustomersCount";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  item: ExtendedMenuLinkType;
}

const props = defineProps<IProps>();

const item = toRef(props, "item");

const { count } = useSharedSalesRepCustomersCount();

const { isActive: isRouteRecordActive } = useLink({ to: item.value?.route ?? {} });
const route = useRoute();
const isActive = computed(() => isMenuLinkActive(item.value, route, isRouteRecordActive.value));
</script>
