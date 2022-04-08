<template>
  <form @submit="onSubmit">
    <!-- Errors block -->
    <VcAlert v-if="authError" class="mb-2" icon type="error" text>
      <span v-html="$t('shared.account.sign_in_form.user_or_password_incorrect_alert')"></span>
    </VcAlert>
    <VcAlert v-if="!_.isEmpty(errors)" class="mb-2" icon type="error" text>
      <span v-html="$t('shared.account.sign_in_form.user_and_password_are_required_alert')"></span>
    </VcAlert>

    <VcInput
      v-model="userName"
      name="userName"
      class="mb-4"
      :label="$t('shared.account.sign_in_form.user_name_label')"
      :placeholder="$t('shared.account.sign_in_form.user_name_placeholder')"
      :is-disabled="loading || isAuthenticated"
      is-required
      :error-message="errors.userName"
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
    ></VcInput>

    <div class="mt-1">
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
        :is-disabled="loading || isAuthenticated"
        :is-waiting="loading"
        is-submit
        size="lg"
        class="flex-1 flex-shrink px-2 font-bold uppercase"
      >
        {{ $t("shared.account.sign_in_form.login_button") }}
      </VcButton>

      <VcButton
        :to="{ name: 'SignUp' }"
        :is-disabled="isAuthenticated"
        size="lg"
        is-outline
        class="flex-1 ml-4 px-2 uppercase font-bold"
      >
        {{ $t("shared.account.sign_in_form.registration_button") }}
      </VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { VcAlert, VcButton, VcInput } from "@/components";
import { ref, reactive } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import _ from "lodash";
import { useUser } from "@/shared/account";
import { useI18n } from "vue-i18n";
import { useCart } from "@/shared/cart";
import { mergeCart } from "@core/api/graphql/cart";

const { t } = useI18n();
const { cart, loadMyCart } = useCart();
const { signMeIn, me, isAuthenticated } = useUser();

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const emit = defineEmits(["succeeded"]);

const loading = ref(false);
const authError = ref(false);

const schema = yup.object({
  userName: yup.string().label(t("shared.account.sign_in_form.user_name_label")).required(),
  password: yup.string().label(t("shared.account.sign_in_form.password_label")).required(),
});

const { errors, handleSubmit } = useForm({
  validationSchema: schema,
});

const { value: userName } = useField<string>("userName");
const { value: password } = useField<string>("password");

const model = reactive({ userName, password });

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

  await mergeCart(me.value.id, cart.value.id!);
  emit("succeeded");
});
</script>
