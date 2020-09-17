<template>
  <b-modal id="editUserModal"
           no-close-on-backdrop
           @hidden="resetForm">
    <div slot="modal-title">
      {{ $t("account.users.edit-user-title") }}
    </div>
    <b-overlay
      :show="isLoading"
      rounded="sm"
      :variant="'white'"
      :opacity="0.69">
      <b-form v-if="userInfo"
              id="edit-user-form"
              novalidate
              @submit.prevent="submitForm">
        <b-form-group :label="$t('account.users.add-user.email-label')" label-for="email">
          <b-form-input
            id="email"
            v-model="$v.userInfo.email.$model"
            type="email"
            :class="{ 'is-invalid': $v.userInfo.email.$error }"
            :placeholder="$t('account.users.add-user.email-placeholder')"></b-form-input>
          <b-form-invalid-feedback
            v-if="!$v.userInfo.email.email">
            {{ $t("account.users.add-user.email-not-valid") }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group :label=" $t('account.users.add-user.first-name-label')" label-for="firstName">
          <b-form-input
            id="firstName"
            v-model="$v.userInfo.firstName.$model"
            :class="{ 'is-invalid': $v.userInfo.firstName.$error }"
            type="text"
            :placeholder="$t('account.users.add-user.first-name-placeholder')"
            @blur="$v.userInfo.firstName.$touch()"></b-form-input>
          <b-form-invalid-feedback v-if="!$v.userInfo.firstName.required">
            {{ $t("account.users.add-user.first-name-required") }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group :label=" $t('account.users.add-user.last-name-label')" label-for="lastName">
          <b-form-input
            id="lastName"
            v-model="$v.userInfo.lastName.$model"
            :class="{ 'is-invalid': $v.userInfo.lastName.$error }"
            type="text"
            :placeholder="$t('account.users.add-user.last-name-placeholder')"
            @blur="$v.userInfo.lastName.$touch()"></b-form-input>
          <b-form-invalid-feedback v-if="!$v.userInfo.lastName.required">
            {{ $t("account.users.add-user.last-name-required") }}
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group :label="$t('account.users.add-user.role-label')" label-for="role">
          <b-form-select id="role"
                         v-model="userInfo.role.name"
                         plain>
            <b-form-select-option
              value="Store administrator">
              {{ $t("account.users.add-user.account-admin") }}
            </b-form-select-option>
            <b-form-select-option
              value="Store manager">
              {{ $t("account.users.add-user.business-user") }}
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
      </b-form>
    </b-overlay>
    <template v-slot:modal-footer>
      <b-button
        variant="outline-primary"
        :disabled="$v.userInfo.$invalid"
        @click="submitForm">
        {{ $t("account.users.add-user.submit") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts" src="./edit-user-modal.ts"></script>
