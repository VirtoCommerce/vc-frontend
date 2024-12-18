<template>
  <div class="form-group">
    <label for="cardholderName">Name</label>
    <input id="cardholderName" class="form-control" name="cardholderName" placeholder="Name on the card">
    <label id="cardNumber-label">Card Number</label>
    <div id="number-container" class="form-control"></div>
    <label for="securityCode-container">Security Code</label>
    <div id="securityCode-container" class="form-control"></div>
  </div>

  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="expMonth">Expiry month</label>
      <select id="expMonth" class="form-control">
        <option>01</option>
        <option>02</option>
        <option>03</option>
        <option>04</option>
        <option>05</option>
        <option>06</option>
        <option>07</option>
        <option>08</option>
        <option>09</option>
        <option>10</option>
        <option>11</option>
        <option>12</option>
      </select>
    </div>
    <div class="form-group col-md-6">
      <label for="expYear">Expiry year</label>
      <select id="expYear" class="form-control">
        <option>2025</option>
        <option>2026</option>
        <option>2027</option>
        <option>2028</option>
        <option>2029</option>
        <option>2030</option>
        <option>2031</option>
      </select>
    </div>
  </div>

  <input type="hidden" id="flexresponse" name="flexresponse">

  <VcButton
            class="flex-1 md:order-first md:flex-none"
            data-test-id="pay-now-button"
            @click="sendPaymentData">
    Pay now
  </VcButton>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { noop, useScriptTag } from "@vueuse/core";
import { initializePayment, authorizePayment } from "@/core/api/graphql";
import type { CustomerOrderType, KeyValueType } from "@/core/api/graphql/types";
import type { KeyValuePair } from 'tailwindcss/types/config';

interface IEmits {
  (event: "success"): void;
  (event: "fail", message?: string | null): void;
}

interface IProps {
  order: CustomerOrderType;
  disabled?: boolean;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

declare var Flex: any;

let flex: any;
let microform: any;

function sendPaymentData() {
  const options = {
    expirationMonth: '12', // take from input
    expirationYear: '2025', // take from input
  };

  microform.createToken(options, (err: any, token: any) => {
    if (err) {
      emit('fail', err.message);
      return;
    }

    const parameters = [
      {
        key: 'token',
        value: token
      }
    ]

    authorizePayment({
      orderId: props.order.id,
      paymentId: props.order.inPayments[0]!.id,
      parameters,
    }).then(() => {
      emit('success');
    }).catch((e) => {
      emit('fail', e.message);
    });
  });
}

onMounted(async () => {
  await initPayment();
});

async function initPayment() {
  const { publicParameters, errorMessage } = await initializePayment({
    orderId: props.order.id,
    paymentId: props.order.inPayments[0]!.id,
  });
  // https://jwt.io/libraries
  // clientScript should be taken from jwt token
  // it is neccessary to validate token before using the script from it
  await initScript(getValue(publicParameters!, "clientScript")!);
  await initFlex(getValue(publicParameters!, "jwt")!);
  await initForm();
}

async function initScript(url: string) {
  return new Promise((resolve, reject) => {
    console.log('init script', url);
    const el = document.createElement('script');
    el.src = url;
    el.addEventListener('load', resolve);
    el.addEventListener('error', reject);
    document.body.append(el);
  });
}

async function initForm() {
  const number = microform.createField('number', { placeholder: 'Card number' });
  const securityCode = microform.createField('securityCode', { placeholder: '×××' });
  number.load('#number-container');
  securityCode.load('#securityCode-container');
}

var customStyles = {
  'input': {
    'font-size': '14px',
    'font-family': 'helvetica, tahoma, calibri, sans-serif',
    'color': '#555'
  },
  ':focus': { 'color': 'blue' },
  ':disabled': { 'cursor': 'not-allowed' },
  'valid': { 'color': '#3c763d' },
  'invalid': { 'color': '#a94442' }
};

async function initFlex(key: string) {
  console.log('init form', Flex);
  try {
    flex = new Flex(key);
    // styling
    // https://developer.cybersource.com/docs/cybs/en-us/digital-accept-flex/developer/all/rest/digital-accept-flex/microform-integ-v2/styling-v2.html
    microform = flex.microform({
      styles: customStyles,
    });
  } catch (e) {
    console.error(e);
  }
  console.log('init complete', flex);
}

function getValue(publicParameters: KeyValueType[], key: string) {
  return publicParameters.find(x => x.key === key)?.value;
}

</script>
