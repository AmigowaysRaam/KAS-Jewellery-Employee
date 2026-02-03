import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, ImageBackground, StyleSheet, Text, View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const Banner = ({ homepageData }) => {
  const { t } = useTranslation();
  // Animated values
  const cardAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible
  const rowAnim = useRef(new Animated.Value(0)).current; // For staggered rows
  // console.log("Banner", );
  // Alert.alert("Banner Data", JSON.stringify(homepageData?.sections[1].employee_details));
  const employeeDetails = homepageData?.sections[1]?.employee_details;
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentTime(formattedTime);
    };
    updateTime(); // initial
    const interval = setInterval(updateTime, 1000); // 🔥 every second
    return () => clearInterval(interval);
  }, []);



  // Animate on screen focus
  useFocusEffect(
    useCallback(() => {
      // Reset values
      cardAnim.setValue(0);
      rowAnim.setValue(0);
      // Card animation: scale + translate + opacity
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // After card anim, stagger rows
        Animated.timing(rowAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, [cardAnim, rowAnim])
  );
  // Interpolations for card
  const cardOpacity = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const cardScale = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  // Row animations: opacity and translateY
  const rowOpacity = rowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const rowTranslateY = rowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });
  return (
    <View style={styles.wrapper}>
      {/* Top Info Box */}
      <Animated.View
        style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
        }}
      >
        <Image
          style={{
            width: wp(90),
            resizeMode: "contain",
            height: wp(10),
            alignSelf: "center",
            marginBottom: wp(4),
          }}
          source={{ uri: homepageData?.sections[0]?.header_image }}
        />
        <ImageBackground
          source={require("../../assets/cardBg.png")}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          {/* Greeting */}
          <Animated.Text
            style={[styles.greeting, { opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] }]}
          >
            {employeeDetails?.welcome_text}
          </Animated.Text>

          {/* Name & Status */}
          <Animated.View style={[styles.rowBetween, { opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] }]}>
            <Text numberOfLines={1} style={styles.name}>
              {employeeDetails?.name || ''}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>{t("Emp Status")} :</Text>
              <Text style={styles.value}>{employeeDetails?.employee_status}</Text>
            </View>
          </Animated.View>

          {/* Emp ID & Date */}
          <Animated.View style={[styles.rowBetween, { opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] }]}>
            <View style={styles.row}>
              <Text style={styles.label}>{t("Emp ID")} :</Text>
              <Text style={styles.value}>{employeeDetails?.employee_id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("Emp Date")} :</Text>
              <Text style={styles.value}>{employeeDetails?.date}</Text>
            </View>
          </Animated.View>

          {/* Designation & Time */}
          <Animated.View style={[styles.rowBetween, { marginTop: wp(1), opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] }]}>
            <View style={styles.row}>
              <Text style={styles.label}>{t("Designation")} :</Text>
              <Text style={styles.value}>{employeeDetails?.designation || '-'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("Time")} :</Text>
              <Text style={styles.value}>{currentTime}</Text>
            </View>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: wp(3),
    alignItems: "center",
  },
  card: {
    width: wp(95),
    height: hp(18),
    padding: wp(3.4),
    justifyContent: "space-between",
  },
  cardImage: {
    borderRadius: wp(2),
  },
  greeting: {
    fontFamily: "Poppins_700Bold",
    color: COLORS.white,
    fontSize: wp(4.6),
    lineHeight: hp(3),
    marginBottom: wp(0.5),
  },
  name: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
    fontSize: wp(4),
    textTransform: "capitalize",
    maxWidth: wp(48),
  },
  label: {
    fontFamily: "Poppins_400Regular",
    color: COLORS.white,
    fontSize: wp(3),
    marginRight: wp(1),
  },
  value: {
    fontFamily: "Poppins_500Medium",
    color: COLORS.white,
    fontSize: wp(3),
    textTransform: "capitalize",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
