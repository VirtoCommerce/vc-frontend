<template>
  <VcCard :title="$t('shared.account.navigation.title')">
    <div class="flex flex-col">
      <AccountNavigationLink
        to="/account/dashboard"
        :text="$t('shared.account.navigation.links.dashboard')"
        class="dashboard-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/profile"
        :text="$t('shared.account.navigation.links.profile')"
        class="profile-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/addresses"
        :text="$t('shared.account.navigation.links.addresses')"
        class="addresses-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        to="/account/orders"
        :text="$t('shared.account.navigation.links.orders')"
        class="orders-icon"
      ></AccountNavigationLink>
      <AccountNavigationLink
        :to="{ name: 'Lists' }"
        :text="$t('shared.account.navigation.links.your_lists')"
        class="list-icon pb-2"
      >
      </AccountNavigationLink>
      <template v-if="listDetails">
        <div class="px-3 ml-8 flex text-xs items-center space-x-2" v-for="list in lists" :key="list.id">
          <i class="fas fa-minus text-[color:var(--color-primary)]"></i>
          <router-link
            class="text-gray-500 font-semibold hover:text-black cursor-pointer"
            :class="activeList === list.name && 'text-black'"
            :to="{ name: 'ListDetails', params: { listId: list.id } }"
          >
            {{ list.name }}
          </router-link>
        </div>
      </template>
      <AccountNavigationLink
        to="/account/checkout-defaults"
        :text="$t('shared.account.navigation.links.checkout_defaults')"
        class="checkout-icon"
      ></AccountNavigationLink>
    </div>
  </VcCard>
  <!-- Commented due to accetpance criteria, will be used in future-->
  <!-- <VcCard title="Corporate">
    <div class="flex flex-col">
      <AccountNavigationLink to="/companyInfo" text="Company info" class="company-icon"></AccountNavigationLink>
      <AccountNavigationLink
        to="/companyMembers"
        text="Company members"
        class="company-members-icon"
      ></AccountNavigationLink>
    </div>
  </VcCard> -->
</template>

<script setup lang="ts">
import { VcCard } from "@/components";
import { AccountNavigationLink } from ".";
import { watch } from "vue";
import { useWishlists } from "@/shared/wishlists";

const { lists, fetchWishlists } = useWishlists();

const props = defineProps({
  listDetails: {
    type: Boolean,
    default: false,
  },
  activeList: {
    type: String,
    default: "",
  },
});

watch(
  () => props.listDetails,
  () => {
    if (props.listDetails) {
      fetchWishlists();
    }
  }
);
</script>
