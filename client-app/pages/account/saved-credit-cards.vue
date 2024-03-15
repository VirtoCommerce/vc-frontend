<template>
  <div>
    <div class="flex justify-between">
      <h2 class="text-3xl font-bold uppercase text-gray-800">
        {{ $t("shared.account.navigation.links.saved_credit_cards") }}
      </h2>
    </div>

    <!-- Skeletons -->
    <div v-if="loading" class="flex flex-col divide-y lg:space-y-3 lg:divide-none">
      <CreditCardSkeleton v-for="item in 3" :key="item" />
    </div>

    <!-- Credit Cards -->
    <div v-else-if="skyflowCards?.length" class="space-y-3 md:space-y-2.5">
      <CreditCard
        v-for="(creditCard, index) in skyflowCards"
        :key="index"
        :card-number="creditCard.cardNumber"
        :card-expiration="creditCard.cardExpiration"
        @remove="removeCreditCard(creditCard.skyflowId)"
      />
    </div>

    <!-- Empty View -->
    <VcEmptyView v-else :text="$t('pages.account.saved_credit_cards.no_cards')">
      <template #icon>
        <VcIcon class="text-warning" size="xxl" name="credit-card" />
      </template>
    </VcEmptyView>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useDeleteSkyflowCardMutation } from "@/core/api/graphql/payment/mutations/deleteSkyflowCard";
import { CreditCard, CreditCardSkeleton } from "@/shared/account";
import { useModal } from "@/shared/modal";
import { useSkyflowCards } from "@/shared/payment";

const { t } = useI18n();
const { openModal } = useModal();
const { loading, skyflowCards, fetchSkyflowCards } = useSkyflowCards();
const { mutate: deleteSkyflowCard } = useDeleteSkyflowCardMutation();

function removeCreditCard(skyflowId: string): void {
  const closeModal = openModal({
    component: "VcConfirmationModal",
    props: {
      variant: "danger",
      iconVariant: "danger",
      title: t("pages.account.saved_credit_cards.delete_credit_card_modal.title"),
      text: t("pages.account.saved_credit_cards.delete_credit_card_modal.message"),

      async onConfirm(): Promise<void> {
        closeModal();
        await deleteSkyflowCard({ command: { skyflowId } });
      },
    },
  });
}

void fetchSkyflowCards();
</script>
