<template>
  <!-- Renders VcMenuItem directly (instead of the shared AccountNavigationItem) to carry the count
       badge, reusing the `account-navigation-item` class for identical styling. The highlight is NOT
       decided here: it follows the link's own area rule, the same one the shared item reads, so the
       set of pages that light this link is written once (see routes.ts). -->
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
import { useSalesRepCustomersCount } from "../composables/useSalesRepCustomersCount";
import type { ExtendedMenuLinkType } from "@/core/types";

interface IProps {
  item: ExtendedMenuLinkType;
}

const props = defineProps<IProps>();

const item = toRef(props, "item");

const { count } = useSalesRepCustomersCount();

// The link's area rule when it declares one — vue-router marks a link active by route RECORD, which
// cannot see that the customer profile and a customer's activity belong here too — else the record match.
const { isActive: isRouteRecordActive } = useLink({ to: item.value?.route ?? {} });
const route = useRoute();
const isActive = computed(() => item.value?.activeWhen?.(route) ?? isRouteRecordActive.value);
</script>
