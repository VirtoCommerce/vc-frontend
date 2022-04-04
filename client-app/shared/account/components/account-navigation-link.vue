<template>
  <router-link :to="to" class="flex items-center p-3 icon">
    <div class="h-5 w-5"></div>
    <span class="ml-3 text-gray-500 font-extrabold text-sm">{{ text }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { RouteLocationRaw } from "vue-router";

defineProps({
  text: {
    type: String,
    required: true,
  },

  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    required: true,
  },
});
</script>

<style scoped>
/* Icons */
.icon > div {
  background-color: #808080;
}
.dashboard-icon > div {
  mask: url(/static/images/dashboard/icons/grid.svg) no-repeat center / contain;
}
.profile-icon > div {
  mask: url(/static/images/dashboard/icons/profile.svg) no-repeat center / contain;
}
.addresses-icon > div {
  mask: url(/static/images/dashboard/icons/building.svg) no-repeat center / contain;
}

.orders-icon > div {
  mask: url(/static/images/dashboard/icons/orders.svg) no-repeat center / contain;
}
.list-icon > div {
  mask: url(/static/images/dashboard/icons/list.svg) no-repeat center / contain;
}
.checkout-icon > div {
  mask: url(/static/images/dashboard/icons/cart.svg) no-repeat center / contain;
}
.company-icon > div {
  mask: url(/static/images/dashboard/icons/company.svg) no-repeat center / contain;
}
.company-members-icon > div {
  mask: url(/static/images/dashboard/icons/members.svg) no-repeat center / contain;
}

/* Active/hover state styles */
.router-link-active > div,
.icon:hover > div {
  background-color: var(--color-primary);
}
.icon:hover span {
  color: #4b5563;
}
.router-link-active.icon {
  background-color: #f9f9f9;
  border-radius: 3px;
}
.router-link-active span {
  color: #1f222c;
}
</style>
