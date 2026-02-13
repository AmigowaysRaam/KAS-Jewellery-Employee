import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TouchableOpacity,
  View
} from "react-native";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";
export default function ForgetOtpVerification({ route }) {
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

  /** Scroll when keyboard opens */
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => sub.remove();
  }, []);

  /** Countdown timer */
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      setSentOtp("");
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /** Verify OTP */
  const handleVerifyOtp = async (enteredOtp) => {
    if (!sentOtp) {
      setError("otp_expired");
      showToast(t("otp_expired"), "error");
      setOtp("");
      return;
    }

    if (enteredOtp.length !== 4 || enteredOtp !== sentOtp) {
      setError("otp_invalid");
      showToast(t("otp_invalid"), "error");
      setOtp("");
      return;
    }

    setError("");
    showToast(t("Otp_verified"), "success");
    navigation.replace("ResetMpin", { data });
  };

  /** Resend OTP */
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setOtp("");
    setTimer(60);
    setCanResend(false);
    setResendLoading(true);

    try {
      const response = await fetchData("app-employee-forgot-mpin", "POST", {
        user_id: data?.id,
      });

      if (response?.text === "Success") {
        setSentOtp(response.data?.otp);
        showToast(response.message, "success");
      } else {
        showToast(t("something_went_wrong"), "error");
      }
    } catch (err) {
      showToast(t("something_went_wrong"), "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
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
            <Text style={styles.subtitle}>
              {`${t("enter_the_otp_sent_to")} +91 ${data?.phone_number} ${t("to_reset_your_mpin")}`}
            </Text>
          </View>
          <Pressable onPress={() => pinRef.current?.focus()}>

            <View style={{ marginVertical: wp(4) }}>
              <SmoothPinCodeInput
                ref={pinRef}
                value={otp}
                onTextChange={setOtp}
                codeLength={4}
                keyboardType="number-pad"
                restrictToNumbers
                autoFocus
                cellStyle={styles.otpInput}
                password={true}
                cellStyleFocused={[
                  styles.otpInput,
                  styles.otpInputFocused,
                ]}
                onFulfill={handleVerifyOtp}
              />
            </View>
          </Pressable>
          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}
          <View style={styles.timerContainer}>
            {canResend ? (
              <TouchableOpacity
                disabled={resendLoading}
                onPress={handleResendOtp}
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
  container: { alignItems: "center", marginTop: hp(4), paddingBottom: hp(4) },

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
    width: wp(15), height: hp(6), borderWidth: 1,
    borderColor: COLORS.primary, borderRadius: wp(1), textAlign: "center",
    fontSize: wp(5), backgroundColor: "#F9F9F9",
    color: COLORS.primary, marginHorizontal: wp(2),
    marginRight: wp(5),
  }, otpInputFocused: {
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  errorText: { color: "red", marginBottom: hp(1) },
  timerContainer: { marginBottom: hp(2) },
  timerText: { fontSize: wp(3.5) },
  resendBtn: {
    height: hp(5), borderRadius: wp(6),
    borderWidth: wp(0.4),
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(6),
  },
  resendText: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary,
  },
});
