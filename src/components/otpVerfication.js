import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Keyboard,
  KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity,
  View
} from "react-native";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";
export default function OtpVerfication({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { otp: initialOtp, data } = route.params;

  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(String(initialOtp));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const pinRef = useRef(null);
  const scrollRef = useRef(null);
  const { showToast } = useToast();

  /* Keyboard scroll fix */
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => sub.remove();
  }, []);

  /* OTP timer */
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      setSentOtp("");
      return;
    }
    const interval = setInterval(() => {
      setTimer((p) => p - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /* Verify OTP */
  const handleVerifyOtp = async (enteredOtp) => {
    if (!sentOtp) {
      setError("otp_expired");
      showToast(t("otp_expired"), "error");
      setOtp("");
      return;
    }

    if (enteredOtp.length !== 4) {
      setError("otp_invalid");
      showToast(t("otp_invalid"), "error");
      return;
    }

    if (enteredOtp !== sentOtp) {
      setError("otp_invalid");
      showToast(t("otp_invalid"), "error");
      setOtp("");
      return;
    }

    setError("");
    showToast(t("Otp_verified"), "success");

    if (data[0]?.mpin_status === "0") {
      navigation.replace("CreateMpin", { data: data[0] });
    } else {
      await AsyncStorage.setItem("USER_DATA", JSON.stringify({ data }));
      navigation.replace("MpinLoginScreen");
    }
  };

  /* Resend OTP */
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;
    setOtp("");
    setTimer(60);
    setCanResend(false);
    setResendLoading(true);
    try {
      const res = await fetchData("app-employee-resend-otp", "POST", {
        full_name: data[0]?.full_name || "User",
        phone_number: data[0]?.phone_number,
      });
      if (res?.text === "Success") {
        setSentOtp(String(res.data));
        // Alert.alert(t("otp_sent"), `${t("otp_sent_to")} +91 ${res}`);
        showToast(res.message, "success");
      } else {
        showToast(t("something_went_wrong"), "error");
      }
    } catch (e) {
      showToast(t("something_went_wrong"), "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <LogoAnimated />
          <View style={{ width: wp(80), marginBottom: wp(4) }}>
            <Text style={styles.title}>{t("otp_verification")}</Text>
            {__DEV__ && (
              <Text style={styles.subtitle}>{otp}</Text>
            )}
            <Text style={styles.subtitle}>
              {`${t("please_enter_otp")} +91 ${data[0]?.phone_number}`}
            </Text>
          </View>
          <Pressable onPress={() => pinRef.current?.focus()}>
            <SmoothPinCodeInput
              ref={pinRef}
              mask="﹡"
              value={otp}
              onTextChange={setOtp}
              codeLength={4}
              keyboardType="number-pad"
              restrictToNumbers
              password={true}
              autoFocus
              cellStyle={styles.otpInput}
              cellStyleFocused={[
                styles.otpInput,
                styles.otpInputFocused,
              ]}
              onFulfill={handleVerifyOtp}
            />
          </Pressable>

          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}

          <View style={styles.timerContainer}>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendLoading}
                style={[
                  styles.resendBtn,
                  { opacity: resendLoading ? 0.6 : 1 },
                ]}
              >
                {resendLoading ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Text style={styles.resendText}>{t("resend_otp")}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                {t("resend_otp_in")} {timer}s
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: "#fff" },
  container: { alignItems: "center", marginTop: hp(4) },

  title: {
    fontFamily: "Poppins_700Bold",
    fontSize: wp(5),
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: hp(1),
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(3.5),
    textAlign: "center",
  },
  otpInput: {
    width: wp(14),
    height: hp(6),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: wp(1),
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    fontSize: wp(5),
    backgroundColor: "#F9F9F9",
    color: COLORS.primary,
    marginHorizontal: wp(2),
    marginRight: wp(4), lineHeight: hp(6),
  },
  otpInputFocused: {
    borderWidth: 2,
    backgroundColor: "#fff",
  },

  errorText: { color: "red", marginTop: hp(1) },

  timerContainer: { marginTop: hp(2) },
  timerText: { fontSize: wp(3.5) },

  resendBtn: {
    width: wp(45),
    height: hp(5),
    borderRadius: wp(6),
    borderWidth: wp(0.4),
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  resendText: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
  },
});
