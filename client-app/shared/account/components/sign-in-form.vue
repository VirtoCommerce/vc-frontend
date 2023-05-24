<template>
  <form @submit="onSubmit">
    <!-- Errors block -->
    <VcAlert v-if="authError" class="mb-2" type="danger" icon>
      <span v-html="$t('shared.account.sign_in_form.email_or_password_incorrect_alert')"></span>
    </VcAlert>

    <VcAlert v-if="userIsLockedError" class="mb-2" type="danger" icon>
      <span v-html="$t('shared.account.sign_in_form.user_is_locked_out_alert')"></span>
    </VcAlert>

    <VcInput
      v-model.trim="email"
      name="email"
      class="mb-4"
      :label="$t('common.labels.email')"
      :placeholder="$t('common.placeholders.email')"
      :disabled="loading || isAuthenticated"
      required
      :message="errors.email"
      :error="!!errors.email"
      autocomplete="email"
    />

    <VcInput
      v-model="password"
      class="mb-4"
      :label="$t('common.labels.password')"
      :placeholder="$t('common.placeholders.password')"
      :disabled="loading || isAuthenticated"
      type="password"
      required
      :message="errors.password"
      :error="!!errors.password"
      autocomplete="password"
    />

    <div class="flex justify-between">
      <VcCheckbox v-model="rememberMe" :disabled="loading || isAuthenticated">
        {{ $t("shared.account.sign_in_form.remember_me_label") }}
      </VcCheckbox>

      <router-link
        v-t="'shared.account.sign_in_form.forgot_password_link'"
        to="/forgot-password"
        class="text-sm font-semibold text-blue-700 hover:text-blue-500"
      >
      </router-link>
    </div>

    <!-- Form actions -->
    <div class="mt-8 flex font-roboto-condensed text-base" :class="{ 'max-w-sm': !props.growButtons }">
      <VcButton
        :is-disabled="loading || isAuthenticated || !valid || authError"
        :is-waiting="loading"
        is-submit
        size="lg"
        class="flex-1 shrink px-2 uppercase"
      >
        {{ $t("shared.account.sign_in_form.login_button") }}
      </VcButton>

      <VcButton
        :to="{ name: 'SignUp' }"
        :is-disabled="loading || isAuthenticated"
        size="lg"
        is-outline
        class="ml-4 flex-1 px-2 uppercase"
      >
        {{ $t("shared.account.sign_in_form.registration_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { eagerComputed } from "@vueuse/core";
import { isEmpty } from "lodash";
import { useField, useForm } from "vee-validate";
import { reactive, ref, watch } from "vue";
import { object, string } from "yup";
import { useCart } from "@/shared/cart";
import { getMe } from "@/xapi";
import { mergeCart } from "@/xapi/graphql/cart";
import useUser from "../composables/useUser";

interface IEmits {
  (event: "succeeded"): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const USER_IS_LOCKED_OUT_ERROR_CODE = "user_is_locked_out";

const { cart, fetchShortCart } = useCart();
const { signMeIn, isAuthenticated } = useUser();

const loading = ref(false);
const authError = ref(false);
const userIsLockedError = ref(false);

const schema = toTypedSchema(
  object({
    email: string().required().email(),
    password: string().required(),
  })
);

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

  if (!cart.value) {
    await fetchShortCart();
  }

  const result = await signMeIn(model);

  if (result.succeeded) {
    const user = await getMe();
    await mergeCart(user.id, cart.value!.id!);
    emit("succeeded");
    return;
  }

  if (result.errors?.find((e) => e.code === USER_IS_LOCKED_OUT_ERROR_CODE)) {
    userIsLockedError.value = true;
  } else {
    authError.value = true;
  }

  loading.value = false;
});

watch(values, () => {
  authError.value = false;
  userIsLockedError.value = false;
});
</script>
