import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging, { AuthorizationStatus } from "@react-native-firebase/messaging";
import { useNavigation } from "@react-navigation/native";
import * as Device from 'expo-device';
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { useDispatch } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";
import { setProfileDetails } from "./store/store";

export default function MpinLoginScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [mpin, setMpin] = useState(""); // single string
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const pinRef = useRef(null);
  // Load userId
  useEffect(() => {
    // Focus the PIN input when the screen mounts
    // Device {"DeviceType": {"0": "UNKNOWN", "1": "PHONE", "2": "TABLET", "3": "DESKTOP", "4": "TV", "DESKTOP": 3, "PHONE": 1, "TABLET": 2, "TV": 4, "UNKNOWN": 0}, "brand": "realme", "designName": "RE58CE", "deviceName": "Ramm (handset)", "deviceType": 1, "deviceYearClass": 2015, "getDeviceTypeAsync": [Function getDeviceTypeAsync], "getMaxMemoryAsync": [Function getMaxMemoryAsync], "getPlatformFeaturesAsync": [Function getPlatformFeaturesAsync], "getUptimeAsync": [Function getUptimeAsync], "hasPlatformFeatureAsync": [Function hasPlatformFeatureAsync], "isDevice": true, "isRootedExperimentalAsync": [Function isRootedExperimentalAsync], "isSideLoadingEnabledAsync": [Function isSideLoadingEnabledAsync], "manufacturer": "realme", "modelId": null, "modelName": "RMX3762", "osBuildFingerprint": "realme/RMX3762/RE58CE:15/AP3A.240905.015.A2/T.R4T2.1763430238:user/release-keys", "osBuildId": "RMX3762_15_F.96", "osInternalBuildId": "AP3A.240905.015.A2", "osName": "Android", "osVersion": "15", "platformApiLevel": 35, "productName": "RMX3762", "supportedCpuArchitectures": ["arm64-v8a", "armeabi-v7a", "armeabi"], "totalMemory": 3944341504}
    const pseudoId = `${Device.brand}${Device.modelName}${Device?.totalMemory}`;
    console.log('DevicepseudoId', pseudoId)
    const timer = setTimeout(() => {
      pinRef.current?.focus();
    }, 300); // slight delay ensures keyboard opens properly
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { loadUserId(); }, []);
  const loadUserId = async () => {
    try {
      const raw = await AsyncStorage.getItem("USER_DATA");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const extractedId =
        parsed?.id || parsed?.data?.id || parsed?.data?.[0]?.id || null;
      if (extractedId) {
        setUserId(String(extractedId));
        await AsyncStorage.setItem("USER_ID", String(extractedId));
      }
    } catch (err) { console.log("Load User ID Error:", err); }
  };
  // FCM token
  useEffect(() => {
    const getFcmToken = async () => {
      try {
        if (Platform.OS === "ios") {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;
          if (!enabled) return;
        }
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log("FCM Token:", token);
      } catch (err) { console.log("FCM Error:", err); }
    };
    getFcmToken();
  }, []);
  // Handle login
  const handleLogin = async (mpinValue = null) => {
    const mpinString = mpinValue || mpin;
    if (mpinString.length !== 4) {
      setError("mpin_invalid");
      showToast(t("mpin_invalid"), "error");
      return;
    }
    if (!userId) { showToast("User not found", "error"); return; }
    setLoading(true);
    setError("");
    const pseudoId = `${Device.brand}${Device.modelName}${userId}`;
    try {
      const response = await fetchData("app-employee-login-mpin", "POST", {
        user_id: userId,
        mpin: mpinString,
        fcm_token: fcmToken,
        deviceId: pseudoId
      });
      if (response?.text === "Success") {
        await AsyncStorage.multiSet([["USER_DATA", JSON.stringify(response)]]);
        dispatch(setProfileDetails(response));
        showToast(response?.message, "success");
        navigation.replace("home");
      } else {
        setError(response?.message || "something_went_wrong");
        showToast(response?.message, "error");
      }
    } catch (err) {
      console.log("MPIN Login Error:", err);
      setError("something_went_wrong");
      showToast(t("something_went_wrong"), "error");
    } finally {
      setLoading(false);
      setMpin(""); // reset
    }
  };
  // Forgot MPIN
  const handleSwitchAccount = async () => {
    await AsyncStorage.multiRemove([
      "USER_DATA",
      "USER_ID",
      "token"
    ]);

    navigation.replace("MobileLogin"); // go to normal login screen
  };

  const fnGetOtpForget = async () => {
    setLoading(true);
    try {
      const response = await fetchData("app-employee-forgot-mpin", "POST", { user_id: userId });
      if (response?.text === "Success") {
        showToast(response?.message, "success");
        navigation.replace("forgetotpVerfication", response);
      } else {
        showToast(response?.message, "error");
        setError(response?.message || "something_went_wrong");
      }
    } catch (err) {
      console.log("Forgot MPIN Error:", err);
      setError("something_went_wrong");
      showToast(t("something_went_wrong"), "error");
    } finally {
      setLoading(false);
    }
  };
  const isButtonDisabled = mpin.length !== 4 || loading;
  useEffect(() => {
    if (mpin.length < 4) {
      pinRef.current?.focus();
    }
  }, [mpin]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? wp(25) : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <LogoAnimated />
          <Text style={[styles.title, { fontFamily: "Poppins_400Regular" }]}>{t("login_title")}</Text>
          <Text style={styles.subtitle}>{t("enter_mpin_instruction")}</Text>
          <Pressable onPress={() => pinRef.current?.focus()}>
            <SmoothPinCodeInput
              ref={pinRef}
              value={mpin}
              onTextChange={setMpin}
              cellStyle={styles.otpInput}
              cellStyleFocused={{ ...styles.otpInput, borderColor: COLORS.primary, backgroundColor: "#fff", borderWidth: 2 }}
              codeLength={4}
              keyboardType="number-pad"
              password={true}
              restrictToNumbers
              autoFocus={true} // optional
              onFulfill={(code) => handleLogin(code)}
            />
          </Pressable>
          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}
          {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: hp(2) }} /> : null}

          {/* navigation.replace("MobileLogin"); */}
          <View style={{
            flexDirection: "row",
            marginVertical: hp(1)
          }}>
            <Pressable onPress={fnGetOtpForget} >
              <Text style={[styles.title, {
                fontSize: wp(4),
                alignSelf: 'flex-end',
                marginHorizontal: wp(5),
                fontFamily: "Poppins_600SemiBold",
              }]}>{t("forget_mpin")}</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => handleSwitchAccount()} >
            <Text style={[styles.title, {
              fontSize: wp(4),
              alignSelf: 'flex-end',
              marginHorizontal: wp(5),
              fontFamily: "Poppins_400Regular", textDecorationLine: "underline"
            }]}>{t("login_with_another_account")}</Text>
          </Pressable>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: hp(6), backgroundColor: "#fff" },
  container: { alignItems: "center", marginTop: hp(4), paddingHorizontal: wp(5) },
  title: { fontSize: wp(4), color: COLORS.primary, marginVertical: hp(1) },
  subtitle: { fontSize: wp(3.5), textAlign: "center", marginBottom: hp(3), color: "#444" },
  otpInput: {
    width: wp(16), height: hp(7),
    borderWidth: 1,
    borderColor: COLORS.ashGrey,
    textAlign: "center", fontSize: wp(6), borderRadius: wp(2),
    color: COLORS.primary, backgroundColor: "#f8f8f8",
    marginHorizontal: wp(1),
    marginRight: wp(4), otpInputFocused: {
      borderWidth: 2, backgroundColor: "#fff",
    },
  },
  errorText: { color: "#e74c3c", marginTop: hp(1.5), textAlign: "center" },
});