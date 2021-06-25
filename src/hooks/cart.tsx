import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      // await AsyncStorage.removeItem('@GoMarketplace:products');
      const storage = await AsyncStorage.getItem('@GoMarketplace:products');
      if (storage) {
        setProducts(JSON.parse(storage));
      }
    }

    loadProducts();
  }, []);

  async function saveProducts(productsArray: Product[]) {
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(productsArray),
    );
  }

  const addToCart = useCallback(
    async (product: Product) => {
      const newCart = [...products];

      const productAdded = newCart.find(
        cartProduct => cartProduct.id === product.id,
      );

      if (productAdded) {
        productAdded.quantity++;
        await saveProducts(newCart);
        setProducts(newCart);
        return;
      }

      product.quantity = 1;
      await saveProducts([...newCart, product]);
      setProducts([...newCart, product]);
    },
    [products, setProducts, saveProducts],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newCart = [...products];

      const product = newCart.find(cartProduct => cartProduct.id === id);

      product!.quantity++;

      await saveProducts(newCart);
      setProducts(newCart);
    },
    [products, setProducts, saveProducts],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      let newCart = [...products];

      const product = newCart.find(cartProduct => cartProduct.id === id);

      if (product?.quantity === 1) {
        const removedCart = newCart.filter(
          cartProduct => cartProduct.id !== id,
        );
        await saveProducts(removedCart);
        setProducts(removedCart);
        return;
      }

      product!.quantity--;
      await saveProducts(newCart);
      setProducts(newCart);
    },
    [products, setProducts, saveProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
