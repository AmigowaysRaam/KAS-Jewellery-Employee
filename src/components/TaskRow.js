import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";



const TAB_ICONS = {
  "My Tasks": require("../../assets/myTaskFill.png"),
  "Assign Task": require("../../assets/assignTaskFill.png"),
};

const TaskRow = () => {
  const { t } = useTranslation();
  const navigation = useNavigation()

  // Animation refs for each card
  const leftAnim = useRef(new Animated.Value(-wp(50))).current; // Start offscreen left
  const rightAnim = useRef(new Animated.Value(wp(50))).current; // Start offscreen right
  const opacityLeft = useRef(new Animated.Value(0)).current;
  const opacityRight = useRef(new Animated.Value(0)).current;

  // Animate on screen focus
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
    }, [leftAnim, rightAnim, opacityLeft, opacityRight])
  );
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", width: wp(94), alignSelf: "center" }}>
      {Object.keys(TAB_ICONS).map((task, index) => {
        const isLeft = index === 0;
        const translateX = isLeft ? leftAnim : rightAnim;
        const opacity = isLeft ? opacityLeft : opacityRight;
        return (
          <Pressable onPress={() => navigation.navigate(task == 'My Tasks' ? "MyTaskListScreen" : 'AssignTaskListScreen', { status: null })
          }>
            <Animated.View
              key={task}
              style={{
                transform: [{ translateX }],
                opacity,
              }}
            >
              <View style={styles.wrapper}>
                <ImageBackground
                  resizeMode="cover"
                  source={require("../../assets/buttonLgrd.png")}
                  style={styles.card}
                  imageStyle={styles.cardImage}
                >
                  <Image
                    tintColor={COLORS.white}
                    source={TAB_ICONS[task]}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                  <Text style={styles.greeting}>{t(task)}</Text>
                </ImageBackground>
              </View>
            </Animated.View>
          </Pressable>
        );
      })}
    </View >
  );
};
export default TaskRow;
const styles = StyleSheet.create({
  wrapper: {
    marginVertical: wp(4),
    alignItems: "center",
  },
  card: {
    width: wp(46),
    height: hp(7.5),
    paddingHorizontal: hp(3),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
    fontSize: wp(4),
    lineHeight: hp(3.5),
  },
});
