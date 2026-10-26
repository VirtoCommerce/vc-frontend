<template>
  <div class="add-card-authorize-net">
    <VcAlert v-if="initError" color="danger" size="sm" variant="soft" icon>{{ initError }}</VcAlert>

    <VcLoaderWithText v-else-if="!initialized" />

    <form v-else class="add-card-authorize-net__form" @submit.prevent="addCard">
      <BankCardForm
        :key="cardFormKey"
        v-model="card"
        v-model:valid="cardValid"
        :errors="cardErrors"
        :disabled="adding"
        class="xl:w-2/3"
        @submit="addCard"
      />

      <fieldset class="add-card-authorize-net__billing">
        <legend class="add-card-authorize-net__legend">
          {{ $t("shared.payment.saved_cards.billing_title") }}
          <span class="add-card-authorize-net__hint">{{ $t("shared.payment.saved_cards.billing_hint") }}</span>
        </legend>

        <VcInput
          v-model="billing.address"
          class="add-card-authorize-net__address"
          :label="$t('shared.payment.saved_cards.address')"
          required
          autocomplete="address-line1"
          :disabled="adding"
          test-id="authorize-net-billing-address"
        />

        <VcInput
          v-model="billing.city"
          :label="$t('shared.payment.saved_cards.city')"
          autocomplete="address-level2"
          :disabled="adding"
          test-id="authorize-net-billing-city"
        />

        <VcInput
          v-model="billing.state"
          :label="$t('shared.payment.saved_cards.state')"
          autocomplete="address-level1"
          :disabled="adding"
          test-id="authorize-net-billing-state"
        />

        <VcInput
          v-model="billing.zip"
          :label="$t('shared.payment.saved_cards.zip')"
          required
          autocomplete="postal-code"
          :disabled="adding"
          test-id="authorize-net-billing-zip"
        />
      </fieldset>

      <slot />

      <VcAlert v-if="addError" color="danger" size="sm" variant="soft" icon class="mt-3" role="alert">{{
        addError
      }}</VcAlert>

      <VcButton class="mt-4" type="submit" :disabled="!canAdd" :loading="adding" data-test-id="saved-card-add">
        {{ $t("shared.payment.saved_cards.add") }}
      </VcButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useCustomerAddresses } from "@/shared/account/composables";
import { useAuthorizeNet } from "@/shared/payment/composables/useAuthorizeNet";
import { addSavedPaymentMethod } from "../api/graphql";
import { savedCardErrorMessage as errorMessage } from "../utils/saved-card-label";
import type { GetCardPaymentMethodsQuery } from "../api/graphql/types";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";
import BankCardForm from "@/shared/payment/components/bank-card-form.vue";

interface IProps {
  method: GetCardPaymentMethodsQuery["cardPaymentMethods"][number];
  setDefault: boolean;
}

interface IEmits {
  (event: "added"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const ADDRESS_TYPE_BILLING = 1;
const ADDRESS_TYPE_BILLING_AND_SHIPPING = 3;

const { t } = useI18n();
// The customer's addresses, to default the card's billing address to their billing address.
const { addresses } = useCustomerAddresses(20);

const initialized = ref(false);
const initError = ref<string>();
const adding = ref(false);
const addError = ref<string>();
const cardValid = ref(false);
const cardErrors = ref<BankCardErrorsType>({});
const cardFormKey = ref(0);
const card = ref<BankCardType>({ cardholderName: "", number: "", month: "", year: "", securityCode: "" });
const billing = reactive({ firstName: "", lastName: "", address: "", city: "", state: "", zip: "", country: "" });

function parameter(key: string): string {
  return props.method.publicParameters.find((x) => x.key === key)?.value ?? "";
}

const scriptURL = computed(() => parameter("acceptJsPath"));
const { loadAcceptJS, dispatchData } = useAuthorizeNet({ scriptURL, manualScriptLoading: true });

const canAdd = computed(() => cardValid.value && !!billing.address.trim() && !!billing.zip.trim() && !adding.value);

/** Accept.js field errors, shown on the field: https://developer.authorize.net/api/reference/features/acceptjs.html */
const FIELD_ERRORS: Record<string, keyof BankCardErrorsType> = {
  E_WC_05: "number",
  E_WC_06: "month",
  E_WC_07: "year",
  E_WC_08: "year",
  E_WC_15: "securityCode",
  E_WC_17: "cardholderName",
};

function tokenize(): Promise<Accept.OpaqueData | null> {
  const { month, year, number: cardNumber, securityCode: cardCode, cardholderName: fullName } = card.value;

  return new Promise((resolve, reject) => {
    try {
      dispatchData(
        {
          authData: { apiLoginID: parameter("apiLogin"), clientKey: parameter("clientKey") },
          cardData: { cardNumber, month, year, cardCode, fullName },
        },
        (response: Accept.Response) => {
          if (response.messages.resultCode === "Error") {
            const errors: BankCardErrorsType = {};
            response.messages.message.forEach(({ code, text }) => {
              const field = FIELD_ERRORS[code];
              if (field) {
                errors[field] = text;
              } else {
                addError.value = text;
              }
            });
            cardErrors.value = errors;
            resolve(null);
          } else {
            resolve(response.opaqueData ?? null);
          }
        },
      );
    } catch (e) {
      reject(e instanceof Error ? e : new Error("Authorize.Net dispatchData failed"));
    }
  });
}

/** The card's billing address defaults to the customer's billing address. */
function prefillBilling() {
  const address =
    addresses.value.find(
      (x) => x.isDefault && [ADDRESS_TYPE_BILLING, ADDRESS_TYPE_BILLING_AND_SHIPPING].includes(x.addressType ?? 0),
    ) ??
    addresses.value.find((x) => x.isDefault) ??
    addresses.value[0];

  if (!address || billing.address) {
    return;
  }

  billing.firstName = address.firstName ?? "";
  billing.lastName = address.lastName ?? "";
  billing.address = [address.line1, address.line2].filter(Boolean).join(" ");
  billing.city = address.city ?? "";
  billing.state = address.regionName ?? address.regionId ?? "";
  billing.zip = address.postalCode ?? "";
  billing.country = address.countryCode ?? "";
}

async function addCard() {
  if (!canAdd.value) {
    return;
  }

  adding.value = true;
  addError.value = undefined;

  try {
    const opaqueData = await tokenize();
    if (!opaqueData) {
      return;
    }

    const [firstName, ...lastName] = (card.value.cardholderName || `${billing.firstName} ${billing.lastName}`)
      .trim()
      .split(/\s+/);

    await addSavedPaymentMethod({
      storeId: globals.storeId ?? "",
      paymentMethodCode: props.method.paymentMethodCode,
      setDefault: props.setDefault,
      parameters: [
        { key: "dataDescriptor", value: opaqueData.dataDescriptor },
        { key: "dataValue", value: opaqueData.dataValue },
        { key: "billingFirstName", value: firstName ?? "" },
        { key: "billingLastName", value: lastName.join(" ") },
        { key: "billingAddress", value: billing.address.trim() },
        { key: "billingCity", value: billing.city.trim() },
        { key: "billingState", value: billing.state.trim() },
        { key: "billingZip", value: billing.zip.trim() },
        { key: "billingCountry", value: billing.country },
      ],
    });

    card.value = { cardholderName: "", number: "", month: "", year: "", securityCode: "" };
    cardFormKey.value++;
    emit("added");
  } catch (e) {
    Logger.error("add-card-authorize-net.addCard", e);
    addError.value = errorMessage(e, t("shared.payment.saved_cards.error"));
  } finally {
    adding.value = false;
  }
}

watch(card, () => (cardErrors.value = {}));
watch(addresses, prefillBilling, { immediate: true });

onMounted(async () => {
  if (!scriptURL.value || !parameter("apiLogin") || !parameter("clientKey")) {
    initError.value = t("shared.payment.saved_cards.form_unavailable");
    return;
  }

  try {
    await loadAcceptJS();
    initialized.value = true;
  } catch (e) {
    Logger.error("add-card-authorize-net.init", e);
    initError.value = t("shared.payment.saved_cards.form_unavailable");
  }
});
</script>

<style lang="scss">
.add-card-authorize-net {
  &__billing {
    @apply mt-5 grid gap-3 xl:w-2/3 sm:grid-cols-2;
  }

  &__legend {
    @apply mb-2 flex flex-col text-sm font-bold text-neutral-900;
  }

  &__hint {
    @apply text-xs font-normal text-neutral-600;
  }

  &__address {
    @apply sm:col-span-2;
  }
}
</style>
