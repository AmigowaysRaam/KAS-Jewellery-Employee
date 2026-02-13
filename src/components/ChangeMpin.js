import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard, KeyboardAvoidingView, Platform, TextInput as RNTextInput, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api";

export default function ChangeMpin() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  /** ---------- States ---------- */
  const [currentMpin, setCurrentMpin] = useState(["", "", "", ""]);
  const [newMpin, setNewMpin] = useState(["", "", "", ""]);
  const [confirmMpin, setConfirmMpin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** ---------- Refs ---------- */
  const currentRef = useRef([]);
  const newRef = useRef([]);
  const confirmRef = useRef([]);
  const scrollRef = useRef(null);

  /** ---------- Keyboard Scroll ---------- */
  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    return () => sub.remove();
  }, []);
  /** ---------- Input Handlers ---------- */

  const handleChange = (text, index, value, setValue, refArr) => {
    // Only allow digits
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      // If deleting, clear current box
      const updated = [...value];
      updated[index] = '';
      setValue(updated);
      return;
    }

    const updated = [...value];

    // Replace current value with the newly typed digit
    updated[index] = digits[digits.length - 1];
    setValue(updated);

    // Move focus to next input if current filled
    if (index < updated.length - 1) {
      refArr.current[index + 1]?.focus();
    } else {
      refArr.current[index]?.blur();
    }
  };


  const handleKeyPress = (e, index, value, setValue, refArr) => {
    if (e.nativeEvent.key === 'Backspace') {
      const updated = [...value];
      if (updated[index]) {
        updated[index] = '';
      } else if (index > 0) {
        refArr.current[index - 1]?.focus();
        updated[index - 1] = '';
      }
      setValue(updated);
    }
  };

  const renderOtpBoxes = (label, value, setValue, refArr) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.otpContainer}>
        {value.map((item, index) => (

          <RNTextInput
            key={index}
            ref={(el) => (refArr.current[index] = el)}
            value={value[index]}
            maxLength={1}
            keyboardType="number-pad"
            style={styles.otpInput}
            selectTextOnFocus={true}   // allow full selection on focus
            contextMenuHidden={true}   // disable copy/paste menu
            caretHidden={false}        // show cursor
            onFocus={() => {
              // Always select the entire digit when focused
              setTimeout(() => {
                refArr.current[index]?.setNativeProps({
                  selection: { start: 0, end: 1 },
                });
              }, 0);
            }}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '');
              if (!digits) return;
              const updated = [...value];
              // Replace the current value
              updated[index] = digits[digits.length - 1];
              setValue(updated);
              // Move focus to next input automatically
              if (index < updated.length - 1) {
                refArr.current[index + 1]?.focus();
              } else {
                refArr.current[index]?.blur();
              }
            }}
            onSelectionChange={(e) => {
              const start = e.nativeEvent.selection.start;
              const end = e.nativeEvent.selection.end;

              // Only allow selection of the full input (0 → 1)
              if (start !== 0 || end !== 1) {
                refArr.current[index]?.setNativeProps({
                  selection: { start: 0, end: 1 },
                });
              }
            }}
            onKeyPress={(e) => handleKeyPress(e, index, value, setValue, refArr)}
            onLongPress={(e) => e.preventDefault()} // prevent partial drag/select
          />


        ))}
      </View>
    </>
  );

  /** ---------- Submit API ---------- */
  const handleSubmit = async () => {
    if (newMpin.join("") !== confirmMpin.join("")) {
      setError("MPIN does not match");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetchData(
        "app-employee-change-mpin",
        "POST",
        {
          user_id: profileDetails?.id,
          current_mpin: currentMpin.join(""),
          mpin: newMpin.join(""),
          confirm_mpin: confirmMpin.join(""),
        }
      );
      if (response?.text === "Success") {
        showToast(response?.message, "success");
        navigation.goBack();
      } else {
        setError(response?.message || "Failed to update MPIN");
        showToast(response?.message, "error");
      }
    } catch (err) {
      console.error("MPIN API Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const isDisabled =
    loading ||
    currentMpin.join("").length !== 4 ||
    newMpin.join("").length !== 4 ||
    confirmMpin.join("").length !== 4 ||
    newMpin.join("") !== confirmMpin.join("");
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? wp(18) : 0}
    >
      <CommonHeader title={`${t("change_mpin")}`}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.subtitle}>
            {t("change_mpin_subtitle")}
          </Text>
          {renderOtpBoxes(
            t("enter_current_mpin"),
            currentMpin,
            setCurrentMpin,
            currentRef
          )}

          {renderOtpBoxes(
            t("enter_new_mpin"),
            newMpin,
            setNewMpin,
            newRef
          )}

          {renderOtpBoxes(
            t("confirm_new_mpin"),
            confirmMpin,
            setConfirmMpin,
            confirmRef
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            disabled={isDisabled}
            onPress={handleSubmit}
            style={[
              styles.button,
              {
                backgroundColor: isDisabled
                  ? COLORS.primary + "90"
                  : COLORS.primary,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("update_mpin")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp(6),
    backgroundColor: "#fff",
  },
  container: {
    alignItems: "center",
    marginTop: hp(4),
  },
  subtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(3.5),
    textAlign: "center",
    marginHorizontal: wp(6),
    marginBottom: hp(3),
  },
  label: {
    marginBottom: hp(1.5),
    fontSize: wp(4.5),
    color: COLORS.primary,
    marginTop: hp(2),
    fontFamily: "Poppins_500Medium",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(80),
  },
  otpInput: {
    width: wp(14),
    height: hp(6),
    borderWidth: 1,
    borderColor: COLORS.primary,
    textAlign: "center",
    fontSize: wp(5),
    borderRadius: wp(1),
    color: COLORS.primary,
    lineHeight: hp(3),
    fontFamily: "Poppins_500Medium",
  },
  errorText: {
    color: "red",
    marginTop: hp(2),
    textAlign: "center",
  },
  button: {
    width: wp(90),
    height: hp(5.8),
    marginTop: hp(4),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: wp(1.2),
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontFamily: "Poppins_600SemiBold",
  },
});