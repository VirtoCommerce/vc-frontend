<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("pages.account.profile.title") }}
    </VcTypography>

    <VcWidget size="lg" class="polygon-bg [--polygon-bg-position:right_bottom_-180px]">
      <form class="flex flex-col lg:w-1/2" @submit.prevent="onSubmit">
        <VcInput
          v-model="firstName"
          :label="$t('common.labels.first_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :disabled="isSubmitting"
          :maxlength="MAX_NAME_LENGTH"
          :message="errors.firstName"
          :error="!!errors.firstName"
          name="firstName"
          class="mb-5"
          required
        />

        <VcInput
          v-model="lastName"
          :label="$t('common.labels.last_name')"
          :placeholder="$t('common.placeholders.first_name')"
          :disabled="isSubmitting"
          :maxlength="MAX_NAME_LENGTH"
          :message="errors.lastName"
          :error="!!errors.lastName"
          name="lastName"
          class="mb-5"
          required
        />

        <VcInput
          :model-value="user.email"
          :label="$t('common.labels.email')"
          :placeholder="$t('common.placeholders.first_name')"
          name="email"
          autocomplete="off"
          class="mb-5"
          disabled
        />

        <div class="flex gap-4">
          <div class="grow">
            <VcSelect
              v-model="defaultLanguage"
              :items="themeContext.availableLanguages"
              :label="$t('common.labels.default_language')"
              text-field="nativeName"
              value-field="cultureName"
            />
          </div>

          <div class="grow">
            <VcSelect
              v-model="currencyCode"
              :items="themeContext.availableCurrencies"
              :label="$t('common.labels.default_currency')"
              text-field="code"
              value-field="code"
            />
          </div>
        </div>

        <!-- Form actions -->
        <div class="mt-5 w-1/2 self-center lg:self-auto">
          <VcButton
            :disabled="!meta.dirty || !meta.valid || meta.pending"
            :loading="isSubmitting"
            type="submit"
            class="w-full lg:w-48"
          >
            {{ $t("common.buttons.update") }}
          </VcButton>
        </div>
      </form>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useForm } from "vee-validate";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { useChangeCartCurrencyMutation } from "@/core/api/graphql";
import { useCurrency, usePageHead, useThemeContext } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { ProfileUpdateSuccessModal, useUser } from "@/shared/account";
import { useModal } from "@/shared/modal";

const MAX_NAME_LENGTH = 64;

const { t } = useI18n();
const { user, updateUser } = useUser();
const { themeContext } = useThemeContext();
const { openModal } = useModal();
const { removeLocaleFromUrl, unpinLocale } = useLanguages();
const { supportedCurrencies, saveCurrencyCode } = useCurrency();
const { mutate: changeCartCurrency } = useChangeCartCurrencyMutation();

usePageHead({
  title: computed(() => t("pages.account.profile.meta.title")),
});

const validationSchema = toTypedSchema(
  yup.object({
    firstName: yup.string().trim().required().max(MAX_NAME_LENGTH),
    lastName: yup.string().trim().required().max(MAX_NAME_LENGTH),
    defaultLanguage: yup.string(),
    currencyCode: yup.string(),
  }),
);

function initialValues() {
  return {
    firstName: user.value.contact?.firstName ?? "",
    lastName: user.value.contact?.lastName ?? "",
    defaultLanguage: user.value?.contact?.defaultLanguage ?? themeContext.value?.defaultLanguage?.cultureName,
    currencyCode: user.value?.contact?.currencyCode ?? themeContext.value?.defaultCurrency?.code,
  };
}

const { defineField, errors, isSubmitting, meta, handleSubmit, resetForm } = useForm({
  validationSchema,
  initialValues: initialValues(),
});

const [firstName] = defineField("firstName");
const [lastName] = defineField("lastName");
const [defaultLanguage] = defineField("defaultLanguage");
const [currencyCode] = defineField("currencyCode");

function applyLanguage(): void {
  unpinLocale();
  removeLocaleFromUrl();
}

async function applyCurrency(): Promise<void> {
  if (user.value?.contact?.currencyCode) {
    await changeCartCurrency({
      command: {
        userId: user.value.id,
        newCurrencyCode: user.value.contact.currencyCode,
      },
    });

    const contactCurrency = supportedCurrencies.value.find((item) => item.code === user.value!.contact!.currencyCode);

    if (contactCurrency) {
      saveCurrencyCode(contactCurrency.code, false);
    }
  }
}

const onSubmit = handleSubmit(async (data) => {
  await updateUser(data);

  resetForm({ values: initialValues() });
  openModal({
    component: ProfileUpdateSuccessModal,
    props: {
      async onClose() {
        applyLanguage();
        await applyCurrency();

        location.reload();
      },
    },
  });
});
</script>
