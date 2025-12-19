import { createContext, useContext, useState, useEffect } from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const initialCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");

  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialCart);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setCart(initialCart);
  }, [isAuthenticated]);

  // Fetch cart from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart(response.data.cart);
    } catch (err) {
      if (err.response?.status === 401) setCart(initialCart);
      else console.error("Fetch cart error: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const response = await cartAPI.add({
        productId,
        quantity,
      });
      setCart(response.data.cart);
      return { success: true, message: "Added to cart" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add to cart",
      };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await cartAPI.update(itemId, { quantity });
      setCart(response.data.cart);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update cart",
      };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await cartAPI.remove(itemId);
      setCart(response.data.cart);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to remove item",
      };
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.clear();
      setCart(response.data.cart || initialCart);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to clear cart",
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartItemCount: cart?.totalItems || 0,
    cartTotal: cart?.totalPrice || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
