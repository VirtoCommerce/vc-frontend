<template>
  <div class="mt-3">
    <b-overlay :show="isLoading"
               rounded="sm"
               :variant="'white'"
               :opacity="0.69">
      <fieldset>
        <div class="form-row form-group">
          <div class="col-md">
            <label for="login">{{ $t("account.details.user_name") }}</label>
            <input id="login"
                   v-model="profile.userName"
                   type="text"
                   class="form-control"
                   readonly>
          </div>
          <div class="col-md">
            <label for="email">{{ $t("account.details.email") }}</label>
            <input id="email"
                   v-model="profile.email"
                   type="email"
                   class="form-control">
          </div>
          <div class="col-md">
            <label for="phone">{{ $t("account.details.phone") }}</label>
            <input id="phone"
                   v-model="profile.phoneNumber"
                   type="text"
                   class="form-control">
          </div>
        </div>
      </fieldset>
      <button class="nav-item btn btn-primary"
              @click.prevent="update()">
        Update User
      </button>
    </b-overlay>
  </div>
</template>

<script lang="ts" src="./account-details"></script>
