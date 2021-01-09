<template>
  <SfModal
    :visible="true"
    class="modal"
    @close="onClose">
    <template #modal-bar>
      <SfBar
        class="sf-modal__bar smartphone-only"
        :close="false"
        :title="'Sign in'"></SfBar>
    </template>
    <transition name="sf-fade" mode="out-in">
      <div class="form">
        <ValidationObserver v-slot="{ handleSubmit }" key="sign-up">
          <form class="form"
                autocomplete="off"
                @submit.prevent="handleSubmit(handleRegister)">
            <ValidationProvider v-slot="{ errors }" rules="required|email">
              <SfInput
                v-model="form.userName"
                data-cy="login-input_email"
                :valid="!errors[0]"
                :error-message="errors[0]"
                name="email"
                label="Your email"
                class="form__element"></SfInput>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" rules="required">
              <SfInput
                v-model="form.firstName"
                data-cy="login-input_firstName"
                :valid="!errors[0]"
                :error-message="errors[0]"
                name="first-name"
                label="First Name"
                class="form__element"></SfInput>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" rules="required">
              <SfInput
                v-model="form.lastName"
                data-cy="login-input_lastName"
                :valid="!errors[0]"
                :error-message="errors[0]"
                name="last-name"
                label="Last Name"
                class="form__element"></SfInput>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" rules="required">
              <SfInput
                v-model="form.password"
                data-cy="login-input_password"
                :valid="!errors[0]"
                :error-message="errors[0]"
                name="password"
                label="Password"
                type="password"
                class="form__element"></SfInput>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" :rules="{ required: { allowFalse: false } }">
              <SfCheckbox
                v-model="createAccount"
                :valid="!errors[0]"
                :error-message="errors[0]"
                name="create-account"
                label="I want to create an account"
                class="form__element"></SfCheckbox>
            </ValidationProvider>
            <SfButton
              data-cy="login-btn_submit"
              type="submit"
              class="sf-button--full-width form__button"
              :disabled="loading">
              <SfLoader :class="{ loader: loading }" :loading="loading">
                <div>Create an account</div>
              </SfLoader>
            </SfButton>
          </form>
        </ValidationObserver>
        <div class="action">
          or
          <SfButton data-cy="login-btn_login-into-account"
                    class="sf-button--text"
                    @click="isLogin = true">
            login in to your account
          </SfButton>
        </div>
        <div>
          <SfAlert v-for="{ code, description } in form.serverErrors"
                   :key="code"
                   :message="description"
                   :type="'danger'"></SfAlert>
        </div>
      </div>
    </transition>
  </SfModal>
</template>
<script>
import { SfModal, SfInput, SfButton, SfCheckbox, SfLoader, SfAlert, SfBar } from '@storefront-ui/vue';
import { ref, watch } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { useUser } from '@libs/account';

extend('email', {
  ...email,
  message: 'Invalid email'
});

extend('required', {
  ...required,
  message: 'This field is required'
});

export default {
  name: 'LoginModal',
  components: {
    SfModal,
    SfInput,
    SfButton,
    SfCheckbox,
    SfLoader,
    ValidationProvider,
    ValidationObserver,
    SfBar,
    SfAlert
  },
  setup() {

    const form = ref({ serverErrors: []});
    const { signMeUp, loading } = useUser();

    const onClose = () => {
      window.location.href='/';
    };
    const handleRegister = async () => {
      const result = await signMeUp(form.value);
      if(result.succeeded){
        window.location.href=`/account/login`;
      }
      else {
        form.value.serverErrors = result.errors;
      }
    };

    return {
      form,
      loading,
      handleRegister,
      onClose
    };
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
.form {
  margin-top: var(--spacer-sm);
  &__element {
    margin: 0 0 var(--spacer-xl) 0;
  }
}
.action {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--spacer-xl) 0 var(--spacer-xl) 0;
  font: var(--font-weight--light) var(--font-size--base) / 1.6 var(--font-family--secondary);
  & > * {
    margin: 0 0 0 var(--spacer-xs);
  }
}
.action {
  margin: var(--spacer-xl) 0 var(--spacer-xl) 0;
}
.checkbox {
  margin-bottom: var(--spacer-2xl);
}
.bottom {
  text-align: center;
  margin-bottom: var(--spacer-lg);
  font-size: var(--h3-font-size);
  font-weight: var(--font-weight--semibold);
  font-family: var(--font-family--secondary);
  &__paragraph {
    color: var(--c-primary);
    margin: 0 0 var(--spacer-base) 0;
    @include for-desktop {
      margin: 0;
    }
  }
}
</style>
