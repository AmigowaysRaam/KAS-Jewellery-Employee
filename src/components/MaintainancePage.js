// src/screens/SplashScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import { setSiteDetails, setTokens } from "./store/store";

export default function MaintainancePage() {
  const tokenDetail = useSelector((state) => state?.auth);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  /** ---------------- Animations ---------------- */
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  /** ---------------- Effects ---------------- */
  useEffect(() => {
    startAnimations();
    fnGetToken();

    const interval = setInterval(() => {
      fnGetToken();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /** ---------------- Animations ---------------- */
  const startAnimations = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.back(1)),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };
  const rotateRefresh = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  /** ---------------- API ---------------- */
  const fnGetToken = async () => {
    try {
      const data = await fetchData("app-employee-generate-token", "POST");
      if (data?.text === "Success") {
        dispatch(setTokens(data));

        const siteDetailsData = await fetchData(
          "app-employee-site-settings",
          "POST",
          { Authorization: `${tokenDetail?.token}` }
        );
        if (siteDetailsData?.text === "Success") {
          if (siteDetailsData?.data[0]?.site_mode !== "0") return;
          dispatch(setSiteDetails(siteDetailsData));
          const userDataString = await AsyncStorage.getItem("USER_DATA");
          const userData = JSON.parse(userDataString);
          setTimeout(() => {
            if (userData?.data?.[0]?.id || userData?.id) {
              navigation.replace("MpinLoginScreen");
            } else {
              navigation.replace("MobileLogin");
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.log("API ERROR", error);
      Alert.alert("Error", "Unable to connect to server");
    }
  };

  /** ---------------- UI Helpers ---------------- */
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const AnimatedDot = () => (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [{ scale: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          })}],
        },
      ]}
    />
  );

  /** ---------------- Render ---------------- */
  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.Image
          source={require("../../assets/amigowayslogo.jpg")}
          resizeMode="contain"
          style={[
            styles.logo,
            { transform: [{ translateY }] },
          ]}
        />

        <Text style={styles.title}>Maintenance Mode</Text>
        <Text style={styles.subtitle}>
          We're making things better 🚀
        </Text>

        <View style={styles.loader}>
          <AnimatedDot />
          <AnimatedDot />
          <AnimatedDot />
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => {
            rotateRefresh();
            fnGetToken();
          }}
          activeOpacity={0.8}
        >
          <Animated.Text
            style={[
              styles.refreshText,
              { transform: [{ rotate }] },
            ]}
          >
            ⟳
          </Animated.Text>
          <Text style={styles.refreshLabel}>Refresh Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/** ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: wp(90),
    paddingVertical: hp(4),
    paddingHorizontal: wp(5),
    backgroundColor: "#fff",
    borderRadius: wp(6),
    alignItems: "center",
    elevation: 8,
  },
  logo: {
    width: wp(60),
    height: hp(25),
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  loader: {
    flexDirection: "row",
    marginVertical: hp(3),
  },
  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: COLORS.primary,
    marginHorizontal: wp(1.2),
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(2),
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
  refreshText: {
    color: "#fff",
    fontSize: 20,
    marginRight: 8,
  },
  refreshLabel: {
    color: "#fff",
    fontWeight: "bold",
  },
});
