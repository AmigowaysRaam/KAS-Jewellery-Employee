import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";

const PunchCard = ({ onLoading }) => {
  const { t } = useTranslation();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Card entrance animation
  const translateY = useRef(new Animated.Value(hp(5))).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Press animation for button
  const pressScale = useRef(new Animated.Value(1)).current;

  // Active animation
  const activeAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // Card scale animation on punch in/out
  const cardScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      translateY.setValue(hp(5));
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, [])
  );
  // Active animation trigger
  useEffect(() => {
    Animated.parallel([
      Animated.spring(activeAnim, {
        toValue: isPunchedIn ? 1 : 0,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isPunchedIn]);
  const { showToast } = useToast();

  const handlePressIn = () => {
    if (loading) return;
    const message = isPunchedIn ? "Ready to punch out?" : "Welcome back! Let's start your day";
    // showToast(message, "success");

    Animated.spring(pressScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();

    // Also scale card slightly
    Animated.spring(cardScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    if (loading) return;
    const message = isPunchedIn
      ? "You have successfully punched out. Have a great day!"
      : "You have successfully punched in. Welcome!";
    const type = isPunchedIn ? "info" : "success";
    // showToast(message, type);

    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Card pop effect
    Animated.sequence([
      Animated.spring(cardScale, {
        toValue: 1.03,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Show loader
    setLoading(true);
    onLoading?.(true); // <-- notify parent

    // Simulate API call
    setTimeout(() => {
      setIsPunchedIn((prev) => !prev);
      setLoading(false);
      onLoading?.(false); // <-- notify parent
    }, 1000);
  };

  // Animated background color
  const backgroundColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary, COLORS.accent],
  });

  // Icon rotate animation
  const rotate = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const formattedDate = currentTime.toDateString();
  const formattedTime = currentTime.toLocaleTimeString();

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateY }, { scale: cardScale }],
          opacity,
        },
      ]}
    >
      {/* LEFT SIDE */}
      <View style={styles.leftContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>

      {/* BUTTON */}
      <View style={styles.buttonOuter}>
        {/* Glow */}
        <Animated.View
          style={[
            styles.glow,
            {
              opacity: glowOpacity,
              backgroundColor: isPunchedIn ? COLORS.accent : COLORS.primary,
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: pressScale }] }}>
          <Pressable
            onPressIn={() => handlePressIn()}
            onPressOut={handlePressOut}
            disabled={loading}
          >
            <Animated.View
              style={[
                styles.roundButton,
                { backgroundColor },
              ]}
            >
              {loading ? (
                <ActivityIndicator size={hp(16)} color={COLORS.white} />
              ) : (
                <>
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <Icon
                      name={isPunchedIn ? "login" : "logout"}
                      size={wp(6)}
                      color={COLORS.white}
                    />
                  </Animated.View>

                  <Text style={styles.buttonText}>
                    {isPunchedIn ? t("punchOut") : t("punchIn")}
                  </Text>
                </>
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default PunchCard;

const styles = StyleSheet.create({
  card: {
    width: wp(95),
    alignSelf: "center",
    marginTop: hp(2),
    padding: wp(4),
    backgroundColor: COLORS.ashGrey,
    borderRadius: wp(3),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    fontFamily: "Poppins_600SemiBold",
  },
  timeText: {
    fontSize: wp(7),
    color: COLORS.primary,
    fontFamily: "Poppins_600SemiBold",
    marginTop: hp(0.5),
  },
  buttonOuter: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(18),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: wp(35),
    height: wp(35),
    borderRadius: wp(18),
  },
  roundButton: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(18),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: hp(0.5),
  },
});
