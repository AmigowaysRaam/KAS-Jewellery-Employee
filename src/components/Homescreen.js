import Constants from 'expo-constants';
import React, { useEffect, useState } from "react";
import {
  RefreshControl, ScrollView,
  StyleSheet, Text, View
} from "react-native";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import HomeSkeleton from "../../homeSkelton";
import { fetchData } from "./api/Api";
import AssignedTask from "./AssignedTask";
import Banner from "./Banner";
import Header from "./Header";
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
  const siteDetails = useSelector((state) => state.auth?.siteDetails?.data[0]);
  const profileDetails = useSelector((state) => state?.auth?.profileDetails?.data);
  useEffect(() => {
    getStoredLanguage().then((storedLang) => {
      setLang(storedLang || "en");
    });
  }, []);
  const [lang, setLang] = useState(null);
  const fetchHomepageData = async () => {
    const lang = await getStoredLanguage();

    if (!profileDetails?.id) return;
    // Alert.alert(JSON.stringify(bId))

    const packageName = Constants.manifest?.android?.package || Constants.manifest?.ios?.bundleIdentifier;
    console.log(packageName);
    try {
      if (!refreshing) setLoading(true);
      const response = await fetchData(
        "app-employee-homepage",
        "POST",
        { user_id: profileDetails.id, lang: lang ? lang : "en" },
      );
      if (response?.text === "Success" || response?.text === "Fetched successfully") {
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
  useEffect(() => {
    fetchHomepageData();
  }, []);
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
            colors={[COLORS.primary]} // spinner color
            tintColor={COLORS.primary} // iOS spinner color
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
            <Text>No Data Available</Text>
          </View>
        )}
      </ScrollView>
      <SideMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <LanguageMenu
        visible={langMenuMOdal}
        onClose={() => setOpenLangMenu(false)}
        loadData={(newLang) => {
          setLang(newLang);        // state in HomeScreen
          fetchHomepageData();     // reload ONLY when changed
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  }, scrollContainer: {
    flex: 1,
    alignSelf: "center",
  }, loaderContainer: {
    flex: 1, height: 300, justifyContent: "center",
    alignItems: "center",
  }, loaderText: {
    marginTop: 10, color: COLORS.primary, fontSize: 16,
    fontWeight: "500",
  },
});