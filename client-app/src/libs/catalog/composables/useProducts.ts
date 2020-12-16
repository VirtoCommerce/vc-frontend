import { Ref, ref} from '@vue/composition-api';
import { Product } from '@core/api/graphql/types'

export default () => {
  const products: Ref<Product[]> = ref([]);
  const total: Ref<number> = ref(0);

  function fetchProducts() {

    products.value = [{
      id: "1",
      description : { id: "undef", languageCode: "en-US", reviewType: "fullreview",  content: 'Some description' },
      name: 'Black jacket',
      code: 'black-jacket',
      imgSrc: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081223_1_large.jpg',
      price: { list : { decimalDigits: 22, amount: 22.22, formattedAmount: "22.22", formattedAmountWithoutPoint: "22", formattedAmountWithoutCurrency : "", formattedAmountWithoutPointAndCurrency: "" } }
    }, {
      id: "2",
      description : { id: "undef", languageCode: "en-US", reviewType: "fullreview",  content: 'Some description' },
      name: 'White jacket',
      code: 'white-jacket',
      imgSrc: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081223_1_large.jpg',
      price: { list : { decimalDigits: 22, amount: 22.22, formattedAmount: "22.22", formattedAmountWithoutPoint: "22", formattedAmountWithoutCurrency : "", formattedAmountWithoutPointAndCurrency: "" } }
    }, {
      id: "3",
      description : { id: "undef", languageCode: "en-US", reviewType: "fullreview",  content: 'Some description' },
      name: 'Green jacket',
      code: 'green-jacket',
      imgSrc: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081223_1_large.jpg',
      price: { list : { decimalDigits: 22, amount: 22.22, formattedAmount: "22.22", formattedAmountWithoutPoint: "22", formattedAmountWithoutCurrency : "", formattedAmountWithoutPointAndCurrency: "" } }
    }, {
      id: "4",
      description : { id: "undef", languageCode: "en-US", reviewType: "fullreview",  content: 'Some description' },
      name: 'Red jacket',
      code: 'red-jacket',
      imgSrc: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081223_1_large.jpg',
      price: { list : { decimalDigits: 22, amount: 22.22, formattedAmount: "22.22", formattedAmountWithoutPoint: "22", formattedAmountWithoutCurrency : "", formattedAmountWithoutPointAndCurrency: "" } }
    }, {
      id: "5",
      description : { id: "undef", languageCode: "en-US", reviewType: "fullreview",  content: 'Some description' },
      name: 'Cheese jacket',
      code: 'cheese-jacket',
      imgSrc: 'https://cdn.castellocheese.com/globalassets/occasions/cheeseboard/cast_vertical_lift_main_1253x1880.jpg',
      price: { list : { decimalDigits: 22, amount: 22.22, formattedAmount: "22.22", formattedAmountWithoutPoint: "22", formattedAmountWithoutCurrency : "", formattedAmountWithoutPointAndCurrency: "" } }
    }]
  }
  return { fetchProducts, products,  total };
}
