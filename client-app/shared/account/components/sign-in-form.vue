<template>
  <form @submit="onSubmit">
    <!-- Errors block -->
    <VcAlert v-if="authError" class="mb-2" icon type="error" text>
      <span v-html="$t('shared.account.sign_in_form.email_or_password_incorrect_alert')"></span>
    </VcAlert>

    <VcInput
      v-model="email"
      name="email"
      type="email"
      class="mb-4"
      :label="$t('shared.account.sign_in_form.email_label')"
      :placeholder="$t('shared.account.sign_in_form.email_placeholder')"
      :is-disabled="loading || isAuthenticated"
      is-required
      :error-message="errors.email"
      autocomplete="userName"
    ></VcInput>

    <VcInput
      v-model="password"
      class="mb-4"
      :label="$t('shared.account.sign_in_form.password_label')"
      :placeholder="$t('shared.account.sign_in_form.password_placeholder')"
      :is-disabled="loading || isAuthenticated"
      type="password"
      is-required
      :error-message="errors.password"
      autocomplete="password"
    ></VcInput>

    <div class="flex justify-between">
      <VcCheckbox v-model="rememberMe">
        {{ $t("shared.account.sign_in_form.remember_me_label") }}
      </VcCheckbox>

      <router-link
        to="/forgot-password"
        class="text-blue-700 hover:text-blue-500 text-sm font-semibold"
        v-t="'shared.account.sign_in_form.forgot_password_link'"
      >
      </router-link>
    </div>

    <!-- Form actions -->
    <div class="flex mt-8 text-base font-roboto-condensed" :class="{ 'max-w-sm': !props.growButtons }">
      <VcButton
        :is-disabled="loading || isAuthenticated || !valid || authError"
        :is-waiting="loading"
        is-submit
        size="lg"
        class="flex-1 flex-shrink px-2 uppercase"
      >
        {{ $t("shared.account.sign_in_form.login_button") }}
      </VcButton>

      <VcButton
        :to="{ name: 'SignUp' }"
        :is-disabled="isAuthenticated"
        size="lg"
        is-outline
        class="flex-1 ml-4 px-2 uppercase"
      >
        {{ $t("shared.account.sign_in_form.registration_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { isEmpty } from "lodash";
import { useUser } from "@/shared/account";
import { useI18n } from "vue-i18n";
import { useCart } from "@/shared/cart";
import { mergeCart } from "@/xapi/graphql/cart";
import { eagerComputed } from "@vueuse/core";

const { t } = useI18n();
const { cart, loadMyCart } = useCart();
const { signMeIn, user, isAuthenticated } = useUser();

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const emit = defineEmits(["succeeded"]);

const loading = ref(false);
const authError = ref(false);

const schema = yup.object({
  email: yup.string().label(t("shared.account.sign_in_form.email_label")).required().email(),
  password: yup.string().label(t("shared.account.sign_in_form.password_label")).required(),
});

const { errors, handleSubmit, values } = useForm({
  validationSchema: schema,
});

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");
const rememberMe = ref(false);

const model = reactive({ email, password, rememberMe });

const valid = eagerComputed<boolean>(() => isEmpty(errors.value));

const onSubmit = handleSubmit(async () => {
  loading.value = true;

  if (!cart.value.id) {
    await loadMyCart();
  }

  const result = await signMeIn(model);

  if (!result.succeeded) {
    authError.value = true;
    loading.value = false;
    return;
  }

  await mergeCart(user.value.id, cart.value.id!);
  emit("succeeded");
});

watch(values, () => (authError.value = false));
</script>
