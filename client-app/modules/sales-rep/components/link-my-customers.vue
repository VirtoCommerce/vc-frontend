<template>
  <AccountNavigationItem :item="item" :format-text-function="capitalize">
    <template v-if="count" #append>
      <VcBadge variant="tonal" size="sm" color="neutral" rounded>
        {{ $n(count, { style: "decimal", notation: "compact" }) }}
      </VcBadge>
    </template>
  </AccountNavigationItem>
</template>

<script setup lang="ts">
import { capitalize } from "lodash-es";
import { useSalesRepCustomersCount } from "../composables/useSalesRepCustomersCount";
import type { ExtendedMenuLinkType } from "@/core/types";
import AccountNavigationItem from "@/shared/account/components/account-navigation-item.vue";

interface IProps {
  item: ExtendedMenuLinkType;
}

defineProps<IProps>();

const { count } = useSalesRepCustomersCount();
</script>
