import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api"; // your API function
import { setProfileDetails } from "./store/store"; // redux action
const ProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const siteDetails = useSelector(
    (state) => state.auth?.siteDetails?.data[0]
  );
  const imageSource =
    siteDetails?.logo_image
      ? { uri: siteDetails.logo_image }
      : require("../../assets/KASEmpLogo.png");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Animation refs

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
  // Fetch profile from API if not in store
  const fetchProfile = async () => {
    setLoading(true);
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
      } else {
        console.warn("API returned failure:", response);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
      animateCard();
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };
  const formatDate = (dateString) => {
    if (!dateString) return t("N/A");
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const infoData = [
    { icon: "mail-outline", value: profileDetails?.email || t("N/A") },
    { icon: "call-outline", value: `+91${profileDetails?.phone_number}` || t("N/A") },
    { icon: "shield-checkmark-outline", value: profileDetails?.status || t("N/A") },
    { icon: "checkmark-done-outline", value: profileDetails?.is_verified || t("N/A") },
    { icon: "calendar-outline", value: formatDate(profileDetails?.created) },
  ];

  return (
    <ScrollView
      style={styles.container}
    >
      <CommonHeader title={t("My Account")} showBackButton={false} />
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
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
            <Animated.View style={[styles.skeletonLineShort, { opacity: skeletonAnim, height: hp(5), width: wp(80), marginTop: wp(4) }]} />
            <Animated.View style={[styles.skeletonLineShort, { opacity: skeletonAnim, height: hp(5), width: wp(80), marginTop: wp(4) }]} />
            <Animated.View style={[styles.skeletonLineShort, { opacity: skeletonAnim, height: hp(5), width: wp(80), marginTop: wp(4) }]} />
          </View>

        ) : (
          <View>
            {/* Top Row */}
            <View style={styles.topRow}>
              <View style={styles.profileIconWrapper}>
                <Image
                  source={{ uri: profileDetails?.photo || "https://via.placeholder.com/150" }}
                  style={styles.profileIcon}
                />
              </View>
              <View style={{ marginLeft: wp(3), justifyContent: "center", flex: 1 }}>
                <Text style={styles.name}>{profileDetails?.admin_name || t("N/A")}</Text>
                <Text style={styles.type}>{t(profileDetails?.admin_type || "Manager")}</Text>
                <Text style={styles.value}>{profileDetails?.employee_id || t("N/A")}</Text>
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>{t("Profile Information")}</Text>
              {infoData.map((item, index) => (
                <View key={index} style={styles.infoRow}>
                  <Ionicons name={item.icon} size={wp(5)} color={COLORS.primary} style={{ marginRight: wp(2) }} />
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};
export default ProfileScreen;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  card: {
    width: wp(90),
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    padding: wp(2),
    alignSelf: "center",
    marginBottom: wp(3),
    marginTop: wp(2),
  },
  loaderWrapper: { flexDirection: "row", alignItems: "center" },
  skeletonCircle: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: COLORS?.primary + 40,
  },
  skeletonLineShort: {
    height: wp(4),
    width: wp(30),
    borderRadius: wp(1),
    backgroundColor: "#ccc",
    marginBottom: wp(1),
    backgroundColor: COLORS?.primary + 40,
  },
  skeletonLineLong: {
    height: wp(4), width: wp(45),
    borderRadius: wp(1), backgroundColor: COLORS?.primary + 40, marginBottom: wp(1),
  }, topRow: {
    flexDirection: "row",
    alignItems: "center", marginBottom: wp(5),
  }, profileIconWrapper: {
    width: wp(19), height: wp(19), borderRadius: wp(9.5), overflow: "hidden",
    borderWidth: wp(0.5), borderColor: COLORS?.primary, padding: wp(1),
    alignItems: "center", justifyContent: "center",
  },
  profileIcon: {
    width: wp(18), height: wp(18),
    borderRadius: wp(9), resizeMode: "contain",
  },
  name: {
    fontSize: wp(5), color: COLORS.primary, fontFamily: "Poppins_700Bold",
    textTransform: "capitalize",
  }, type: {
    fontSize: wp(4), color: COLORS.primary, fontFamily: "Poppins_600SemiBold",
    marginTop: wp(0.5), textTransform: "capitalize",
  },
  value: {
    fontSize: wp(4), color: COLORS.primary,
    fontFamily: "Poppins_500Medium", marginTop: wp(0.5),
    textTransform: "capitalize",
  }, infoCard: {
    backgroundColor: 'transparent', borderRadius: wp(2),
    padding: wp(1),
    marginTop: wp(3), width: wp(90), alignSelf: "center"
  }, infoTitle: {
    fontSize: wp(4.2),
    fontFamily: "Poppins_600SemiBold",
    marginBottom: wp(3),
    color: "#333", textTransform: "capitalize",
  }, infoRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: wp(2),
    borderBottomWidth: 0.5, borderBottomColor: "#ddd",
  },
  infoValue: { fontSize: wp(4), color: "#222", fontFamily: "Poppins_400Regular", },
});