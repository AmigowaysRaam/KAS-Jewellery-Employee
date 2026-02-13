import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, ImageBackground, Pressable,
  StyleSheet, Text, View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const TAB_ITEMS = [
  {
    key: "attendance",
    icon: require("../../assets/myTaskFill.png"),
    route: "Attendance",
  },
  {
    key: "payroll",
    icon: require("../../assets/assignTaskFill.png"),
    route: "PayRollScreen",
  },
];
const HomeMenuRow = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const leftAnim = useRef(new Animated.Value(-wp(50))).current;
  const rightAnim = useRef(new Animated.Value(wp(50))).current;
  const opacityLeft = useRef(new Animated.Value(0)).current;
  const opacityRight = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      leftAnim.setValue(-wp(50));
      rightAnim.setValue(wp(50));
      opacityLeft.setValue(0);
      opacityRight.setValue(0);

      Animated.parallel([
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityLeft, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityRight, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );

  return (
    <View style={styles.container}>
      {TAB_ITEMS.map((item, index) => {
        const isLeft = index === 0;
        const translateX = isLeft ? leftAnim : rightAnim;
        const opacity = isLeft ? opacityLeft : opacityRight;

        return (
          <Pressable
            key={item.key}
            onPress={() => navigation.navigate(item.route, { status: null })}
          >
            <Animated.View style={{ transform: [{ translateX }], opacity }}>
              <View style={styles.wrapper}>
                <ImageBackground
                  resizeMode="cover"
                  source={require("../../assets/buttonLgrd.png")}
                  style={styles.card}
                  imageStyle={styles.cardImage}
                >
                  <Image
                    tintColor={COLORS.white}
                    source={item.icon}
                    style={styles.icon}
                    resizeMode="contain"
                  />

                  {/* 🔥 Tamil-safe text */}
                  <Text
                    style={styles.greeting}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {t(item.key)}
                  </Text>
                </ImageBackground>
              </View>
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};
export default HomeMenuRow;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(94),
    alignSelf: "center",
  },
  wrapper: {
    marginTop: hp(2.2),
    alignItems: "center",
  },
  card: {
    width: wp(46),
    height: hp(8),                 // Increased height for Tamil
    paddingHorizontal: hp(2),
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    borderRadius: wp(2),
  },
  icon: {
    width: wp(7),
    height: wp(7),
    marginRight: hp(1),
  },
  greeting: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
    fontSize: wp(3.3),
    lineHeight: hp(2.6),
    flexShrink: 1,                // ⭐ KEY FIX
    maxWidth: wp(32),             // ⭐ KEY FIX
    textTransform: "capitalize",          // Optional: Capitalize text for better aesthetics
  },
});
