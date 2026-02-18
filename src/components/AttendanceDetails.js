import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, ImageBackground, Pressable, StyleSheet,
  Text, View,
} from "react-native";
import { Icon } from "react-native-elements";
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

const AttendanceDetails = ({ homepageData }) => {
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
      <>
        <Pressable onPress={() => navigation?.navigate('AttendanceLog', {
          hData: homepageData
        })}  >
          {/* HEADER */}
          <View style={styles.headerRow}>
            <Text numberOfLines={1} style={[styles.title, {
              lineHeight: hp(3)
            }]}>
              {`${currentMonth}-${'2026'}`}
            </Text>
            <Pressable onPress={() => navigation?.navigate('AttendanceLog', {
              hData: homepageData
            })} style={styles.viewButton}>
              <Text style={styles.viewButtonText}>
                <Icon name="arrow-right" type="feather" color={COLORS.primary} size={wp(5)} />
              </Text>
            </Pressable>
          </View>
          <View style={[styles.headerRow, {
            marginVertical: wp(1), marginTop: wp(3)
          }]}>
            <Text numberOfLines={1} style={[styles.title, {
              fontSize: wp(3.5)
            }]}>
              {`${'Total Working Days'}-${'26'}`}
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              <Pressable onPress={() => navigation?.navigate('AttendanceLog', {
                hData: homepageData
              })} style={[styles.viewSButton, {
                backgroundColor: '#008000'
              }]}>
                <Text style={[styles.viewButtonText, {
                  color: "#fff"
                  , fontSize: wp(3.2), lineHeight: wp(5)
                }]}>
                  {'Apply Leave'}
                </Text>
              </Pressable>
              <Pressable onPress={() => navigation?.navigate('PayrollLogScreen', {
                hData: homepageData
              })} style={[styles.viewSButton, {
                backgroundColor: COLORS?.primary
              }]}>
                <Text style={[styles.viewButtonText, {
                  color: "#fff"
                  , fontSize: wp(3.2), lineHeight: wp(5)
                }]}>
                  {'Payroll'}
                </Text>
              </Pressable>
            </View>

          </View>
          <ImageBackground
            source={require("../../assets/cardBg.png")}
            style={styles.summaryCard}
            imageStyle={styles.summaryImage}
          >
            <View style={styles.summaryHalf}>
              <Text style={styles.summaryText}>
                {`${t("Present Days")}: 25`}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryHalf}>
              <Text style={styles.summaryText}>
                {`${t("Leave Days")}: 20`}
              </Text>
            </View>
          </ImageBackground>

          <Text style={[styles.dateText, {
            alignSelf: "center", borderWidth: wp(0.3), padding: wp(1), borderRadius: wp(4), borderColor: COLORS?.primary, paddingHorizontal: wp(4), lineHeight: wp(5.5)
          }]}>
            {`${t("Wednesday")} : ${formattedDate}`}
            {/* 17/02/2026 - 17/02/2026 - Tuesday */}
          </Text>
          {/* GRID CARDS */}
          <View style={styles.grid}>
            {keys.map((key, index) =>
              renderCard(key, todayData[key], animations[index])
            )}
          </View>

          {/* BUTTONS */}
          <View style={styles.bottomRow}>
            <Pressable style={[styles.bottomButton, {
            }]}>
              <Text style={styles.bottomButtonTextPrimary}>
                {t("appy_leave")}
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
        </Pressable>



      </>

    </View>
  );
};
export default AttendanceDetails;
const styles = StyleSheet.create({
  container: {
    width: "94%", alignSelf: "center",
    backgroundColor: "#f9f9f9", borderRadius: wp(2), paddingVertical: hp(2), paddingHorizontal: wp(2.5),
    elevation: 4, marginVertical: hp(1.5),
  }, headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  }, title: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(4.8), color: COLORS.primary, maxWidth: wp(50)
  }, viewButton: {
    paddingVertical: hp(0.2), paddingHorizontal: wp(4),
    borderRadius: wp(5), borderWidth: 1, borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "11",
  },
  viewSButton: {
    paddingVertical: hp(0.7), paddingHorizontal: wp(3),
    borderRadius: wp(5),
    marginHorizontal: wp(1)
  },
  viewButtonText: {
    fontFamily: "Poppins_500Medium", fontSize: wp(3.2), color: COLORS.primary,
  }, dateText: {
    marginTop: hp(1), fontFamily: "Poppins_500Medium", fontSize: wp(3.1), color: COLORS.primary,
  }, summaryCard: {
    flexDirection: "row", alignItems: "center", marginTop: hp(1.5), paddingVertical: hp(1.5), borderRadius: wp(2),
  }, summaryImage: { borderRadius: wp(2), }, summaryHalf: {
    flex: 1, alignItems: "center",
  }, summaryText: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.6), color: "#FFF",
  }, divider: {
    width: wp(0.5), height: "90%", backgroundColor: "#f9f9f9",
  }, grid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: hp(1.5),
  }, cardWrapper: {
    width: "49%", marginBottom: hp(1.2),
  }, taskCard: {
    borderRadius: wp(2),
    flexDirection: "row", alignItems: "center", padding: wp(1),
  }, icon: {
    width: wp(12), height: wp(12), resizeMode: "contain", borderRadius: wp(2)
  }, cardTextContainer: {
    marginLeft: wp(2), flex: 1,
  }, taskLabel: {
    fontFamily: "Poppins_400Regular", fontSize: wp(2.6),
  }, taskValue: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.6), marginTop: hp(0.2),
  }, bottomRow: {
    flexDirection: "row", justifyContent: "space-between",
    marginTop: hp(2),
  }, bottomButton: {
    width: "48%", height: hp(5.5), borderRadius: wp(8), justifyContent: "center",
    alignItems: "center", backgroundColor: COLORS.primary + "15",
    borderWidth: 1, borderColor: COLORS.primary,
  }, logoutButton: {
    backgroundColor: COLORS.primary,
  }, bottomButtonTextPrimary: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.8), color: COLORS.primary,
  }, bottomButtonTextWhite: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.8),
    color: "#FFF",
  },
});