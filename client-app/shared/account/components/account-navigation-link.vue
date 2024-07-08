<template>
  <router-link :to="to" class="icon flex items-center p-2.5">
    <div class="mr-2.5 size-5 flex-none"></div>
    <span class="overflow-hidden text-ellipsis text-sm font-bold text-neutral">{{ text }}</span>
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  text: string;
  to: RouteLocationRaw;
}

defineProps<IProps>();
</script>

<style scoped>
/* Icons */
.icon > div {
  background-color: #808080;
}
.dashboard-icon > div {
  mask: url(/static/images/dashboard/icons/dashboard.svg) no-repeat center / contain;
}
.profile-icon > div {
  mask: url(/static/images/dashboard/icons/profile.svg) no-repeat center / contain;
}
.pass-icon > div {
  mask: url(/static/images/dashboard/icons/pass.svg) no-repeat center / contain;
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
  mask: url(/static/images/dashboard/icons/check-circle.svg) no-repeat center / contain;
}
.company-icon > div {
  mask: url(/static/images/dashboard/icons/company.svg) no-repeat center / contain;
}
.company-members-icon > div {
  mask: url(/static/images/dashboard/icons/members.svg) no-repeat center / contain;
}

.quotes-icon > div {
  mask: url(/static/images/dashboard/icons/quotes.svg) no-repeat center / contain;
}

.credit-card > div {
  mask: url(/static/images/dashboard/icons/credit-card.svg) no-repeat center / contain;
}

.notifications > div {
  mask: url(/static/icons/basic/bell.svg) no-repeat center / contain;
}

/* Active/hover state styles */
.router-link-active > div,
.icon:hover > div {
  background-color: var(--color-primary-500);
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
