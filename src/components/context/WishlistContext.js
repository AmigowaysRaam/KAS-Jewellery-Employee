import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    const data = await AsyncStorage.getItem("wishlist");

    if (data) {
      const parsed = JSON.parse(data);

      // 🔒 REMOVE NULL / INVALID ITEMS
      const clean = Array.isArray(parsed)
        ? parsed.filter(item => item && item.id)
        : [];

      setWishlist(clean);
    }
  };

  const saveWishlist = async (data) => {
    const clean = data.filter(item => item && item.id);
    await AsyncStorage.setItem("wishlist", JSON.stringify(clean));
    setWishlist(clean);
  };

  const addToWishlist = (product) => {
    if (!product || !product.id) return;

    const exists = wishlist.some(item => item?.id === product.id);
    if (!exists) {
      saveWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (id) => {
    if (!id) return;
    saveWishlist(wishlist.filter(item => item?.id !== id));
  };

  const isWishlisted = (id) => {
    if (!id) return false;
    return wishlist.some(item => item?.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

