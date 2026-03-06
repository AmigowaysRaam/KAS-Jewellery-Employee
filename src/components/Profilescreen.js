import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, ScrollView, StyleSheet, Text, View
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";

import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api";
import { setProfileDetails } from "./store/store";

const ProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const skeletonAnim = useRef(new Animated.Value(0.3)).current;

  const animateCard = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateSkeleton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnim, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(skeletonAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const fetchProfile = async () => {

    const lang = await getStoredLanguage();

    if (profileDetails?.id && profileDetails?.photo) {
      setLoading(false);
      animateCard();
      return;
    }
    try {
      setLoading(true);
      animateSkeleton();

      const response = await fetchData("app-employee-view-profile", "POST", {
        user_id: profileDetails?.id,
        lang: lang,
      });

      if (response?.text === "Success") {
        dispatch(setProfileDetails({ data: response?.data?.user_data }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      animateCard();
    }
  };

  useEffect(() => {
    //  console.log("", JSON.stringify(profileDetails, null, 2))
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return t("N/A");
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const infoData = [
    { icon: "mail-outline", value: profileDetails?.email || t("N/A") },
    {
      icon: "id-card-outline",
      value: `${profileDetails?.designation_name || ""}`,
    },
    {
      icon: "call-outline",
      value: `+91${profileDetails?.phone_number || ""}`,
    },

    {
      icon: "checkmark-done-outline",
      value: profileDetails?.is_verified || t("N/A"),
    },
    {
      icon: "calendar-outline",
      value: formatDate(profileDetails?.created),
    },
  ];

  const departmentData = [
    { value: "Software Development" },
    { value: "Chennai HQ" },
    { value: "QA Team" },
    { value: "HR Team" },
  ];

  const teamData = [
    { value: "Mobile App Team" },
    { value: "Rahul Sharma" },
    { value: "Anita Kumar" },
    { value: "Vikram Singh" },
  ];

  const departmentIcon = "business-outline";
  const teamIcon = "people-outline";

  return (
    <View style={styles.container}>
      <CommonHeader title={t("my_account")} showBackButton={false} />
      <Animated.View
        style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: hp(10) }} showsVerticalScrollIndicator={true}>
          {loading ? (
            <View>
              <View style={styles.loaderWrapper}>
                <Animated.View style={[styles.skeletonCircle, { opacity: skeletonAnim }]} />
                <View style={{ marginLeft: wp(3), flex: 1 }}>
                  <Animated.View style={[styles.skeletonLineShort, { opacity: skeletonAnim }]} />
                  <Animated.View style={[styles.skeletonLineLong, { opacity: skeletonAnim }]} />
                  <Animated.View style={[styles.skeletonLineShort, { opacity: skeletonAnim }]} />
                </View>
              </View>
            </View>
          ) : (
            <View>
              {/* Profile Top */}
              <View style={styles.topRow}>
                <View style={styles.profileIconWrapper}>
                  <Image
                    source={{ uri: profileDetails?.photo || "https://via.placeholder.com/150" }}
                    style={styles.profileIcon}
                  />
                </View>

                <View style={styles.profileText}>
                  <Text style={styles.name}>
                    {profileDetails?.admin_name || profileDetails?.full_name || ""}
                  </Text>
                  <Text style={styles.value}>
                    {profileDetails?.employee_id || t("N/A")}
                  </Text>
                </View>
              </View>

              {/* Profile Info */}
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t("profile_info")}</Text>
                {infoData.map((item, index) => (
                  <View key={index} style={styles.infoRow}>
                    <Ionicons name={item.icon} size={wp(5)} color={COLORS.primary} />
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t('department')}</Text>
                <ScrollView
                  style={{ maxHeight: hp(20) }}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.infoRow}>
                    <Ionicons name={departmentIcon} size={wp(5)} color={COLORS.primary} />
                    <Text style={styles.infoValue}>{profileDetails?.department_name}</Text>
                  </View>
                </ScrollView>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{t('team')}</Text>
                <ScrollView
                  style={{ maxHeight: hp(20) }}
                  showsVerticalScrollIndicator={true}
                >
                  {/* Teams (comma-separated string) */}

                  <View style={styles.infoCard}>
                    {Array?.isArray(profileDetails?.teams)
                      ? profileDetails.teams.map((team, index) => (
                        <View key={index} style={styles.infoRow}>
                          <Ionicons name={teamIcon} size={wp(5)} color={COLORS.primary} />
                          <Text style={styles.infoValue}>
                            {typeof team === "string" ? team.trim() : String(team)}
                          </Text>
                        </View>
                      ))
                      : typeof profileDetails?.teams === "string" && profileDetails.teams.trim().length > 0
                        ? profileDetails?.teams
                          .split(",")
                          .map((team, index) => (
                            <View key={index} style={styles.infoRow}>
                              <Ionicons name={teamIcon} size={wp(5)} color={COLORS.primary} />
                              <Text style={styles.infoValue}>{team.trim()}</Text>
                            </View>
                          ))
                        : (
                          <View style={styles.infoRow}>
                            <Ionicons name={teamIcon} size={wp(5)} color={COLORS.primary} />
                            <Text style={styles.infoValue}>N/A</Text>
                          </View>
                        )
                    }
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
};
export default ProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  card: {
    width: wp(95),
    maxHeight: hp(85),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(3),
    alignSelf: "center",
    marginTop: hp(1),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  loaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: COLORS.primary + "40",
  },
  skeletonLineShort: {
    height: wp(4),
    width: wp(30),
    borderRadius: wp(1),
    backgroundColor: COLORS.primary + "40",
    marginBottom: wp(1),
  },
  skeletonLineLong: {
    height: wp(4),
    width: wp(45),
    borderRadius: wp(1),
    backgroundColor: COLORS.primary + "40",
    marginBottom: wp(1),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  profileIconWrapper: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(9.5),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: wp(1),
  },
  profileIcon: {
    width: "100%",
    height: "100%",
    borderRadius: wp(9),
  },
  profileText: {
    marginLeft: wp(3),
  },
  name: {
    fontSize: wp(4.2),
    color: COLORS.primary,
    fontFamily: "Poppins_700Bold",
    textTransform: "capitalize",
  },
  value: {
    fontSize: wp(3.5),
    color: "#444",
    fontFamily: "Poppins_500Medium",
    marginTop: wp(1),
  },
  infoCard: {
    marginTop: hp(1),
  },
  infoTitle: {
    fontSize: wp(4),
    fontFamily: "Poppins_600SemiBold",
    marginBottom: hp(1),
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    borderBottomWidth: 0.5,
    borderBottomColor: "#E6E6E6",
  },
  infoValue: {
    fontSize: wp(3.5),
    marginLeft: wp(3),
    color: "#333",
    fontFamily: "Poppins_400Regular",
  },
});