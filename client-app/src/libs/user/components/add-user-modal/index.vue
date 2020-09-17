<template>
  <b-modal id="addUserModal"
           no-close-on-backdrop
           @hidden="resetForm">
    <div slot="modal-title">
      {{ $t("account.users.add-user.title") }}
    </div>
    <b-form id="add-user-form"
            novalidate
            @submit.prevent="submitForm">
      <b-form-group :label="$t('account.users.add-user.email-label')"
                    label-for="email">
        <b-form-input
          id="email"
          v-model="$v.user.email.$model"
          type="email"
          :class="{ 'is-invalid': $v.user.email.$error }"
          :placeholder="$t('account.users.add-user.email-placeholder')"
          @blur="$v.user.email.$touch()"></b-form-input>
        <b-form-invalid-feedback v-if="!$v.user.email.email">
          {{ $t("account.users.add-user.email-not-valid") }}
        </b-form-invalid-feedback>
        <b-form-invalid-feedback v-if="!$v.user.email.required">
          {{ $t("account.users.add-user.email-required") }}
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group
        :label="$t('account.users.add-user.first-name-label')"
        label-for="firstName">
        <b-form-input
          id="firstName"
          v-model="$v.user.firstName.$model"
          :class="{ 'is-invalid': $v.user.firstName.$error }"
          type="text"
          :placeholder="$t('account.users.add-user.first-name-placeholder')"
          @blur="$v.user.firstName.$touch()"></b-form-input>
        <b-form-invalid-feedback v-if="!$v.user.firstName.required">
          {{ $t("account.users.add-user.first-name-required") }}
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group
        label-for="lastName"
        :label="$t('account.users.add-user.last-name-label')">
        <b-form-input
          id="lastName"
          v-model="$v.user.lastName.$model"
          :class="{ 'is-invalid': $v.user.lastName.$error }"
          type="text"
          :placeholder="$t('account.users.add-user.last-name-placeholder')"
          @blur="$v.user.lastName.$touch()"></b-form-input>
        <b-form-invalid-feedback v-if="!$v.user.lastName.required">
          {{ $t("account.users.add-user.last-name-required") }}
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group :label="$t('account.users.add-user.username-label')"
                    label-for="userName">
        <b-form-input
          id="userName"
          v-model="$v.user.userName.$model"
          :class="{ 'is-invalid': $v.user.userName.$error }"
          type="text"
          :placeholder="$t('account.users.add-user.username-placeholder')"
          @blur="$v.user.userName.$touch()"></b-form-input>
        <b-form-invalid-feedback v-if="!$v.user.userName.required">
          {{ $t("account.users.add-user.username-required") }}
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group :label="$t('account.users.add-user.role-label')"
                    label-for="role">
        <b-form-select
          id="role"
          v-model="$v.user.role.$model"
          :class="{ 'is-invalid': $v.user.role.$error }"
          plain
          @blur.native="$v.user.role.$touch()">
          <template v-slot:first>
            <b-form-select-option
              value=""
              disabled>
              {{ $t("account.users.add-user.role-default-placeholder") }}
            </b-form-select-option>
          </template>
          <b-form-select-option value="Store administrator">
            {{ $t("account.users.add-user.account-admin") }}
          </b-form-select-option>
          <b-form-select-option
            value="Store manager">
            {{ $t("account.users.add-user.business-user") }}
          </b-form-select-option>
        </b-form-select>
        <b-form-invalid-feedback v-if="!$v.user.role.required">
          {{ $t("account.users.add-user.role-required") }}
        </b-form-invalid-feedback>
      </b-form-group>

      <b-form-group :label="$t('account.users.add-user.password-label')"
                    label-for="password">
        <b-input-group>
          <b-form-input
            id="password"
            v-model="$v.user.password.$model"
            :type="passwordFieldType"
            :class="{ 'is-invalid': $v.user.password.$error }"
            :placeholder="$t('account.users.add-user.password-placeholder')"
            @blur="$v.user.password.$touch()"></b-form-input>
          <b-input-group-append is-text>
            <font-awesome-layers @click="switchPasswordVisibility">
              <font-awesome-icon v-if="passwordFieldType === 'password'" :icon="eyeIcon"></font-awesome-icon>
              <font-awesome-icon v-if="passwordFieldType === 'text'" :icon="eyeSlashIcon"></font-awesome-icon>
            </font-awesome-layers>
          </b-input-group-append>
          <b-form-invalid-feedback v-if="!$v.user.password.required">
            {{ $t("account.users.add-user.password-required") }}
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="!$v.user.password.minLength">
            {{ $t('account.users.add-user.password-length-error', [$v.user.password.$params.minLength.min]) }}
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="!$v.user.password.containsUppercase && $v.user.password.$model.length >= 1">
            {{ $t("account.users.add-user.password-uppercase-error") }}
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="!$v.user.password.containsLowercase && $v.user.password.$model.length >= 1">
            {{ $t("account.users.add-user.password-lowercase-error") }}
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>

      <b-form-group
        :label="$t('account.users.add-user.confirm-password-label')"
        label-for="confirmPassword">
        <b-input-group>
          <b-form-input
            id="confirmPassword"
            v-model="$v.user.confirmPassword.$model"
            :type="passwordFieldType"
            :class="{ 'is-invalid': $v.user.confirmPassword.$error }"
            :placeholder="$t('account.users.add-user.confirm-password-placeholder')"
            @blur="$v.user.confirmPassword.$touch()"></b-form-input>
          <b-input-group-append is-text>
            <font-awesome-layers @click="switchPasswordVisibility">
              <font-awesome-icon v-if="passwordFieldType === 'password'" :icon="eyeIcon"></font-awesome-icon>
              <font-awesome-icon v-if="passwordFieldType === 'text'" :icon="eyeSlashIcon"></font-awesome-icon>
            </font-awesome-layers>
          </b-input-group-append>
          <b-form-invalid-feedback v-if="!$v.user.password.$dirty && !$v.user.confirmPassword.required">
            {{ $t("account.users.add-user.confirm-password-password-required") }}
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="$v.user.password.$dirty && !$v.user.confirmPassword.required">
            {{ $t("account.users.add-user.confirm-password-required") }}
          </b-form-invalid-feedback>
          <b-form-invalid-feedback v-if="$v.user.password.$dirty && !$v.user.confirmPassword.sameAsPassword">
            {{ $t("account.users.add-user.confirm-password-not-same") }}
          </b-form-invalid-feedback>
        </b-input-group>
      </b-form-group>
    </b-form>
    <template v-slot:modal-footer>
      <b-button
        variant="outline-primary"
        :disabled="$v.user.$invalid"
        @click="submitForm">
        {{ $t("account.users.add-user.submit") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts" src="./add-user-modal.ts"></script>
