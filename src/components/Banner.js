import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const Banner = ({ homepageData }) => {
  const { t } = useTranslation();
  const cardAnim = useRef(new Animated.Value(0)).current;
  const rowAnim = useRef(new Animated.Value(0)).current;

  const employeeDetails = homepageData?.sections[1]?.employee_details;

  // Live time state
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const timeAnim = useRef(new Animated.Value(0)).current;

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);

      // Animate time fade-in
      timeAnim.setValue(0);
      Animated.timing(timeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };

    updateTime(); // initial
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeAnim]);

  // Animate on screen focus
  useFocusEffect(
    useCallback(() => {
      cardAnim.setValue(0);
      rowAnim.setValue(0);

      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(rowAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, [cardAnim, rowAnim])
  );

  const cardOpacity = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] });
  const rowOpacity = rowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const rowTranslateY = rowAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
        }}
      >
        {/* Header Image */}
        <Image
          style={styles.headerImage}
          source={{ uri: homepageData?.sections[0]?.header_image }}
        />

        <ImageBackground
          source={require("../../assets/cardBg.png")}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          {/* Date & Time Row */}
          <View style={[styles.row, { alignSelf: "center", marginBottom: wp(1) }]}>
            <Text style={[styles.value, { marginRight: wp(2) }]}>{currentDate}</Text>
            <Text style={[styles.value, { marginRight: wp(2) }]}>{'|'}</Text>
            <Text style={[styles.value, ]}>
              {currentTime}
            </Text>
          </View>

          {/* Greeting */}
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.greeting,
              { opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] },
            ]}
          >
            {employeeDetails?.welcome_text}
            <Text numberOfLines={1} style={styles.name}>
              {`, ${employeeDetails?.name}`}
            </Text>
          </Animated.Text>

          {/* Employee Info Row */}
          <Animated.View
            style={[
              styles.rowBetween,
              { opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] },
            ]}
          >
            <View style={styles.row}>
              <Text style={styles.value}>{employeeDetails?.employee_id}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>{t("joining_date")} :</Text>
              <Text style={styles.value}>{employeeDetails?.date}</Text>
            </View>
          </Animated.View>

          {/* Designation Row */}
          <Animated.View
            style={[
              styles.row,
              { marginTop: wp(1), opacity: rowOpacity, transform: [{ translateY: rowTranslateY }] },
            ]}
          >
            <Text numberOfLines={1} style={[styles.value, { maxWidth: wp(90), lineHeight: wp(5) }]}>
              {employeeDetails?.designation || "-"}
            </Text>
          </Animated.View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  wrapper: { marginVertical: wp(1), alignItems: "center" },
  headerImage: {
    width: wp(90),
    resizeMode: "contain",
    height: wp(10),
    alignSelf: "center",
    marginBottom: wp(4),
  },
  card: {
    width: wp(95),
    height: hp(16),
    padding: wp(3.5),
    justifyContent: "space-between",
  },
  cardImage: { borderRadius: wp(2) },
  greeting: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
    fontSize: wp(4.1),
    lineHeight: hp(3),
    marginBottom: wp(0),
  },
  name: {
    fontFamily: "Poppins_700Bold",
    color: COLORS.white,
    fontSize: wp(4.4),
    textTransform: "capitalize",
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
    lineHeight: wp(3),
  },
  row: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});