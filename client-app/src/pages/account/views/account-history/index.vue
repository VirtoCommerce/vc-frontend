<template>
  <div class="account mb-3 mt-3">
    <ul class="nav nav-tabs border-primary">
      <li v-if="$can($permissions.CanViewOrders) && $isActive($features.OrderBrowsing)" class="nav-item">
        <router-link to="orders"
                     active-class="active"
                     tag="a"
                     class="nav-link">
          {{ $t('account.menu_titles.orders') }}
        </router-link>
      </li>

      <li v-if="$can($permissions.CanViewOrders) && $isActive($features.InvoiceBrowsing)" class="nav-item">
        <router-link
          to="invoices"
          active-class="active"
          tag="a"
          class="nav-link">
          {{ $t('account.menu_titles.invoices') }}
        </router-link>
      </li>

      <li v-if="$can($permissions.CanViewOrders) && $isActive($features.PaymentBrowsing)" class="nav-item">
        <router-link
          to="payments"
          active-class="active"
          tag="a"
          class="nav-link">
          {{ $t('account.menu_titles.payments') }}
        </router-link>
      </li>
      <li class="nav-item">
        <router-link
          to="drafts"
          active-class="active"
          tag="a"
          class="nav-link">
          {{ $t('account.menu_titles.drafts') }}
        </router-link>
      </li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({
})
export default class AccountHistory extends Vue {
}
</script>
