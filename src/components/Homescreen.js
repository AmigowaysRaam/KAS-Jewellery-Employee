import messaging from "@react-native-firebase/messaging";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import HomeSkeleton from "../../homeSkelton";
import { fetchData } from "./api/Api";
import AssignedTask from "./AssignedTask";
import Banner from "./Banner";
import Header from "./Header";
import InAppNotificationModal from "./InappNotification";
import LanguageMenu from "./LanguageMenu";
import MyTask from "./MyTask";
import SideMenu from "./Sidemenu";
import TaskRow from "./TaskRow";
export default function Homescreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [langMenuMOdal, setOpenLangMenu] = useState(false);
  const [homepageData, setHomepageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState(null);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [notifData, setNotifData] = useState(null);

  const { t } = useTranslation();
  const siteDetails = useSelector(
    (state) => state.auth?.siteDetails?.data[0]
  );
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  /* 🌐 Load stored language */
  useEffect(() => {
    getStoredLanguage().then((storedLang) => {
      setLang(storedLang || "en");
    });
  }, []);

  /* 📡 API CALL */
  const fetchHomepageData = async () => {
    if (!profileDetails?.id) return;

    try {
      if (!refreshing) setLoading(true);

      const response = await fetchData(
        "app-employee-homepage",
        "POST",
        {
          user_id: profileDetails.id,
          lang: lang || "en",
        }
      );
      if (
        response?.text === "Success" ||
        response?.text === "Fetched successfully"
      ) {
        setHomepageData(response.data);
      } else {
        console.warn("API returned failure:", response);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  /* ✅ INITIAL LOAD (ONCE) */
  useEffect(() => {
    fetchHomepageData();
  }, [profileDetails?.id, lang]);
  /* 🔔 RELOAD API WHEN NOTIFICATION ARRIVES */
  useEffect(() => {
    // Foreground notification
    const unsubscribeOnMessage = messaging().onMessage(async (notification) => {
      console.log("🔔 Foreground notification received");
      setNotifData({
        title: notification?.notification?.title,
        body: notification?.notification?.body,
        data: notification?.data,
      });
      setNotifModalVisible(true);
      // fetchHomepageData();
      // console.log(JSON.stringify(notification));
    });
    return () => {
      unsubscribeOnMessage();
    };
  }, []);
  /* 🔄 Pull to refresh */
  const onRefresh = () => {
    setRefreshing(true);
    fetchHomepageData();
  };
  return (
    <View style={styles.container}>
      <Header
        openMenu={() => setIsMenuOpen(!isMenuOpen)}
        headerL={siteDetails?.["header-logo"]}
        openLanguageMenu={() => setOpenLangMenu(true)}
        notificationCount={homepageData?.notification_count}
      />
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor="#f2f2f2"
          />
        }
      >
        {loading ? (
          <HomeSkeleton />
        ) : homepageData ? (
          <>
            <Banner homepageData={homepageData} />
            <TaskRow homepageData={homepageData} />
            <MyTask homepageData={homepageData} />
            <AssignedTask homepageData={homepageData} />
          </>
        ) : (
          <View style={styles.loaderContainer}>
            <Text>{t('no_data')}</Text>
          </View>
        )}
      </ScrollView>
      <SideMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <LanguageMenu
        visible={langMenuMOdal}
        onClose={() => setOpenLangMenu(false)}
        loadData={(newLang) => {
          setLang(newLang);
          fetchHomepageData();
        }}
      />
      <InAppNotificationModal
        visible={notifModalVisible}
        title={notifData?.title}
        message={notifData?.body}
        onClose={() => setNotifModalVisible(false)}
        onPress={() => {
          // Optional: navigate based on notification data
          console.log("Notification clicked:", notifData?.data);
        }}
      />

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    alignSelf: "center",
  },
  loaderContainer: {
    flex: 1,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
});
