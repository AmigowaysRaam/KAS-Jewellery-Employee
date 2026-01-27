import {
  Poppins_100Thin, Poppins_100Thin_Italic,
  Poppins_200ExtraLight, Poppins_200ExtraLight_Italic,
  Poppins_300Light, Poppins_300Light_Italic,
  Poppins_400Regular, Poppins_400Regular_Italic,
  Poppins_500Medium, Poppins_500Medium_Italic,
  Poppins_600SemiBold, Poppins_600SemiBold_Italic,
  Poppins_700Bold, Poppins_700Bold_Italic,
  Poppins_800ExtraBold, Poppins_800ExtraBold_Italic,
  Poppins_900Black, Poppins_900Black_Italic,
  useFonts,
} from "@expo-google-fonts/poppins";
import NetInfo from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Linking, Platform,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { ToastProvider } from './constants/ToastContext';
import StackNavi from "./src/components/navigation/StackNavi";
import { store } from "./src/components/store/store";
export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  /** 🔤 Load ALL fonts */
  const [fontsLoaded] = useFonts({
    Poppins_100Thin, Poppins_100Thin_Italic,
    Poppins_200ExtraLight, Poppins_200ExtraLight_Italic,
    Poppins_300Light, Poppins_300Light_Italic,
    Poppins_400Regular, Poppins_400Regular_Italic,
    Poppins_500Medium, Poppins_500Medium_Italic,
    Poppins_600SemiBold, Poppins_600SemiBold_Italic,
    Poppins_700Bold, Poppins_700Bold_Italic,
    Poppins_800ExtraBold, Poppins_800ExtraBold_Italic,
    Poppins_900Black, Poppins_900Black_Italic,
  });

  /** 🌐 Network listener */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);
  /** ⚙️ Open device settings */
  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:root=WIFI");
    } else {
      Linking.openSettings();
    }
  };
  if (!fontsLoaded) return null;
  /** 🚫 Disable font scaling globally */
  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        {!isConnected ? (
          /** 🔴 CENTERED OFFLINE VIEW */
          <View style={styles.centerContainer}>
            <View style={styles.box}>
              <Text style={styles.title}>No Internet Connection</Text>
              <Text style={styles.subtitle}>
                Please check your network settings
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.button}
                onPress={openSettings}
              >
                <Text style={styles.buttonText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /** 🟢 NORMAL APP FLOW */
          <ToastProvider>
            <NavigationContainer>
              <StackNavi />
            </NavigationContainer>
          </ToastProvider>
        )}
      </SafeAreaView>
    </Provider>
  );
}
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 320,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF4D4D",
    backgroundColor: "#FFF1F1",
    alignItems: "center",
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#D8000C",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
    fontSize: 14,
  },
});
