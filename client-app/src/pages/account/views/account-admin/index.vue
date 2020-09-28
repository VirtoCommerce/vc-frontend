<template>
  <div class="account mb-3 mt-3">
    <ul class="nav nav-tabs border-primary">
      <li class="nav-item">
        <router-link to="details"
                     tag="a"
                     active-class="active"
                     class="nav-link"
                     exact>
          {{ $t('account.menu_titles.details') }}
        </router-link>
      </li>
      <li v-if="$can($permissions.CanViewUsers) && $isActive($features.ManageUsers)" class="nav-item">
        <router-link to="users"
                     active-class="active"
                     tag="a"
                     class="nav-link">
          {{ $t('account.menu_titles.users') }}
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
export default class AccountAdmin extends Vue {
}
</script>
