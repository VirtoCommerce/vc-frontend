import { Ref, ref, computed } from '@vue/composition-api';
import { searchProducts, searchRelatedProducts, getProduct } from '@core/api/graphql/catalog';
import { Product } from '@core/api/graphql/types';
import { Logger } from '@core/utilities';
import { ProductsSearchParams } from '../types'

export default () => {
  const products: Ref<Product[]> = ref([]);
  const relatedProducts: Ref<Product[]> = ref([]);
  const product: Ref<Product> = ref({ code: '', id:'', name:'', price: {} });
  const total: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(true);

  async function fetchRelatedProducts(id: string)
  {
    loading.value = true;
    try {
      const associations = await searchRelatedProducts(id);
      relatedProducts.value = associations?.map(x=> x.product ) as Product[];
    } catch (e) {
      Logger.error('useProducts.fetchRelatedProducts', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadProduct(id: string)
  {
    loading.value = true;
    try {
      product.value = await getProduct(id);
    } catch (e) {
      Logger.error('useProducts.loadProduct', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProducts(searchParams: ProductsSearchParams) {
    loading.value = true;
    try {
      const productsConnection = await searchProducts(searchParams);
      products.value  = productsConnection?.items as Product[];
      //normalize prices

      total.value = productsConnection.totalCount ?? 0;

    } catch (e) {
      Logger.error('useProducts.fetchProducts', e);
      throw e;
    } finally {
      loading.value = false;
    }


    // products.value = [
    //   {

    //     id: "1",
    //     description : { id: "undef", languageCode: "en-US", reviewType: "fullreview",  content: 'Some description' },

    //     name: 'Black jacket',
    //     code: 'black-jacket',
    //     imgSrc: 'https://s3-eu-west-1.amazonaws.com/commercetools-maximilian/products/081223_1_large.jpg',
    //     price: { list : { decimalDigits: 22, amount: 22.22, formattedAmount: "22.22", formattedAmountWithoutPoint: "22", formattedAmountWithoutCurrency : "", formattedAmountWithoutPointAndCurrency: "" } }

    //   }]
  }
  return {
    fetchProducts,
    loadProduct,
    fetchRelatedProducts,
    relatedProducts: computed(() => relatedProducts.value ),
    products : computed(() => products.value ),
    product : computed(() => product.value ),
    total : computed(() => total.value ),
    loading : computed(() => loading.value )
  };
}
