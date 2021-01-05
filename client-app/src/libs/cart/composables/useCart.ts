import { computed, Ref, ref } from "@vue/composition-api";
import { getMyCart, addItemToCart } from "@core/api/graphql/cart";
import { CartType, ShipmentType, InputShipmentType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";

const loading: Ref<boolean> = ref(true);

const cart: Ref<CartType> = ref({ name: ''});

const isCartSidebarOpen: Ref<boolean> = ref(false);


export default () => {
  function toggleCartSidebar(): void {
    isCartSidebarOpen.value = !isCartSidebarOpen.value;
  }

  async function loadMyCart(): Promise<CartType> {
    loading.value = true;
    try {
      cart.value = await getMyCart();
    } catch (e) {
      Logger.error("useCart.loadMyCart", e);
      throw e;
    } finally {
      loading.value = false;
    }
    return cart.value;
  }

  async function addToCart(productId: string, qty: number) {
    loading.value = true;
    console.log(`addItemToCart ${productId} ${qty}`);
    try {
      await addItemToCart(productId, qty);
    } catch (e) {
      Logger.error("useCart.addItemToCart", e);
      throw e;
    } finally {
      loading.value = false;
    }
    await loadMyCart();
  }

  return {
    cart : computed(() => cart.value),
    loadMyCart,
    addToCart,
    loading : computed(() => loading.value),
    toggleCartSidebar,
    isCartSidebarOpen : computed(() => isCartSidebarOpen.value)
  };
};
