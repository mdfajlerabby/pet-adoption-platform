"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

const PreferencesContext = createContext(null);
const THEME_KEY = "pawfect-theme";
const WISHLIST_KEY = "pawfect-wishlist";
const EMPTY_WISHLIST = "[]";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("pawfect-preference-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("pawfect-preference-change", callback);
  };
}

function getThemeSnapshot() {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Unable to read the saved theme:", error.message);
    return "light";
  }
}

function getWishlistSnapshot() {
  try {
    const saved = window.localStorage.getItem(WISHLIST_KEY);
    if (!saved) return EMPTY_WISHLIST;
    const pets = JSON.parse(saved);
    if (!Array.isArray(pets)) throw new Error("Saved pet list is not an array.");
    return JSON.stringify(pets.filter((pet) => pet && typeof pet === "object" && (pet._id || pet.id)));
  } catch (error) {
    console.error("Unable to read saved pets:", error.message);
    return EMPTY_WISHLIST;
  }
}

function getLightTheme() {
  return "light";
}

function getEmptyWishlist() {
  return EMPTY_WISHLIST;
}

function writePreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event("pawfect-preference-change"));
  } catch (error) {
    throw new Error(`Your browser could not save this preference: ${error.message}`);
  }
}

export function PreferencesProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getLightTheme);
  const wishlistJSON = useSyncExternalStore(subscribe, getWishlistSnapshot, getEmptyWishlist);
  const wishlist = useMemo(() => JSON.parse(wishlistJSON), [wishlistJSON]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    writePreference(THEME_KEY, theme === "dark" ? "light" : "dark");
  }, [theme]);

  const toggleWishlist = useCallback((pet) => {
    const id = String(pet._id || pet.id || "");
    if (!id) throw new Error("This pet could not be saved because its listing ID is missing.");
    const savedPets = JSON.parse(getWishlistSnapshot());
    const exists = savedPets.some((savedPet) => String(savedPet._id || savedPet.id) === id);
    const nextPets = exists
      ? savedPets.filter((savedPet) => String(savedPet._id || savedPet.id) !== id)
      : [{ ...pet, _id: id }, ...savedPets];
    writePreference(WISHLIST_KEY, JSON.stringify(nextPets));
    return !exists;
  }, []);

  const isWishlisted = useCallback(
    (pet) => wishlist.some((savedPet) => String(savedPet._id || savedPet.id) === String(pet._id || pet.id)),
    [wishlist],
  );

  const value = useMemo(
    () => ({ theme, toggleTheme, wishlist, toggleWishlist, isWishlisted }),
    [theme, toggleTheme, wishlist, toggleWishlist, isWishlisted],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider.");
  return context;
}
