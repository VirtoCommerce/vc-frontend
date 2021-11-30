<template>
  <ValidationObserver v-slot="{ handleSubmit, reset }">
    <form class="form" @submit.prevent="handleSubmit(submitForm(reset))">
      <ValidationProvider v-slot="{ errors }"
                          rules="required"
                          class="form__element">
        <SfInput
          v-model="form.currentPassword"
          data-cy="my-profile-input_currentPassword"
          type="password"
          name="currentPassword"
          label="Current Password"
          required
          :valid="!errors[0]"
          :error-message="errors[0]"></SfInput>
      </ValidationProvider>
      <div class="form__horizontal">
        <ValidationProvider v-slot="{ errors }"
                            rules="required|password"
                            vid="password"
                            class="form__element">
          <SfInput
            v-model="form.newPassword"
            data-cy="my-profile-input_newPassword"
            type="password"
            name="newPassword"
            label="New Password"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }"
                            rules="required|confirmed:password"
                            class="form__element">
          <SfInput
            v-model="form.repeatPassword"
            data-cy="my-profile-input_repeatPassword"
            type="password"
            name="repeatPassword"
            label="Repeat Password"
            required
            :valid="!errors[0]"
            :error-message="errors[0]"></SfInput>
        </ValidationProvider>
      </div>
      <SfButton data-cy="my-profile-btn_update-password" class="form__button">
        Update password
      </SfButton>
    </form>
    <div>
      <SfAlert v-for="{ code, description } in errors"
               :key="code"
               :message="description"
               :type="'danger'"></SfAlert>
    </div>
  </ValidationObserver>
</template>

<script>
import { ref } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { SfInput, SfButton, SfAlert } from '@libs/storefrontUI/vue';

export default {

  components: {
    SfInput,
    SfButton,
    SfAlert,
    ValidationProvider,
    ValidationObserver
  },

  setup(_, { emit }) {
    const form = ref({
      currentPassword: '',
      newPassword: '',
      repeatPassword: ''
    });
    const errors = ref([]);

    const submitForm = (resetValidationFn) => {
      emit('submit', {
        form,
        onComplete: () => {
          console.log('onComplete');
          resetValidationFn();
        },
        // TODO: Handle Error
        onError: (data) => {
          errors.value = data;
        }
      });
    };

    return {
      form,
      errors,
      submitForm
    };
  }
};
</script>

<style lang='scss' scoped>
@import "assets/styles/scss/all.scss";
.form {
  &__element {
    display: block;
    margin: 0 0 var(--spacer-lg) 0;
  }
  &__button {
    display: block;
    width: 100%;
    @include for-desktop {
      width: 17.5rem;
    }
  }
  &__horizontal {
    @include for-desktop {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .form__element {
      @include for-desktop {
        flex: 1;
        margin-right: var(--spacer-lg);
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
