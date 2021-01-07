import { Ref, ref, computed } from '@vue/composition-api';
import { searchProducts, getProduct } from '@core/api/graphql/catalog';
import { Product } from '@core/api/graphql/types'
import { Logger } from '@core/utilities';

export default () => {
  const products: Ref<Product[]> = ref([]);
  const relatedProducts: Ref<Product[]> = ref([]);
  const product: Ref<Product> = ref({ code: '', id:'', name:''});
  const total: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(true);

  async function searchRelatedProducts(id: string)
  {
    console.log('searchRelatedProducts');
  }

  async function loadProduct(id: string)
  {
    loading.value = true;
    try {
      product.value = await getProduct(id);
    } catch (e) {
      Logger.error('getProduct.loadProduct', e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProducts(itemsPerPage: number, page: number, catId: string | null) {
    loading.value = true;
    try {
      const productsConnection = await searchProducts(itemsPerPage, page, catId);
      products.value  = productsConnection?.items as Product[];
      total.value = productsConnection.totalCount ?? 0;

    } catch (e) {
      Logger.error('useProduct.fetchProducts', e);
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
    searchRelatedProducts,
    relatedProducts: computed(() => relatedProducts.value ),
    products : computed(() => products.value ),
    product : computed(() => product.value ),
    total : computed(() => total.value ),
    loading : computed(() => loading.value )
  };
}
