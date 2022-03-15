<template>
  <form @submit="onSubmit">
    <!-- Errors block -->
    <VcAlert v-if="authError" type="error" class="mb-2" icon text>
      <strong>User</strong> or <strong>password</strong> is incorrect
    </VcAlert>

    <VcAlert v-if="!_.isEmpty(errors)" type="error" class="mb-2" icon text>
      <strong>User</strong> and <strong>password</strong> are required
    </VcAlert>

    <VcInput
      v-model="userName"
      name="userName"
      class="mb-4"
      label="User name"
      placeholder="User Name"
      is-required
      :error-message="errors.userName"
    ></VcInput>

    <VcInput
      v-model="password"
      class="mb-4"
      label="Password"
      placeholder="Password"
      type="password"
      is-required
      :error-message="errors.password"
    ></VcInput>

    <div class="mt-1">
      <router-link to="/forgot-password" class="text-blue-700 hover:text-blue-500 text-sm font-semibold">
        Forgot your password?
      </router-link>
    </div>

    <!-- Form actions -->
    <div class="flex mt-8 text-base font-roboto-condensed" :class="{ 'max-w-sm': !props.growButtons }">
      <VcButton is-submit size="lg" class="flex-1 flex-shrink px-2 font-bold uppercase" :is-waiting="!isSubmitEnabled">
        Login
      </VcButton>
      <VcButton to="/sign-up" size="lg" is-outline class="flex-1 ml-4 px-2 uppercase font-bold">Registration</VcButton>
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

const { signMeIn, loading } = useUser();

const props = withDefaults(defineProps<{ growButtons?: boolean }>(), { growButtons: false });

const emit = defineEmits(["succeeded"]);

const authError: Ref<boolean> = ref(false);

const schema = yup.object({
  userName: yup.string().label("User name").required(),
  password: yup.string().label("Password").required(),
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
