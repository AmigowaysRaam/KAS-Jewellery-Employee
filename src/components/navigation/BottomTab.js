import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, ImageBackground, StyleSheet, Text,
  TouchableOpacity
} from "react-native";
import { hp, wp } from "../../../app/resources/dimensions";
import AssignTaskListScreen from "../AssignTaskListScreen";
import Homescreen from "../Homescreen";
import MyTaskListScreen from "../MyTaskListScreen";
import Profilescreen from "../Profilescreen";
const Tab = createBottomTabNavigator();
/* 🔹 Image Icon Map */
const TAB_ICONS = {
  Home: require("../../../assets/homeTab.png"),
  "My Task": require("../../../assets/myTask.png"),
  "Assign Task": require("../../../assets/assignTask.png"),
  "My Account": require("../../../assets/myAcc.png"),
};
const TAB_COUNT = 4;
/* 🔹 Custom Tab Bar */
function CustomTabBar({ state, navigation }) {
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabWidth = wp(100) / TAB_COUNT;
  const { t } = useTranslation();
  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      stiffness: 120,
      damping: 15,
      mass: 1,
    }).start();
  }, [state.index]);

  return (
    <ImageBackground
      source={require("../../../assets/bottomTabBg.png")}
      style={styles.tabBar}
      resizeMode="cover"
    >
      {/* Animated Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth - 25,
            transform: [{ translateX: indicatorAnim }],
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const iconSource = TAB_ICONS[route.name];

        const onPress = () => {
          if (!isFocused) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <Image
              source={iconSource}
              style={[
                styles.icon,
                { tintColor: isFocused ? "#fff" : "#C5A8A8" },
              ]}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.label,
                { color: isFocused ? "#fff" : "#C5A8A8" },
              ]}
            >
              {t(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ImageBackground>
  );
}
export default function BottomTab() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={Homescreen} />
      <Tab.Screen name="My Task" component={MyTaskListScreen} />
      <Tab.Screen name="Assign Task" component={AssignTaskListScreen} />
      <Tab.Screen name="My Account" component={Profilescreen} />
    </Tab.Navigator>
  );
}
const styles = StyleSheet.create({
  tabBar: { flexDirection: "row", height: hp(8), alignItems: "center", },
  tabItem: {
    flex: 1, alignItems: "center", justifyContent: "center",
    zIndex: 2,
  }, icon: {
    width: wp(7), height: wp(7),
    marginBottom: hp(0.4),
  }, label: { fontSize: wp(2.4), fontFamily: "Poppins_500Medium", }, indicator: {
    position: "absolute", bottom: 0, left: wp(3.2), height: hp(0.6),
    backgroundColor: "#fff", borderTopLeftRadius: wp(1),
    borderTopRightRadius: wp(1), zIndex: 1,
  },
});
