import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { BASE_URL } from "../src/components/api/Api";

// Initial i18n setup
i18n.use(initReactI18next).init({
  lng: "en", // default language
  fallbackLng: "en",
  resources: {}, // start empty
  interpolation: { escapeValue: false },
});

// Load translations from API and save language code locally
export const loadTranslationsFromAPI = async (lang = "en") => {
  try {
    const response = await fetch(`${BASE_URL}app-employee-language-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "13", lang_code:lang }),
    });
    const json = await response.json();
    const translations = json.data || {};
    // Add translations to i18n
    i18n.addResourceBundle(lang, "translation", translations, true, true);
    i18n.changeLanguage(lang);
    // ✅ Store the language code locally
    await AsyncStorage.setItem("user-language", lang);
    // console.log("Translations loaded:", translations);
  } catch (error) {
    console.error("Failed to load translations from API:", error);
  }
};

// Load stored language on app start
export const loadStoredLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem("user-language");
    if (savedLang) {
      await loadTranslationsFromAPI(savedLang);
    } else {
      await loadTranslationsFromAPI("en"); // fallback
    }
  } catch (error) {
    console.error("Error loading stored language:", error);
  }
};

export const setAppLanguage = async (lang) => {
  try {
    // 1. Load translations from API
    await loadTranslationsFromAPI(lang);
    // 2. Save language code locally for future API calls
    await AsyncStorage.setItem("user-language", lang);
    // console.log("App language set to:", lang);
  } catch (error) {
    console.error("Error setting app language:", error);
  }
};
// ✅ Get stored language code (to send in API requests)
export const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem("user-language");
    return lang || "en"; // default to English if nothing stored
  } catch (error) {
    console.error("Error getting stored language:", error);
    return "en";
  }
};

export default i18n;
