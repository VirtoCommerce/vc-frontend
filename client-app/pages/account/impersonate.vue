<template>
  <VcEmptyPage class="impersonate" icon="outline-security" image="sign-in.jpg">
    <div v-if="!userId" class="impersonate__error">
      <VcAlert color="danger" variant="outline-dark" size="md" icon>
        {{ $t("pages.account.impersonate.errors.invalid_user_id") }}
      </VcAlert>

      <VcButton class="impersonate__back" @click="goHome">
        {{ $t("pages.account.impersonate.back_to_home") }}
      </VcButton>
    </div>

    <div v-else-if="canSkipVerification" class="impersonate__silent">
      <template v-if="translatedSilentErrors.length === 0">
        <VcLoaderOverlay no-bg />

        <VcTypography class="impersonate__silent-message">
          {{ $t("pages.account.impersonate.switching_in_progress") }}
        </VcTypography>
      </template>

      <template v-else>
        <VcAlert
          v-for="(message, index) in translatedSilentErrors"
          :key="`${index}-${message}`"
          class="impersonate__silent-error"
          color="danger"
          variant="outline-dark"
          size="md"
          icon
        >
          {{ message }}
        </VcAlert>

        <VcButton class="impersonate__back" @click="goHome">
          {{ $t("pages.account.impersonate.back_to_home") }}
        </VcButton>
      </template>
    </div>

    <SecurityVerificationForm v-else :target-user-id="userId" @success="onSuccess" @cancel="onCancel" />
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { StorefrontPermissions } from "@/core/enums";
import { SecurityVerificationForm, useImpersonate, useUser } from "@/shared/account";
import type { IdentityErrorType } from "@/core/api/graphql/types";

interface IProps {
  userId: string;
}

const props = defineProps<IProps>();

const router = useRouter();
const i18n = useI18n();
const { t } = i18n;
const { isAuthenticated, checkPermissions, operator } = useUser();
const { impersonateAuthenticated, errors } = useImpersonate();

usePageHead({
  title: t("pages.account.impersonate.title"),
});

const canSkipVerification = computed<boolean>(
  () => isAuthenticated.value && (!!operator.value || checkPermissions(StorefrontPermissions.CanImpersonate)),
);

const ERROR_LOCALE_NAMESPACES = ["pages.account.impersonate.errors", "shared.account.sign_in_form.errors"] as const;

function translateError(error: IdentityErrorType): string | undefined {
  const code = error.code;
  if (code) {
    const namespace = ERROR_LOCALE_NAMESPACES.find((ns) => i18n.te(`${ns}.${code}`));
    if (namespace) {
      return i18n.t(`${namespace}.${code}`);
    }
  }
  return error.description ?? undefined;
}

const translatedSilentErrors = computed<string[]>(() => {
  const list = errors.value ?? [];
  return list
    .map((error) => translateError(error))
    .filter((message): message is string => typeof message === "string" && message.length > 0);
});

function goHome(): void {
  void router.push("/");
}

function onCancel(): void {
  goHome();
}

function onSuccess(): void {
  // useImpersonate handles broadcast and reload; nothing extra to do here.
}

onMounted(() => {
  if (!props.userId) {
    return;
  }

  if (canSkipVerification.value) {
    void impersonateAuthenticated(props.userId);
  }
});
</script>

<style lang="scss">
.impersonate {
  &__error {
    @apply mx-auto flex w-full max-w-md flex-col gap-4 text-start;
  }

  &__silent {
    @apply relative mx-auto flex min-h-32 w-full max-w-md flex-col gap-4 text-start;
  }

  &__silent-message {
    @apply text-center;
  }

  &__silent-error {
    @apply mb-0;
  }

  &__back {
    @apply self-start;
  }
}
</style>
