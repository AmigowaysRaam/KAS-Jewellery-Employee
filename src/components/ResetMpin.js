import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView,
  Platform, TextInput as RNTextInput, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";

export default function ResetMpin({ route }) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const userData = route?.params?.data; // from OTP screen
  const siteDetails = useSelector(state => state.auth?.siteDetails?.data[0]);
  const [mpin, setMpin] = useState(["", "", "", ""]);
  const [confirmMpin, setConfirmMpin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mpinRef = useRef([]);
  const confirmRef = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    return () => showSub.remove();
  }, []);
  const { showToast } = useToast();

  const handleChange = (text, index, isConfirm = false) => {
    if (/[^0-9]/.test(text)) return;

    const target = isConfirm ? [...confirmMpin] : [...mpin];
    target[index] = text;
    isConfirm ? setConfirmMpin(target) : setMpin(target);

    if (text && index < 3) {
      const nextRef = isConfirm
        ? confirmRef.current[index + 1]
        : mpinRef.current[index + 1];
      nextRef?.focus();
    }
  };

  const handleKeyPress = (e, index, isConfirm = false) => {
    const target = isConfirm ? [...confirmMpin] : [...mpin];
    const refArr = isConfirm ? confirmRef.current : mpinRef.current;
    if (e.nativeEvent.key === "Backspace") {
      if (target[index] !== "") {
        target[index] = "";
      } else if (index > 0) {
        refArr[index - 1]?.focus();
        target[index - 1] = "";
      }
      isConfirm ? setConfirmMpin(target) : setMpin(target);
    }
  };
  /* CREATE MPIN API */
  const handleCreateMpin = async () => {
    const mpinValue = mpin.join("");
    const confirmValue = confirmMpin.join("");
    if (mpinValue.length < 4) {
      setError("mpin_invalid");
      return;
    }
    if (confirmValue.length < 4) {
      setError("confirm_mpin_invalid");
      return;
    }
    if (mpinValue !== confirmValue) {
      setError("mpin_mismatch");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetchData("app-employee-reset-mpin", "POST", {
        user_id: userData?.id,
        mpin: mpin.join("").toString(),
        confirm_mpin: confirmMpin.join("").toString(),
      });
      showToast(response?.message, response?.text === "Success" ? "success" : "error");
      if (response?.text === "Success") {
        /* ✅ STORE DATA LOCALLY */
        await AsyncStorage.setItem(
          "USER_DATA",
          JSON.stringify(response)
        );
        navigation.replace("MpinLoginScreen");
      } else {
        setError(response?.message || "something_went_wrong");
      }
    } catch (err) {
      console.log("Create MPIN Error", err);
      setError("something_went_wrong");
    } finally {
      setLoading(false);
    }
  };
  const renderOtpBoxes = (value, ref, isConfirm = false) => (
    <View style={styles.otpContainer}>
      {value.map((item, index) => (
        <RNTextInput
          key={index}
          ref={(el) => (ref.current[index] = el)}
          value={item}
          onChangeText={(text) => handleChange(text, index, isConfirm)}
          onKeyPress={(e) => handleKeyPress(e, index, isConfirm)}
          maxLength={1}
          keyboardType="number-pad"
          style={styles.otpInput}
        />
      ))}
    </View>
  );

  const isButtonDisabled =
    loading ||
    mpin.join("").length !== 4 ||
    confirmMpin.join("").length !== 4 ||
    mpin.join("") !== confirmMpin.join("");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? wp(20) : 0}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <LogoAnimated />
          <Text style={styles.title}>{t("Secure Your Account")}</Text>
          <Text style={styles.subtitle}>
            {t("Update your MPIN for fast, secure access to your account.")}
          </Text>

          <Text style={styles.label}>{t("enter_mpin")}</Text>
          {renderOtpBoxes(mpin, mpinRef)}

          <Text style={[styles.label, { marginTop: hp(2) }]}>
            {t("confirm_mpin")}
          </Text>
          {renderOtpBoxes(confirmMpin, confirmRef, true)}

          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}

          <TouchableOpacity
            disabled={isButtonDisabled}
            onPress={handleCreateMpin}
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
              <Text style={styles.buttonText}>{t("create_mpin")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, paddingBottom: hp(6), backgroundColor: "#fff",
  }, container: {
    alignItems: "center",
    marginTop: hp(4),
  }, title: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(5), color: COLORS.primary,
    marginBottom: hp(1),
  }, subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(3), textAlign: "center", marginHorizontal: wp(5),
    marginBottom: hp(2),
  }, label: {
    marginBottom: hp(2), fontSize: wp(4.5),
    color: COLORS.primary,
  }, otpContainer: {
    flexDirection: "row", justifyContent: "space-between",
    width: wp(80),
  }, otpInput: {
    width: wp(14), height: hp(6), borderWidth: 1,
    borderColor: COLORS.primary, textAlign: "center",
    fontSize: wp(5), borderRadius: wp(1),
    color: COLORS.primary,
  }, errorText: {
    color: "red", marginTop: hp(1.5),
    textAlign: "center",
  }, button: {
    width: wp(90), height: hp(5.5), marginTop: hp(3),
    alignItems: "center", justifyContent: "center",
    borderRadius: wp(1),
  }, buttonText: {
    color: "#fff",
  },
});
