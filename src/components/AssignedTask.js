import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Image, Pressable, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const TASKS_INFO = {
  open: {
    labelKey: "Open",
    icon: require("../../assets/open_task.png"),
    bgColor: "#FFE4DE",
  },
  in_progress: {
    labelKey: "Inprogress",
    icon: require("../../assets/inprogress.png"),
    bgColor: "#FFD4D0",
  },
  waiting_for_approval: {
    labelKey: "Waiting for QC",
    icon: require("../../assets/waitingApproval.png"),
    bgColor: "#FFCFCF",
  },
  completed: {
    labelKey: "Completed",
    icon: require("../../assets/completed.png"),
    bgColor: "#FFE7E6",
  },
  re_work: {
    labelKey: "Rework",
    icon: require("../../assets/rework.png"),
    bgColor: "#FFD2E0",
  },
  over_due: {   // 👈 NEW STATUS
    labelKey: "Overdue",
    icon: require("../../assets/alertmark.png"),
    bgColor: '#ff0000',
  },
};
const AssignedTask = ({ homepageData }) => {
  const { t } = useTranslation();
  const myTaskSection = homepageData?.sections?.find(
    (item) => item.section === "assign_tasks"
  );
  const todayTasks = myTaskSection?.today_tasks || {};
  const totalTasks = myTaskSection?.total_tasks || {};
  const taskKeys = Object.keys(TASKS_INFO);
  // --- Animated refs for each card ---
  const todayAnimations = useRef(taskKeys.map(() => new Animated.Value(0))).current;
  const totalAnimations = useRef(taskKeys.map(() => new Animated.Value(0))).current;
  const overdueBlinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(overdueBlinkAnim, {
          toValue: 0,        // fade out
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overdueBlinkAnim, {
          toValue: 1,        // fade in
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    );
    blinkLoop.start();
    return () => blinkLoop.stop(); // clean up on unmount
  }, []);
  // --- Staggered animation ---
  const animateCards = (animations) => {
    const staggerAnims = animations.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    );
    Animated.stagger(150, staggerAnims).start();
  };
  useEffect(() => {
    animateCards(todayAnimations);
    animateCards(totalAnimations);
  }, [homepageData]);
  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const navigation = useNavigation()
  const renderTaskCard = (key, value, animValue, keyPrefix) => {
    const taskInfo = TASKS_INFO[key];
    const numericValue = Number(value) || 0;
    return (
      <Pressable
        style={{ opacity: numericValue > 0 ? 1 : 0.9 }}
        key={`${keyPrefix}-${key}`}
        onPress={() => {
          if (numericValue > 0) {
            navigation.navigate("AssignTaskListScreen", {
              status: taskInfo.labelKey,
              todayKey: keyPrefix
            });
          } else {
            ToastAndroid.show(t(`no_task_available`), ToastAndroid.SHORT);
          }
        }}
      >
        <Animated.View
          key={`${keyPrefix}-${key}`}
          style={[
            styles.taskCard,
            { backgroundColor: taskInfo.bgColor },
            {
              opacity: animValue,
              transform: [
                {
                  translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {key === "over_due" && value != 0 ? (
            <Animated.Image
              source={taskInfo.icon}
              style={[
                styles.icon,
                { opacity: overdueBlinkAnim } // apply blinking animation
              ]}
            />
          ) : (
            <Image style={styles.icon} source={taskInfo.icon} />
          )}
          <View style={{ marginHorizontal: wp(2) }}>
            <Text style={[styles.taskLabel, {
              color: taskInfo.labelKey == 'Overdue' ? "#fff" : '#000'
            }]}>{t(taskInfo.labelKey)}</Text>
            <Text style={[styles.taskValue, {
              color: taskInfo.labelKey == 'Overdue' ? "#fff" : '#000'
            }]}>{`${value || 0} Task`}</Text>
          </View>
        </Animated.View>
      </Pressable >
    );
  };
  return (
    <View style={{
      backgroundColor: "#FFF0F0", width: wp(100), alignItems: "center", marginTop: hp(2.5),
      paddingVertical: hp(2),
    }}>
      <View style={styles.wrapper}>
        <Pressable onPress={() => navigation.navigate("AssignTaskListScreen", { status: null })}>
          <Text style={styles.greeting}>{t("assigned_task")}</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: wp(92),
            }}
          >
            <Text style={[styles.taskCountText, { color: COLORS.primary }]}>
              {`${t("todays_task")}: ${todayTasks.count || 0}`}
            </Text>
            <Text style={[styles.taskCountText, { color: COLORS.primary }]}>
              {formattedDate}
            </Text>
          </View>
        </Pressable>
        {/* Today Task Cards */}
        <View
          style={{
            width: wp(93),
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: hp(1),
          }}
        >
          {taskKeys.map((key, index) =>
            renderTaskCard(key, todayTasks[key], todayAnimations[index], "today")
          )}
        </View>
        {/* Total Tasks Header */}
        <Text style={[styles.taskCountText, { color: COLORS.primary, marginTop: hp(0) }]}>
          {`${t("total_tasks")} : ${totalTasks.count || 0}`}
        </Text>
        {/* Total Task Cards */}
        <View
          style={{
            width: wp(93),
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: hp(1),
          }}
        >
          {taskKeys.map((key, index) =>
            renderTaskCard(key, totalTasks[key], totalAnimations[index], "total")
          )}
        </View>
      </View>
    </View>
  );
};

export default AssignedTask;
const styles = StyleSheet.create({
  wrapper: { marginHorizontal: wp(2) },
  greeting: {
    fontFamily: "Poppins_500Medium", color: COLORS.primary,
    fontSize: wp(4), lineHeight: hp(3.5), marginBottom: hp(0),
  }, taskCountText: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.2), lineHeight: hp(3.5),
  }, taskCard: {
    width: wp(46), height: hp(6.5), borderRadius: wp(1.5), alignItems: "center",
    flexDirection: "row", paddingHorizontal: wp(1), marginBottom: hp(1),
  }, icon: { width: wp(12), height: wp(12), },
  taskLabel: {
    fontFamily: "Poppins_600SemiBold", color: COLORS.primary, fontSize: wp(2.5), textTransform: "capitalize",
    maxWidth: wp(28),
  }, taskValue: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.black, fontSize: wp(3.8),
  },
});