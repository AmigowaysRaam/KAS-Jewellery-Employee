import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";

export default function ForgetOtpVerification({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { otp: initialOtp, data } = route.params;

  const [otpE, setOtp] = useState(["", "", "", ""]);
  const [sentOtp, setSentOtp] = useState(String(initialOtp));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputsRef = useRef([]);
  const scrollRef = useRef(null);
  const { showToast } = useToast();

  /** Scroll to bottom when keyboard opens */
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => keyboardDidShowListener.remove();
  }, []);

  /** Countdown timer for OTP resend */
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      setSentOtp(""); // invalidate old OTP
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  /** Handle OTP input change */
  const handleChange = (text, index) => {
    if (/[^0-9]/.test(text)) return;
    const newOtp = [...otpE];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  /** Handle backspace to go to previous input */
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && otpE[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /** Verify OTP */
  const handleVerifyOtp = async () => {
    const enteredOtp = otpE.join("");
    if (!sentOtp) {
      setError("otp_expired");
      showToast(t("otp_expired"), "error");
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
      return;
    }
    if (enteredOtp.length < 4 || enteredOtp !== sentOtp) {
      setError("otp_invalid");
      showToast(t("otp_invalid"), "error");
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
      return;
    }
    setError("");
    showToast(t("Otp_verified"), "success");
    navigation.replace("ResetMpin", { data: data });
  };

  /** Resend OTP */
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;
    setOtp(["", "", "", ""]);
    setTimer(60);
    setCanResend(false);
    inputsRef.current[0]?.focus();
    setResendLoading(true);

    try {
      const response = await fetchData("app-employee-forgot-mpin", "POST", {
        user_id: data?.id,
      });
      if (response?.text === "Success") {
        setSentOtp(String(response.data));
        showToast(response.message, "success");
      } else {
        showToast(t("something_went_wrong"), "error");
      }
    } catch (err) {
      console.log("Error resending OTP:", err);
      showToast(t("something_went_wrong"), "error");
    } finally {
      setResendLoading(false);
    }
  };

  const isButtonDisabled = otpE.join("").length !== 4;

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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <LogoAnimated />

          <View style={{ width: wp(80), marginBottom: wp(4) }}>
            <Text style={styles.title}>{t("otp_verification")}</Text>
            <Text style={styles.subtitle}>
              {`${t("enter_the_otp_sent_to")} +91 ${data?.phone_number} ${t("to_reset_your_mpin")}`}
            </Text>
            <Text style={styles.subtitle}>{sentOtp}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otpE.map((value, index) => (
              <RNTextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                value={value}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                maxLength={1}
                keyboardType="number-pad"
                style={styles.otpInput}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}

          <View style={styles.timerContainer}>
            {canResend ? (
              <TouchableOpacity
                disabled={resendLoading}
                onPress={handleResendOtp}
                style={[styles.resendBtn, { opacity: resendLoading ? 0.6 : 1 }]}
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

          <TouchableOpacity
            disabled={isButtonDisabled}
            onPress={handleVerifyOtp}
            style={[
              styles.button,
              { backgroundColor: isButtonDisabled ? COLORS.primary + "90" : COLORS.primary },
            ]}
          >
            <Text style={[styles.buttonText, { fontFamily: "Poppins_600SemiBold" }]}>
              {t("verify_otp")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** STYLES */
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(80),
    marginVertical: hp(2),
  },
  otpInput: {
    width: wp(14),
    height: hp(6),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: wp(1),
    textAlign: "center",
    fontSize: wp(5),
    backgroundColor: "#F9F9F9",
    color: COLORS.primary,
    marginBottom: hp(1),
  },
  errorText: { color: "red", marginBottom: hp(1) },
  timerContainer: { marginBottom: hp(2) },
  timerText: { fontSize: wp(3.5) },
  resendBtn: {
    width: wp(40),
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
  button: {
    width: wp(90),
    height: hp(5.5),
    borderRadius: wp(1),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", lineHeight: hp(5.5) },
});
