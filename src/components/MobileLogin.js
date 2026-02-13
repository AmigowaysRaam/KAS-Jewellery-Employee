import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard, KeyboardAvoidingView,
  Platform, StyleSheet, Text, TouchableOpacity,
  TouchableWithoutFeedback, View
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { loadTranslationsFromAPI } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { poppins } from "../../app/resources/fonts";
import { useToast } from "../../constants/ToastContext";
import LogoAnimated from "./AniamtedImage";
import { fetchData } from "./api/Api";

export default function MobileLogin() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();


  useEffect(() => {
    if (__DEV__) {
      setPhone("9943904056");
      // setPhone("9999999999");

    }
    loadTranslationsFromAPI("en");
  }, []);

  const handleLogin = async () => {
    if (!phone) {
      showToast(t('please_enter_phone'), "error");
      setError("please_enter_phone");
      return;
    }
    if (phone.length < 10) {
      setError("mobile_invalid");
      showToast(t('mobile_invalid'), "error");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const mobileLData = await fetchData('app-employee-login', 'POST', {
        phone_number: phone
      });
      // Alert.alert("", JSON.stringify(mobileLData))
      if (mobileLData?.text === "Success") {
        showToast(mobileLData?.message, "success");
        navigation.replace("OtpVerfication", mobileLData);
      }
      else {
        showToast(mobileLData?.message, "error");
        // navigation.replace("OtpVerfication", mobileLData);
      }
    } catch (err) {
      console.log("Error saving profile:", err);
      showToast(t("something_went_wrong"), "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? hp(10) : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <LogoAnimated />
          </View>

          {/* Phone Input with +91 */}
          <View style={styles.phoneInputWrapper}>
            <View style={styles.countryCodeContainer}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              maxLength={10}
              keyboardType="phone-pad"
              style={[styles.input, { flex: 1, fontFamily: "Poppins_400Regular", lineHeight: hp(2.5) }]}
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
              placeholder={t("enter_mobile_number")}
              placeholderTextColor="#999"
            />
          </View>

          {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  poppins.semi_bold.h4,
                  styles.buttonText,
                  { fontFamily: "Poppins_400Regular" },
                ]}
              >
                {t("send_otp")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#fff", alignItems: "center",
    paddingTop: hp(10),
  },
  logoContainer: {
    alignItems: "center", justifyContent: "center",
    marginBottom: hp(2),
  }, logo: { width: wp(80), height: hp(28), },
  phoneInputWrapper: {
    flexDirection: "row",
    width: wp(90), height: hp(6), borderRadius: wp(1), backgroundColor: "#EEEEEE",
    alignItems: "center", marginBottom: hp(1),
    overflow: "hidden",
  },
  countryCodeContainer: {
    paddingHorizontal: wp(3), justifyContent: "center",
    alignItems: "center", backgroundColor: "#DDD",
    height: "100%",
  },
  countryCodeText: {
    fontSize: wp(4), color: "#000",
    fontFamily: "Poppins_600SemiBold", lineHeight: hp(2)
  },
  input: {
    height: "100%", color: "#000", paddingHorizontal: wp(2),
  },
  errorText: {
    width: wp(90), color: "red", marginBottom: hp(1),
    fontSize: wp(3.5),
    fontFamily: "Poppins_400Regular",
  }, button: {
    width: wp(90), height: hp(5.5),
    backgroundColor: COLORS.primary, borderRadius: wp(1),
    alignItems: "center", justifyContent: "center",
    marginTop: hp(2),
  },
  buttonText: { color: "#fff", lineHeight: wp(8), },
});
