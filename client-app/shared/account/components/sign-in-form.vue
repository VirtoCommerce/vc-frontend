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
      is-required
      :error-message="errors.userName"
    ></VcInput>

    <VcInput
      v-model="password"
      class="mb-4"
      :label="$t('shared.account.sign_in_form.password_label')"
      :placeholder="$t('shared.account.sign_in_form.password_placeholder')"
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
        is-submit
        size="lg"
        class="flex-1 flex-shrink px-2 font-bold uppercase"
        :is-waiting="!isSubmitEnabled"
        v-t="'shared.account.sign_in_form.login_button'"
      >
      </VcButton>
      <VcButton
        to="/sign-up"
        size="lg"
        is-outline
        class="flex-1 ml-4 px-2 uppercase font-bold"
        v-t="'shared.account.sign_in_form.registration_button'"
      ></VcButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { VcAlert, VcButton, VcInput } from "@/components";
import { ref, reactive, computed, Ref } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import _ from "lodash";
import { useUser } from "@/shared/account";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { signMeIn, loading } = useUser();

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const emit = defineEmits(["succeeded"]);

const authError: Ref<boolean> = ref(false);

const schema = yup.object({
  userName: yup.string().label(t("shared.account.sign_in_form.user_name_label")).required(),
  password: yup.string().label(t("shared.account.sign_in_form.password_label")).required(),
});

const { errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
});

const { value: userName } = useField<string>("userName");
const { value: password } = useField<string>("password");

const model = reactive({ userName, password });

// submit
const isSubmitEnabled = computed(() => !isSubmitting.value && !loading.value);

const onSubmit = handleSubmit(async () => {
  var result = await signMeIn(model);

  if (result.succeeded) {
    emit("succeeded");
  } else {
    authError.value = true;
  }
});
</script>
