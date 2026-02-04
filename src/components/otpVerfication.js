import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";
export default function OtpVerfication({ route }) {
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

  /* Keyboard scroll fix */
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => showSub.remove();
  }, []);
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      setSentOtp(""); // ✅ invalidate the old OTP
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);
  const handleChange = (text, index) => {
    if (/[^0-9]/.test(text)) return;
    const newOtp = [...otpE];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && otpE[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };
  const handleVerifyOtp = async () => {
    const enteredOtp = otpE.join("");
    if (!sentOtp) { // ✅ check if OTP is expired
      setError("otp_expired");
      showToast(t("otp_expired"), "error");
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
      return;
    }

    if (enteredOtp.length < 4) {
      setError("otp_invalid");
      showToast(t("otp_invalid"), "error");
      return;
    }

    if (enteredOtp !== sentOtp) {
      setError("otp_invalid");
      showToast(t("otp_invalid"), "error");
      setOtp(["", "", "", ""]);
      inputsRef.current[0]?.focus();
      return;
    }

    setError("");
    showToast(t("Otp_verified"), "success");
    if (data[0]?.mpin_status === "0") {
      navigation.replace("CreateMpin", { data: data[0] });
    } else {
      navigation.replace("MpinLoginScreen");
      await AsyncStorage.setItem("USER_DATA", JSON.stringify({ data }));
    }
  };


  /* RESEND OTP */
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;
    setOtp(["", "", "", ""]);
    setTimer(60);
    setCanResend(false);
    inputsRef.current[0]?.focus();
    setResendLoading(true);
    try {
      const mobileLData = await fetchData("app-employee-resend-otp", "POST", {
        full_name: data[0]?.full_name || "User",
        phone_number: data[0]?.phone_number,
      });
      console.log("Resend OTP Response", mobileLData);
      if (mobileLData?.text === "Success") {
        setSentOtp(String(mobileLData.data)); // ✅ bind new OTP
        showToast(mobileLData.message, "success");
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
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
              {`${t("please_enter_otp")} +91 ${data[0]?.phone_number}`}
            </Text>
            {/* {/* <Text>{JSON.stringify(data[0])}</Text> */}
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

          <TouchableOpacity
            disabled={isButtonDisabled}
            onPress={handleVerifyOtp}
            style={[
              styles.button,
              {
                backgroundColor: isButtonDisabled
                  ? COLORS.primary + "90"
                  : COLORS.primary,
              },
            ]}
          >
            <Text style={[styles.buttonText, {
              fontFamily: "Poppins_600SemiBold",

            }]}>{t("verify_otp")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* STYLES */
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
  },
  errorText: { color: "red", marginBottom: hp(1) },
  timerContainer: { marginBottom: hp(2) },
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
  button: {
    width: wp(90),
    height: hp(5.5),
    borderRadius: wp(1),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", lineHeight: hp(5.5) },
});