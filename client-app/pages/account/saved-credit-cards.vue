<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("shared.account.navigation.links.saved_credit_cards") }}
    </VcTypography>

    <!-- Skeletons -->
    <div v-if="loading" class="flex flex-col divide-y lg:space-y-3 lg:divide-none">
      <CreditCardSkeleton v-for="item in 3" :key="item" />
    </div>

    <!-- Credit Cards -->
    <div v-else-if="skyflowCards?.length" class="space-y-3 md:space-y-2.5">
      <CreditCard
        v-for="(creditCard, index) in skyflowCards"
        :key="index"
        :card-number="replaceXFromBeginning(creditCard.cardNumber)"
        :card-expiration="creditCard.cardExpiration"
        :card-active="creditCard.active"
        @remove="removeCreditCard(creditCard.skyflowId)"
      />
    </div>

    <!-- Empty View -->
    <VcEmptyView v-else :text="$t('pages.account.saved_credit_cards.no_cards')" icon="credit-card" />
  </div>
</template>

<script setup lang="ts">
import { useMutation } from "@vue/apollo-composable";
import { useI18n } from "vue-i18n";
import { DeleteSkyFlowCardDocument, OperationNames } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { replaceXFromBeginning } from "@/core/utilities";
import { CreditCard, CreditCardSkeleton } from "@/shared/account";
import { useModal } from "@/shared/modal";
import { useSkyflowCards } from "@/shared/payment";

const { t } = useI18n();
const { openModal } = useModal();
const { loading, skyflowCards, fetchSkyflowCards } = useSkyflowCards();
const { mutate: deleteSkyflowCard } = useMutation(DeleteSkyFlowCardDocument, {
  refetchQueries: [OperationNames.Query.GetSkyflowCards],
});
const { storeId } = globals;

function removeCreditCard(skyflowId: string): void {
  const closeModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      title: t("pages.account.saved_credit_cards.delete_credit_card_modal.title"),
      text: t("pages.account.saved_credit_cards.delete_credit_card_modal.message"),

      async onConfirm(): Promise<void> {
        closeModal();
        await deleteSkyflowCard({
          command: { skyflowId, storeId },
        });
      },
    },
  });
}

void fetchSkyflowCards();
</script>
