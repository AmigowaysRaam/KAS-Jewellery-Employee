import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, ImageBackground, Pressable, StyleSheet,
  Text, View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const ATTENDANCE_INFO = {
  login_time: {
    labelKey: "Log In Time",
    icon: require("../../assets/loginicon.png"),
    bgColor: "#FFE4DE",
  },
  logout_time: {
    labelKey: "Log Out Time",
    icon: require("../../assets/logouticon.png"),
    bgColor: "#FFE4DE",
  },
  morning_tea_break: {
    labelKey: "Morning Tea Break",
    icon: require("../../assets/morgnteaBreak.png.png"),
    bgColor: "#FFE4DE",
  },
  evening_tea_break: {
    labelKey: "Evening Tea Break",
    icon: require("../../assets/eveningteaBreak.png"),
    bgColor: "#FFE4DE",
  },
  lunch_break: {
    labelKey: "Lunch Break",
    icon: require("../../assets/lBreak.png"),
    bgColor: "#FFE4DE",
  },
  today_working_hour: {
    labelKey: "Today Working Hour",
    icon: require("../../assets/totalWork.png"),
    bgColor: "#FFE4DE",
  },
};

const AttendanceDetailsLog = ({ homepageData }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const attendanceSection = homepageData?.sections?.find(
    (item) => item.section === "assign_tasks"
  );

  const todayData = attendanceSection?.today_tasks || {};
  const keys = Object.keys(ATTENDANCE_INFO);
  const animations = useRef(keys.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const staggerAnims = animations.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    );
    Animated.stagger(120, staggerAnims).start();
  }, [homepageData]);

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
  });

  const renderCard = (key, value, animValue) => {
    const info = ATTENDANCE_INFO[key];
    const displayValue = value || "00:00";

    return (
      <Pressable key={key} style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.taskCard,
            { backgroundColor: info.bgColor },
            {
              opacity: animValue,
              transform: [
                {
                  translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image style={styles.icon} source={info.icon} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.taskLabel}>
              {t(info.labelKey)}
            </Text>
            <Text style={styles.taskValue}>
              {displayValue}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  };
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          {`${currentMonth} - ${t("Attendance")}`}
        </Text>
      </View>
      <ImageBackground
        source={require("../../assets/cardBg.png")}
        style={styles.summaryCard}
        imageStyle={styles.summaryImage}
      >
        <View style={styles.summaryHalf}>
          <Text style={styles.summaryText}>
            {`${t("present_days")}: 25`}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryHalf}>
          <Text style={styles.summaryText}>
            {`${t("leave_days")}: 20`}
          </Text>
        </View>
      </ImageBackground>

      <Text style={[styles.dateText, {
        alignSelf: "center", borderWidth: wp(0.3), padding: wp(1), borderRadius: wp(4), borderColor: COLORS?.primary, paddingHorizontal: wp(4), lineHeight: wp(5.5)
      }]}>
        {`${t("Tuesday")} : ${formattedDate}`}
        {/* 17/02/2026 - 17/02/2026 - Tuesday */}
      </Text>
      {/* GRID CARDS */}
      <View style={styles.grid}>
        {keys.map((key, index) =>
          renderCard(key, todayData[key], animations[index])
        )}
      </View>
      <View style={styles.bottomRow}>
        <Pressable style={[styles.bottomButton, {
          backgroundColor:COLORS?.white+"20"
        }]}>
          <Text style={styles.bottomButtonTextPrimary}>
            {t("permission")}
          </Text>
        </Pressable>
        <Pressable style={[styles.bottomButton, styles.logoutButton, {
          backgroundColor:COLORS?.primary+"20"
          // opacity:0.7
        }]}>
          <Text style={[styles.bottomButtonTextWhite,{
            color:COLORS?.primary
          }]}>
            {t("Break")}
          </Text>
        </Pressable>
        <Pressable style={[styles.bottomButton, styles.logoutButton, {
          // opacity:0.7
        }]}>
          <Text style={styles.bottomButtonTextWhite}>
            {t("log_out")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
export default AttendanceDetailsLog;
const styles = StyleSheet.create({
  container: {
    width: "92%", alignSelf: "center",
    backgroundColor: "#f9f9f9", borderRadius: wp(3), paddingVertical: hp(2), paddingHorizontal: wp(2),
    elevation: 4,
    marginBottom: hp(2)
  },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
  }, title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: wp(3.8), color: COLORS.primary,
  }, viewButton: {
    paddingVertical: hp(0.6), paddingHorizontal: wp(4),
    borderRadius: wp(5), borderWidth: 1, borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "11",
  },
  viewButtonText: {
    fontFamily: "Poppins_500Medium", fontSize: wp(3.2),
    color: COLORS.primary,
  }, dateText: {
    marginTop: hp(1), fontFamily: "Poppins_500Medium",
    fontSize: wp(3.1), color: COLORS.primary,
  }, summaryCard: {
    flexDirection: "row",
    alignItems: "center", marginTop: hp(1.5),
    paddingVertical: hp(1.5), borderRadius: wp(2),
  },
  summaryImage: {
    borderRadius: wp(2),
  },
  summaryHalf: {
    flex: 1, alignItems: "center",
  }, summaryText: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.6), color: "#FFF",
  }, divider: {
    width: wp(0.5), height: "90%", backgroundColor: "#f9f9f9",
  }, grid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "space-between", marginTop: hp(1.5),
  }, cardWrapper: {
    width: "49%", marginBottom: hp(1.2),
  }, taskCard: {
    borderRadius: wp(2),
    flexDirection: "row", alignItems: "center", padding: wp(1),
  }, icon: {
    width: wp(12), height: wp(12),
    resizeMode: "contain", borderRadius: wp(2)
  }, cardTextContainer: {
    marginLeft: wp(2),
    flex: 1,
  }, taskLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: wp(2.6),
  }, taskValue: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.6), marginTop: hp(0.2),
  }, bottomRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: hp(2),
  }, bottomButton: {
    width: "30%", height: hp(4), borderRadius: wp(8), justifyContent: "center",
    alignItems: "center", backgroundColor: COLORS.primary + "15",
    borderWidth: 1, borderColor: COLORS.primary,
  }, logoutButton: {
    backgroundColor: COLORS.primary,
  }, bottomButtonTextPrimary: {
    fontFamily: "Poppins_400Regular", fontSize: wp(3.2), color: COLORS.primary,
  }, bottomButtonTextWhite: {
    fontFamily: "Poppins_400Regular", fontSize: wp(3.2),
    color: "#FFF",
  },
});