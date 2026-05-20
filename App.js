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
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Modal,
  Platform, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import VersionCheck from "react-native-version-check";
import { Provider } from "react-redux";
import { COLORS } from "./app/resources/colors";
import { hp } from "./app/resources/dimensions";
import { ToastProvider } from "./constants/ToastContext";
import NoInternetScreen from "./NoInternetScreen";
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
  const [visible, setVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const notificationListener = useRef(null);
  const responseListener = useRef(null);
  const colorScheme = useColorScheme(); // 'dark' or 'light'

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

  /** 🌐 Network listener */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  /** 🔄 Version Check */
  useEffect(() => {
    checkVersion();
  }, []);

  useEffect(() => {
    // 🔔 When notification is tapped (foreground/background)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
  
      if (data?.openCalendar) {
        openCalendarApp();
      }
    });
  
    // 🔥 When app is opened from killed state
    const checkInitialNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
  
      if (response?.notification?.request?.content?.data?.openCalendar) {
        openCalendarApp();
      }
    };
  
    checkInitialNotification();
  
    return () => {
      subscription.remove();
    };
  }, []);

  const openCalendarApp = async () => {
    try {
      console.log("📅 Opening calendar from App.js");
  
      if (Platform.OS === "android") {
        await Linking.openURL("content://com.android.calendar/time/");
      } else {
        await Linking.openURL("calshow:");
      }
    } catch (e) {
      console.log("❌ Failed to open calendar:", e);
    }
  };

  const checkVersion = async () => {
    try {
      const latest = await VersionCheck.getLatestVersion();
      const current = VersionCheck.getCurrentVersion();

      setCurrentVersion(current);
      setLatestVersion(latest);

      if (isUpdateAvailable(current, latest)) {
        setVisible(true);
      }
    } catch (error) {
      console.log("Version check failed:", error);
    }
  };

  const isUpdateAvailable = (current, latest) => {
    const c = current.split(".").map(Number);
    const l = latest.split(".").map(Number);
    for (let i = 0; i < Math.max(c.length, l.length); i++) {
      const curr = c[i] || 0;
      const lat = l[i] || 0;
      if (lat > curr) return true;
      if (lat < curr) return false;
    }
    return false;
  };

  const goToStore = () => {
    const url =
      Platform.OS === "android"
        ? `market://details?id=${VersionCheck.getPackageName()}`
        : `itms-apps://apps.apple.com/app/idYOUR_APP_ID`; // Replace with real App Store ID
    Linking.openURL(url).catch(err => console.error("Failed to open store:", err));
  };

  /** ⚙️ Open settings */
  const openSettings = () => {
    Platform.OS === "ios"
      ? Linking.openURL("App-Prefs:root=WIFI")
      : Linking.openSettings();
  };

  if (!fontsLoaded) return null;
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;
  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.allowFontScaling = false;

  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colorScheme === 'dark' ? '#000' : '#fff'}
        />
        {!isConnected ? (
          <NoInternetScreen
            onRetry={() => {
              NetInfo.fetch().then(state => {
                setIsConnected(state.isConnected);
              });
            }}
          />
        ) : (
          <ToastProvider>
            <NavigationContainer ref={navigationRef}>
              <StackNavi />
            </NavigationContainer>
          </ToastProvider>
        )}

        {/* 🔔 Minimal Version Modal */}
        <Modal transparent visible={visible} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <Text style={styles.title}>New Version Available</Text>
              <Text style={styles.text}>Latest: {latestVersion}</Text>
              <TouchableOpacity style={styles.button} onPress={goToStore}>
                <Text style={styles.buttonText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </Provider>
  );
}
/* 🔑 REGISTER FOR EXPO PUSH */
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS?.primary,
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 320,
    padding: hp(5),
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
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#333",
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  text: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    marginVertical: 2,
    color: "#333",
  },
  button: {
    marginTop: 15,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    fontSize: 16,
  },
});