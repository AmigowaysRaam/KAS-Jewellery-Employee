import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Animated, StyleSheet, View,
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
export default function LogoAnimated() {
  const slideAnim = useRef(new Animated.Value(-hp(20))).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const siteDetails = useSelector(
    (state) => state.auth?.siteDetails?.data[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
        speed: 3,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, scaleAnim]);
  // Decide which image to show
  const imageSource =
    siteDetails?.logo_image && !error
      ? { uri: siteDetails.logo_image }
      : require("../../assets/KASEmpLogo.png");
  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          size="large"
          color={COLORS?.primary}
          style={StyleSheet.absoluteFill} // overlays the image
        />
      )}
      <Animated.Image
        source={imageSource}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        style={[
          styles.logo,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
            height: hp(26),
            width: wp(80),
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {},
});
