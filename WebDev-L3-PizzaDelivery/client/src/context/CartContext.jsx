
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "pizzahub_cart";

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(readCart);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const showNotification = useCallback((name) => {
    setNotification({
      message: `${name} added to cart successfully!`,
      id: Date.now(),
    });

    setTimeout(() => {
      setNotification(null);
    }, 2500);
  }, []);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product || !product.name) {
      throw new Error("Invalid product");
    }

    const price = Number(product.price);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Invalid product price");
    }

    const isCustom = Boolean(product.isCustom);
    const itemId = isCustom
      ? `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      : String(product._id || product.id || "");

    if (!itemId) {
      throw new Error("Product ID is missing");
    }

    const newItem = {
      id: itemId,
      productId: isCustom ? null : itemId,
      name: product.name,
      price,
      image: product.image || "",
      quantity: Math.max(1, Number(quantity) || 1),
      isCustom,
      size: product.size || "",
      crust: product.crust || "",
      cheese: product.cheese || "",
      toppings: Array.isArray(product.toppings)
        ? product.toppings
        : [],
      foodType: product.foodType || "Pizza",
      category: product.category || "Veg",
    };

    setCartItems((previous) => {
      if (!isCustom) {
        const existing = previous.find(
          (item) => item.productId === itemId && !item.isCustom
        );

        if (existing) {
          return previous.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  quantity: item.quantity + newItem.quantity,
                }
              : item
          );
        }
      }

      return [...previous, newItem];
    });

    showNotification(product.name);
  }, [showNotification]);

  const updateQuantity = useCallback((id, quantity) => {
    const newQuantity = Math.max(
      1,
      Math.min(10, Number(quantity) || 1)
    );

    setCartItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      itemCount,
    }),
    [
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      itemCount,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}

      {/* Add to Cart Notification */}
      {notification && (
        <div className="fixed right-5 top-5 z-[9999] w-[calc(100%-40px)] max-w-sm animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-white p-4 shadow-2xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl text-green-600">
              ✓
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-green-700">
                Added to Cart!
              </p>

              <p className="truncate text-sm text-gray-600">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-xl text-gray-400 hover:text-gray-700"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
