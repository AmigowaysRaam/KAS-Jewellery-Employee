// src/screens/SplashScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef } from "react";
import { Alert, Animated, Easing, Platform, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { loadStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import { setSiteDetails, setTokens } from "./store/store";

export default function SplashScreen() {
  const tokenDetail = useSelector((state) => state?.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [siteData, setSiteData] = React.useState(null);
  const scaleAnim = useRef(new Animated.Value(0)).current; // logo scale
  const pulseAnim = useRef(new Animated.Value(0)).current; // dots pulse

  useEffect(() => {
    // Start logo & dot animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ),
    ]).start();

    // Request notification permissions & get token
    requestNotificationPermission();

    // Fetch token & site data
    fnGetToken();
  }, []);

  // Request permission and get Expo push token
  const requestNotificationPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Permission not granted for notifications");
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log("📱 Expo Push Token:", tokenData.data);

      // For Android: Configure notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    } catch (error) {
      console.error("Notification Permission Error:", error);
    }
  };

  // Fetch token & site settings
  const fnGetToken = async () => {
    try {
      await loadStoredLanguage();

      const data = await fetchData("app-employee-generate-token", "POST");
      if (data?.text === "Success") {
        dispatch(setTokens(data));

        try {
          const siteDetailsData = await fetchData("app-employee-site-settings", "POST", {
            Authorization: `${tokenDetail?.token}`,
          });

          if (siteDetailsData?.text === "Success") {
            if (siteDetailsData?.data[0].site_mode == "1") {
              navigation.replace("MaintainancePage");
              return;
            }

            setSiteData(siteDetailsData);
            dispatch(setSiteDetails(siteDetailsData));

            const userDataString = await AsyncStorage.getItem("USER_DATA");
            const userData = JSON.parse(userDataString);

            setTimeout(() => {
              if (userData?.data?.[0]?.id || userData?.id || userData?.data?.id) {
                navigation.replace("MpinLoginScreen");
              } else {
                navigation.replace("MobileLogin");
              }
            }, 1000); // delay for animation
          }
        } catch (error) {
          console.error("SITE API Error:", error);
        }
      }
    } catch (error) {
      console.error("TOKEN API Error:", error);
      Alert.alert("TOKEN fetching error", error.message);
    }
  };

  // Animated loading dots
  const AnimatedDot = ({ delay }) => (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
          transform: [
            {
              scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] }),
            },
          ],
          marginLeft: delay ? wp(2) : 0,
        },
      ]}
    />
  );

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/amigowayslogo.jpg")}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
      <View style={styles.loader}>
        <AnimatedDot delay={false} />
        <AnimatedDot delay={true} />
        <AnimatedDot delay={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: wp(90),
    height: hp(45),
    marginBottom: hp(5),
  },
  loader: {
    flexDirection: "row",
    marginTop: 10,
  },
  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: COLORS.primary,
  },
});
