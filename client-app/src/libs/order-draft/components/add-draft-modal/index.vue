<template>
  <b-modal id="addDraftModal"
           no-close-on-backdrop
           @hidden="resetForm">
    <div slot="modal-title">
      {{ $t("account.drafts.add-draft.title") }}
    </div>
    <b-form id="add-draft-form"
            novalidate
            @submit.prevent="submitForm">
      <b-form-group
        :label="$t('account.drafts.add-draft.draft-name-label')"
        label-for="draftName">
        <b-form-input
          id="draftName"
          v-model="$v.draftName.$model"
          :class="{ 'is-invalid': $v.draftName.$error }"
          type="text"
          :placeholder="$t('account.drafts.add-draft.draft-name-placeholder')"
          :debounce="1000"
          @blur="$v.draftName.$touch()"></b-form-input>
        <b-form-invalid-feedback v-if="!$v.draftName.required">
          {{ $t("account.drafts.add-draft.draft-name-required") }}
        </b-form-invalid-feedback>
        <b-form-invalid-feedback v-if="!$v.draftName.isUnique">
          {{ $t("account.drafts.add-draft.draft-name-unique") }}
        </b-form-invalid-feedback>
      </b-form-group>
    </b-form>
    <template v-slot:modal-footer>
      <b-button
        variant="outline-primary"
        :disabled="$v.$invalid"
        @click="submitForm">
        {{ $t("account.drafts.add-draft.submit") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts" src="./add-draft-modal.ts"></script>
