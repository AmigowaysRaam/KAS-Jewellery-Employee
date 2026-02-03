import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  Animated, Image, Pressable, StyleSheet, Text, View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
export default function Header({
  openMenu, headerL,
  openLanguageMenu,
  notificationCount = "0", // can be string
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const notifCountNum = Number(notificationCount) || 0; // convert string to number
  const navigation = useNavigation();
  useEffect(() => {
    if (notifCountNum > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notifCountNum]);

  return (
    <View style={styles.container}>
      {/* Menu Icon */}
      <Pressable style={styles.iconContainer} onPress={openMenu}>
        <Image source={require("../../assets/menu.png")} style={styles.icon} />
      </Pressable>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={{ uri: headerL }} style={styles.logo} />
      </View>
      {/* Right Icons */}
      <View style={styles.rightContainer}>
        {/* Language Icon */}
        <Pressable style={styles.iconContainer} onPress={openLanguageMenu}>
          <Image
            source={require("../../assets/langIco.png")}
            style={styles.icon}
          />
        </Pressable>
        {/* Notification Icon */}
        <Pressable style={styles.iconContainer} onPress={() => navigation.navigate(

          'Notification'
        )}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Image
              source={require("../../assets/notifi.png")}
              style={styles.icon}
            />
            {notifCountNum > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notifCountNum > 9 ? "9+" : notifCountNum}
                </Text>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center", backgroundColor: "#fff", paddingHorizontal: wp(1.5), height: wp(20),
    justifyContent: "space-between",
  }, logoContainer: { flex: 1, alignItems: "center" },
  rightContainer: { flexDirection: "row", alignItems: "center" },
  iconContainer: { padding: wp(1), marginHorizontal: wp(0.8) },
  icon: { width: wp(10), height: wp(10), resizeMode: "contain" },
  logo: { width: wp(50), height: wp(11), resizeMode: "contain", marginBottom: wp(1) },
  badge: {
    position: "absolute", top: wp(-1.5), right: wp(-0.8),
    minWidth: wp(4.7), height: wp(4.7), borderRadius: wp(2.35), backgroundColor: COLORS.primary || "red",
    justifyContent: "center", alignItems: "center", paddingHorizontal: wp(1),
    borderColor: "white", borderWidth: wp(0.4),
  },
  badgeText: {
    color: "#fff", fontSize: wp(2.5), fontFamily: "Poppins_600SemiBold",
  },
});
