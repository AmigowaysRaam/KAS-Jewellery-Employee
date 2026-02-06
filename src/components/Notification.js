import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Animated, Easing, FlatList, Image, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api";
export default function Notification() {
  const navigation = useNavigation();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const { t } = useTranslation();
  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

  const fetchNotifications = async (pageNo = 1, isRefresh = false) => {
    if (loading) return;
    if (!hasMore && !isRefresh) return;
    if (!profileDetails?.id) return;
    setLoading(true);
    try {
      const response = await fetchData(
        "app-employee-list-notifications",
        "POST",
        {
          user_id: profileDetails.id,
          per_page: 10,
          current_page: pageNo,
        }
      );
      if (response?.success) {
        const data = response?.data?.notifications || [];
        setNotifications((prev) =>
          pageNo === 1 ? data : [...prev, ...data]
        );
        setHasMore(data.length === 10);
        setPage(pageNo);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Notification API Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  const loadMore = () => {
    if (!onEndReachedCalledDuringMomentum.current && hasMore && !loading) {
      fetchNotifications(page + 1);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  /* ---------- RENDER NOTIFICATION ---------- */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationContainer,
        !item.is_read && styles.unread,
      ]}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        {/* <Text style={styles.ttle}>{JSON.stringify(item)}</Text> */}
        <Text style={styles.message}>{item.description}</Text>
        <Text style={styles.timestamp}>
          {dayjs(item.created_at).format("DD/MM/YYYY hh:mm A")}
        </Text>
      </View>

      {!item.is_read && (
        <View style={styles.unreadDot}>
          <Image
            source={item?.image}
            style={{
              width: wp(10),
              height: wp(10),
              borderRadius: wp(1),
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  /* ---------- ANIMATED SKELETON ---------- */
  const SkeletonItem = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    return (
      <Animated.View style={[styles.skeletonContainer, { opacity }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonText} />
          <View style={styles.skeletonSmallText} />
        </View>
        <View style={styles.skeletonImage} />
      </Animated.View>
    );
  };

  /* ---------- FOOTER LOADER ---------- */
  const renderFooter = () =>
    loading && hasMore && !initialLoading ? (
      <ActivityIndicator
        size="small"
        color={COLORS.primary}
        style={{ marginVertical: hp(2) }}
      />
    ) : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CommonHeader
        title={t("notifications")}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {initialLoading ? (
        <View style={{ padding: wp(4) }}>
          {[...Array(6)].map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ padding: wp(4) }}
          ItemSeparatorComponent={() => <View style={{ height: hp(1), }} />}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setHasMore(true);
            setPage(1);
            fetchNotifications(1, true);
          }}

          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}

          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !loading && (
              <Text style={{
                textAlign: "center", marginTop: hp(10),
                fontFamily: 'Poppins_600SemiBold'
              }}>
                {t("no_notifications")}
              </Text>
            )
          }
        />
      )}
    </View>
  );
}
/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  notificationContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: wp(4),
    borderRadius: wp(2),
    alignItems: "center",
    minHeight: hp(10),
  },
  unread: {
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(0.5),
    color: COLORS.black,
    fontFamily: 'Poppins_600SemiBold'
  },
  message: {
    fontSize: wp(3.2),
    color: COLORS.gray,
    fontFamily: 'Poppins_400Regular'

  },
  timestamp: {
    fontSize: wp(3),
    color: COLORS.gray,
    marginTop: hp(0.5),
  },
  unreadDot: {
    marginLeft: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },

  /* ---------- SKELETON STYLES ---------- */
  skeletonContainer: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: wp(4),
    borderRadius: wp(2),
    marginBottom: hp(1),
    alignItems: "center",
  },
  skeletonTitle: {
    height: hp(2),
    width: "60%",
    backgroundColor: COLORS?.primary + "40",
    borderRadius: wp(1),
    marginBottom: hp(1),
  },
  skeletonText: {
    height: hp(1.8),
    width: "80%",
    backgroundColor: COLORS?.primary + "40",
    borderRadius: wp(1),
    marginBottom: hp(1),
  },
  skeletonSmallText: {
    height: hp(1.5),
    width: "40%",
    backgroundColor: COLORS?.primary + "40",
    borderRadius: wp(1),
  },
  skeletonImage: {
    width: wp(10),
    height: wp(10),
    backgroundColor: COLORS?.primary + "40",
    borderRadius: wp(1),
    marginLeft: wp(2),
  },
});
