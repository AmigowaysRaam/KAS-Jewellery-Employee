// src/screens/SplashScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { Alert, Animated, Easing, StyleSheet, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
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
    fnGetToken();
  }, []);
  const fnGetToken = async () => {
    try {
      const data = await fetchData("app-employee-generate-token", "POST");
      if (data?.text === "Success") {
        dispatch(setTokens(data));
        try {
          const siteDetailsData = await fetchData("app-employee-site-settings", "POST", {
            Authorization: `${tokenDetail?.token}`,
          });
          if (siteDetailsData?.text === "Success") {
            // Alert.alert(JSON.stringify(siteDetailsData?.data[0].site_mode));
            if (siteDetailsData?.data[0].site_mode == '1') {
              navigation.replace("MaintainancePage")
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
            }, 1000); // 1.5 sec delay for animation
          }
        } catch (error) {
          console.error("SITE API Error:", error);
          // Alert.alert("SITE DETAILS Error", error.message);
        }
      }
    } catch (error) {
      console.error("TOKEN API Error:", error);
      Alert.alert("TOKEN fetching error", error.message);
    }
  };
  const AnimatedDot = ({ delay }) => (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2],
              }),
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