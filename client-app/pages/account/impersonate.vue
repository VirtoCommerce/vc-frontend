<template>
  <VcEmptyPage class="impersonate" icon="outline-security" image="sign-in.jpg">
    <div v-if="canSkipVerification" class="impersonate__silent">
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

    <div v-else class="impersonate__verify">
      <VcTypography tag="h1" class="impersonate__title">
        {{ $t("pages.account.impersonate.title") }}
      </VcTypography>

      <p class="impersonate__subtitle">
        {{ $t("pages.account.impersonate.subtitle") }}
      </p>

      <p class="impersonate__description">
        {{ $t("pages.account.impersonate.description") }}
      </p>

      <VcAlert
        v-if="isAuthenticated"
        class="impersonate__denied"
        color="danger"
        variant="outline-dark"
        size="sm"
        icon
        data-test-id="impersonate-no-permission-alert"
      >
        {{ $t("pages.account.impersonate.no_permission") }}
      </VcAlert>

      <ImpersonateForm
        v-if="hasPasswordAuthentication"
        :target-user-id="userId"
        @success="onSuccess"
        @cancel="onCancel"
      />

      <template v-else>
        <IdentityProviders
          :providers="identityProviders"
          :return-url="returnUrl"
          class="impersonate__providers impersonate__providers--only"
        />

        <VcButton
          class="impersonate__cancel"
          variant="outline"
          no-wrap
          data-test-id="impersonate-providers-cancel-button"
          @click="onCancel"
        >
          {{ $t("shared.account.impersonate_form.cancel_button") }}
        </VcButton>
      </template>
    </div>

    <template v-if="showProvidersAside" #side>
      <div class="impersonate__side">
        <SignInDivider>{{ $t("pages.sign_in.divider_text") }}</SignInDivider>

        <IdentityProviders :providers="identityProviders" :return-url="returnUrl" class="impersonate__providers" />
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useErrorsTranslator, usePageHead } from "@/core/composables";
import { PlatformPermissions } from "@/core/enums";
import { ImpersonateForm, useImpersonate, useUser } from "@/shared/account";
import { useIdentityProviders } from "@/shared/sign-in/composables/useIdentityProviders";
import type { IdentityErrorType } from "@/core/api/graphql/types";
import SignInDivider from "@/shared/sign-in/components/sign-in-divider.vue";

interface IProps {
  userId: string;
}

const props = defineProps<IProps>();

const IdentityProviders = defineAsyncComponent(() => import("@/shared/sign-in/components/identity-providers.vue"));

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { isAuthenticated, checkPermissions, operator } = useUser();
const { impersonateAuthenticated, errors } = useImpersonate();
const { identityProviders, hasIdentityProviders, hasOnlyIdentityProviders, hasPasswordAuthentication } =
  useIdentityProviders();

usePageHead({
  title: t("pages.account.impersonate.title"),
});

const canSkipVerification = computed<boolean>(
  () => isAuthenticated.value && (!!operator.value || checkPermissions(PlatformPermissions.CanImpersonate)),
);

// Identity providers bring the operator back to this page, where the verification
// is skipped and the impersonation starts automatically.
const returnUrl = computed<string>(() => route.fullPath);

const showProvidersAside = computed<boolean>(
  () => !canSkipVerification.value && hasIdentityProviders.value && !hasOnlyIdentityProviders.value,
);

const { translate } = useErrorsTranslator<IdentityErrorType>("shared.account.impersonate_form.errors");

const translatedSilentErrors = computed<string[]>(() => {
  const list = errors.value ?? [];
  return list
    .map((error) => translate(error))
    .filter((message): message is string => typeof message === "string" && !!message);
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

let triggered = false;
watch(
  canSkipVerification,
  (canSkip) => {
    if (canSkip && !triggered) {
      triggered = true;
      void impersonateAuthenticated(props.userId);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.impersonate {
  &__silent {
    @apply relative order-first mx-auto flex min-h-32 w-full max-w-md flex-col gap-4 text-start;
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

  &__verify {
    @apply order-first mx-auto flex w-full max-w-md flex-col text-start;
  }

  &__title {
    @apply mb-2;
  }

  &__subtitle {
    @apply mb-2 text-base font-semibold text-neutral-900;
  }

  &__description {
    @apply mb-6 text-sm text-neutral-700;
  }

  &__side {
    @apply mt-8 flex w-full flex-col gap-8;

    @media (width > theme("screens.sm")) {
      @apply w-72 flex-row gap-6;
    }

    @media (width > theme("screens.lg")) {
      @apply w-[30rem] gap-16;
    }
  }

  &__denied {
    @apply mb-6;
  }

  &__cancel {
    @apply mt-6 self-start;
  }

  &__providers {
    @apply max-sm:mx-auto;

    @media (width > theme("screens.lg")) {
      @apply w-60;
    }

    &--only {
      @apply w-full max-sm:mx-0;

      @media (width > theme("screens.lg")) {
        @apply w-full;
      }
    }
  }
}
</style>
