import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMessaging } from "@react-native-firebase/messaging";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, TextInput as RNTextInput,
  ScrollView, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
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
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setfcmToken] = useState(null);

  const mpinRef = useRef([]);
  /* 🔄 LOAD USER ID FROM ASYNC STORAGE */
  useEffect(() => {
    loadUserId();
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const getToken = async () => {
      const token = await getMessaging().getToken();
      console.log('FCM Token:', token);
      setfcmToken(token)
      // Alert.alert('FCM Token', token);
    };
    getToken();
  }, []);
  const loadUserId = async () => {
    try {
      const raw = await AsyncStorage.getItem("USER_DATA");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const extractedId =
        parsed?.id ||
        parsed?.data?.id ||
        parsed?.data?.[0]?.id ||
        null;
      if (extractedId) {
        setUserId(String(extractedId));
        await AsyncStorage.setItem("USER_ID", String(extractedId));
      }
    } catch (err) {
      console.log("Load User ID Error:", err);
    }
  };
  const handleChange = (text, index) => {
    if (/[^0-9]/.test(text)) return;
    const updated = [...mpin];
    updated[index] = text;
    setMpin(updated);
    if (text && index < 3) {
      mpinRef.current[index + 1]?.focus();
    }
  };
  const fnGetOtpForget = async () => {
    setLoading(true);
    try {
      const response = await fetchData(
        "app-employee-forgot-mpin",
        "POST",
        {
          user_id: userId,
        }
      );
      if (response?.text === "Success") {
        showToast(response?.message, "success");
        // Alert.alert('', JSON.stringify(response))
        // navigation.replace("home");
        // forgetotpVerfication
        navigation.replace("forgetotpVerfication", response);
      } else {
        showToast(response?.message, "error");
        setError(response?.message || "something_went_wrong");
      }
    } catch (err) {
      console.log("MPIN Login Error:", err);
      setError("something_went_wrong");
      showToast(t("something_went_wrong"), "error");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      const updated = [...mpin];
      if (updated[index]) {
        updated[index] = "";
      } else if (index > 0) {
        mpinRef.current[index - 1]?.focus();
        updated[index - 1] = "";
      }
      setMpin(updated);
    }
  };
  const dispatch = useDispatch();
  const handleLogin = async () => {
    const mpinValue = mpin.join("");
    if (mpinValue.length < 4) {
      setError("mpin_invalid");
      showToast(t("mpin_invalid"), "error");
      return;
    }
    if (!userId) {
      showToast("User not found", "error");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetchData(
        "app-employee-login-mpin",
        "POST",
        {
          user_id: userId,
          mpin: mpinValue,
          fcm_token: fcmToken
        }
      );
      if (response?.text === "Success") {
        await AsyncStorage.multiSet([
          ["USER_DATA", JSON.stringify(response)],
        ]);
        dispatch(setProfileDetails(response));
        showToast(response?.message, "success");
        navigation.replace("home");
      } else {
        showToast(response?.message, "error");
        setError(response?.message || "something_went_wrong");
      }
    } catch (err) {
      console.log("MPIN Login Error:", err);
      setError("something_went_wrong");
      showToast(t("something_went_wrong"), "error");
    } finally {
      setLoading(false);
      setMpin(["", "", "", ""]);
    }
  };
  const isButtonDisabled = mpin.join("").length !== 4 || loading;
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
          <Text style={[styles.title, {
            fontFamily: "Poppins_400Regular",
          }]}>{t("login_title")}</Text>
          <Text style={styles.subtitle}>
            {t("enter_mpin_instruction")}
          </Text>

          <View style={styles.otpContainer}>
            {mpin.map((item, index) => (
              <RNTextInput
                key={index}
                ref={(el) => (mpinRef.current[index] = el)}
                value={item}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                style={styles.otpInput}
              />
            ))}
          </View>
          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}

          <Pressable onPress={() => fnGetOtpForget()}>
            <Text style={[styles.title, {
              fontSize: wp(4), alignSelf: 'flex-end', marginHorizontal: wp(5),
              fontFamily: "Poppins_600SemiBold",
            }]}>{t("forget_mpin")}</Text>
          </Pressable>

          <TouchableOpacity
            disabled={isButtonDisabled}
            onPress={handleLogin}
            style={[
              styles.button,
              {
                backgroundColor: isButtonDisabled
                  ? COLORS.primary + "90"
                  : COLORS.primary,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, {
                fontFamily: "Poppins_600SemiBold",
              }]}>{t("login")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
/* 🎨 STYLES */
const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingBottom: hp(6), backgroundColor: "#fff", },
  container: {
    alignItems: "center", marginTop: hp(4),
    paddingHorizontal: wp(5),
  }, title: { fontSize: wp(4), color: COLORS.primary, marginVertical: hp(1), }, subtitle: {
    fontSize: wp(3.5), textAlign: "center", marginBottom: hp(3),
    color: "#444",
  }, otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between", width: wp(80), marginBottom: hp(2),
  }, otpInput: {
    width: wp(14), height: hp(6), borderWidth: 1, borderColor: COLORS.primary, textAlign: "center",
    fontSize: wp(5), borderRadius: wp(2), color: COLORS.primary, backgroundColor: "#f8f8f8",
  }, errorText: {
    color: "#e74c3c", marginTop: hp(1.5), textAlign: "center",
  }, button: {
    width: wp(90), height: hp(6), marginTop: hp(2),
    alignItems: "center", justifyContent: "center", borderRadius: wp(2),
  }, buttonText: {
    color: "#fff", fontSize: wp(5), lineHeight: hp(6),
  },
});