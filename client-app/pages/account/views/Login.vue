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
      <div>
        <ValidationObserver v-slot="{ handleSubmit }" key="log-in">
          <form class="form" @submit.prevent="handleSubmit(handleLogin)">
            <ValidationProvider v-slot="{ errors }" rules="required|email">
              <SfInput
                v-model="form.username"
                data-cy="login-input_email"
                :valid="!errors[0]"
                :error-message="errors[0]"
                name="email"
                label="Your email"
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
            <SfCheckbox
              v-model="rememberMe"
              data-cy="login-checkbox-remember-me"
              name="remember-me"
              label="Remember me"
              class="form__element checkbox"></SfCheckbox>
            <SfButton data-cy="login-btn_submit"
                      type="submit"
                      class="sf-button--full-width form__button"
                      :disabled="loading">
              <SfLoader :class="{ loader: loading }" :loading="loading">
                <div>Login</div>
              </SfLoader>
            </SfButton>
          </form>
        </ValidationObserver>
        <div class="action">
          <SfLink class="message__link" :href="`/account/forgotpassword`">
            Forgotten password?
          </SfLink>
        </div>
        <div class="bottom">
          <p class="bottom__paragraph">
            Don't have an account yet?
          </p>
          <SfLink class="message__link" :href="`/account/register`">
            Register today
          </SfLink>
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
import { ref, watch } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { useUser } from '@libs/account';
import { SfModal, SfInput, SfButton, SfCheckbox, SfLoader, SfAlert, SfBar, SfLink} from '@libs/storefrontUI/vue';

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
    SfAlert,
    SfLink
  },
  setup() {
    const rememberMe = ref(false);
    const form = ref({ serverErrors: []});
    const { signMeIn, loading } = useUser();

    const onClose = () => {
      window.location.href='/';
    };

    const handleLogin = async () => {
      form.value.rememberMe = rememberMe.value;
      const result = await signMeIn(form.value);
      if(result.succeeded){
        window.location.href='/account';
      }
      else {
        form.value.serverErrors = result.errors;
      }
    };

    return {
      form,
      rememberMe,
      loading,
      handleLogin,
      onClose
    };
  }
};
</script>

<style lang="scss" scoped>
@import "assets/styles/scss/all.scss";
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
