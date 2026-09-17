<template>
  <div>
    <VcTypography tag="h1">
      {{ $t("skyflow.saved_credit_cards.menu_title") }}
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
    <VcEmptyView v-else :text="$t('skyflow.saved_credit_cards.no_cards')" icon="credit-card" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { replaceXFromBeginning } from "@/core/utilities";
import { useModal } from "@/shared/modal";
import { useDeleteSkyflowCard } from "../api/graphql";
import CreditCardSkeleton from "../components/credit-card-skeleton.vue";
import CreditCard from "../components/credit-card.vue";
import { useSkyflowCards } from "../composables";

const { t } = useI18n();
const { openModal } = useModal();
const { loading, skyflowCards, fetchSkyflowCards } = useSkyflowCards();
const { mutate: deleteSkyflowCard } = useDeleteSkyflowCard();
const { storeId } = globals;

function removeCreditCard(skyflowId: string): void {
  const closeModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      title: t("skyflow.saved_credit_cards.delete_credit_card_modal.title"),
      text: t("skyflow.saved_credit_cards.delete_credit_card_modal.message"),

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
