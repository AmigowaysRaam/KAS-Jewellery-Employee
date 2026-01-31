import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
const SkeletonLoader = ({ width = "100%", height = 20, borderRadius = 5, style }) => {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[{ width, height, borderRadius, overflow: "hidden", backgroundColor: "#eee" }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#ddd",
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

export default SkeletonLoader;
