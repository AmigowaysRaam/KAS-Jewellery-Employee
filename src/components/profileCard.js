import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Image, Pressable, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import { setProfileDetails } from "./store/store";
const ProfileCard = ({ onClose, loadingMenu, onEditProfile }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const skeletonAnim = useRef(new Animated.Value(0.3)).current;
  const navigation = useNavigation();

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
  const fetchHomepageData = async () => {
    const lang = await getStoredLanguage();
    if (!profileDetails?.id) return;
    try {
      setLoading(true);
      animateSkeleton();
      const response = await fetchData(
        "app-employee-view-profile",
        "POST",
        { user_id: profileDetails?.id, lang: lang }
      );
      if (response?.text === "Success") {
        dispatch(setProfileDetails({ data: response?.data?.user_data }));
        animateCard();
      } else {
        console.warn("API returned failure:", response);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!profileDetails?.id || !profileDetails?.photo)
      fetchHomepageData();
  }, []);

  const hanldPROCLick = () => {
    navigation?.navigate('My Account')
    onClose()
      ;
  }
  return (
    <Pressable onPress={() => hanldPROCLick()} style={styles.wrapper}>
      <View
        style={[
          styles.card,
        ]}
      >
        {loading ? (
          <View style={styles.loaderWrapper}>
            {/* Skeleton Avatar */}
            <Animated.View
              style={[
                styles.skeletonCircle,
                { opacity: skeletonAnim },
              ]}
            />
            {/* Skeleton Texts */}
            <View style={{ marginLeft: wp(3), flex: 1 }}>
              <Animated.View
                style={[styles.skeletonLineShort, { opacity: skeletonAnim }]}
              />
              <Animated.View
                style={[styles.skeletonLineLong, { opacity: skeletonAnim }]}
              />
              <Animated.View
                style={[styles.skeletonLineShort, { opacity: skeletonAnim }]}
              />
            </View>
          </View>
        ) : (
          <View style={styles.topRow}>
            {/* Profile Section */}
            <View style={{ flexDirection: "row", flex: 1 }}>
              <View style={styles.profileIconWrapper}>
                <Image
                  source={{ uri: profileDetails?.photo }}
                  style={styles.profileIcon}
                />
                {/* Edit Icon */}
                {/* <TouchableOpacity
                  style={styles.editIcon}
                  onPress={onEditProfile}
                >
                  <Icon name="create-sharp" size={wp(4)} color={COLORS.white} />
                </TouchableOpacity> */}
              </View>
              <View
                style={{ marginLeft: wp(3), justifyContent: "center", flex: 1 }}
              >
                <Text numberOfLines={1} style={styles.name}>
                  {profileDetails?.admin_name || t("")}
                </Text>
                <Text style={styles.value}>{t("Manager")}</Text>
                <Text style={styles.value}>{profileDetails?.employee_id}</Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name={"close-circle"} size={wp(6)} color={COLORS?.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Divider */}
      <View
        style={{
          height: wp(0.3),
          backgroundColor: "#D9D9D9",
          width: wp(80),
          marginTop: wp(2),
        }}
      />
    </Pressable>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  wrapper: { alignItems: "center" },
  card: {
    width: wp(75), backgroundColor: COLORS.white,
    borderRadius: wp(2), justifyContent: "center",
    paddingBottom: wp(2),
  }, loaderWrapper: {
    flexDirection: "row", alignItems: "center",
  },
  skeletonCircle: {
    width: wp(17), height: wp(17), borderRadius: wp(8.5),
    backgroundColor: "#999",
  },
  skeletonLineShort: {
    height: wp(3), width: wp(25), borderRadius: wp(1), backgroundColor: "#999",
    marginBottom: wp(1),
  }, skeletonLineLong: {
    height: wp(3), width: wp(40), borderRadius: wp(1), backgroundColor: "#999",
    marginBottom: wp(1),
  },
  topRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  }, name: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.primary, fontSize: wp(3.5), flexShrink: 1, textTransform: "capitalize",
  }, value: {
    fontFamily: "Poppins_500Medium", color: COLORS.primary, fontSize: wp(3), marginTop: wp(0.5),
  }, profileIconWrapper: {
    width: wp(17), height: wp(17), borderRadius: wp(8.5),
    justifyContent: "center", alignItems: "center", marginRight: wp(2),
  }, profileIcon: {
    width: wp(16), height: wp(16), borderRadius: wp(8.5),
    resizeMode: "cover",
  }, editIcon: {
    position: "absolute",
    top: -1, right: wp(-2), width: wp(6), height: wp(6), borderRadius: wp(3),
    backgroundColor: COLORS.primary, justifyContent: "center",
    alignItems: "center",
  }, closeButton: {
    width: wp(8),
    height: wp(8), justifyContent: "center", alignItems: "center",
    marginLeft: wp(2),
  },
});
