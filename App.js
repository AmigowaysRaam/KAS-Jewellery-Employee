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
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { ToastProvider } from "./constants/ToastContext";
import StackNavi from "./src/components/navigation/StackNavi";
import { store } from "./src/components/store/store";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

/* 🔔 SHOW NOTIFICATION EVEN IN FOREGROUND */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  const notificationListener = useRef(null);
  const responseListener = useRef(null);
  /** 🔤 Fonts */
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
  /** 🔔 Push notifications */
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log("✅ Expo Push Token:", token);
      }
    });
    // Foreground receive
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log("📩 Foreground notification:", notification);
      });
    // Tap notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log("👉 Notification tapped:", response);
        // Navigate to NotificationScreen
        navigate("Notification");
      });
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
  /** 🌐 Network listener */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  /** ⚙️ Open settings */
  const openSettings = () => {
    Platform.OS === "ios"
      ? Linking.openURL("App-Prefs:root=WIFI")
      : Linking.openSettings();
  };
  if (!fontsLoaded) return null;
  /** 🚫 Disable font scaling */
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;
  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.allowFontScaling = false;

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        {!isConnected ? (
          <View style={styles.centerContainer}>
            <View style={styles.box}>
              <Text style={styles.title}>No Internet Connection</Text>
              <Text style={styles.subtitle}>
                Please check your network settings
              </Text>
              <TouchableOpacity style={styles.button} onPress={openSettings}>
                <Text style={styles.buttonText}>Open Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ToastProvider>
            <NavigationContainer ref={navigationRef}>
              <StackNavi />
            </NavigationContainer>
          </ToastProvider>
        )}
      </SafeAreaView>
    </Provider>
  );
}

/* 🔑 REGISTER FOR EXPO PUSH */
async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert("Must use a physical device");
    return;
  }
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Permission denied");
    return;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId,
  })).data;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
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
