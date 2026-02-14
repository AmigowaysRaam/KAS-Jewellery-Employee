import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import {
    Animated, Dimensions, FlatList, Image, Modal, RefreshControl,
    StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback,
    View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import ProfileCard from "./profileCard";
import { setSidebarMenu } from "./store/store";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function SideMenu({ visible, onClose, onItemPress }) {
    const [slideAnim] = useState(new Animated.Value(-SCREEN_WIDTH * 0.8));
    const [menuData, setMenuData] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const SidebarMenu = useSelector((state) => state?.auth?.SidebarMenu);
    const [pendingLogout, setPendingLogout] = useState(false);

    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );
    const dispatch = useDispatch();
    const navigation = useNavigation();
    useEffect(() => {
        if (visible) {
            // Load menu if not already loaded
            if (!SidebarMenu || SidebarMenu.length === 0) {
                loadSideMenu();
            } else {
                setMenuData(SidebarMenu);
            }
            // Slide in quickly (instant or very fast)
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300, // faster open (100ms)
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -SCREEN_WIDTH * 0.8,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    }, [visible]);
    /* FETCH SIDE MENU DATA */
    const loadSideMenu = async () => {
        setLoadingMenu(true);
        const lang = await getStoredLanguage();

        try {
            const response = await fetchData("app-employee-sidebar-menu", "POST", {
                user_id: profileDetails?.id,
                lang: lang ? lang : "en",
            });
            if (response?.data && response.data.length > 0) {
                setMenuData(response.data);
                dispatch(setSidebarMenu(response.data));
            } else {
                setMenuData([]); // fallback empty menu
            }
        } catch (err) {
            // console.error("Side Menu API Error:", err);
            setMenuData([]); // fallback empty menu
        } finally {
            setLoadingMenu(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await loadSideMenu();
        setRefreshing(false);
    };
    const handleClose = (label) => {
        if (label === "Logout") {
            setPendingLogout(true);
        }
        Animated.timing(slideAnim, {
            toValue: -SCREEN_WIDTH * 0.8,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            onClose && onClose();

            // 🔥 Open logout modal AFTER side menu closes
            if (label === "Logout") {
                setLogoutModalVisible(true);
                setPendingLogout(false);
            }
        });
    };

    const sidebarIcons = {
        my_account: require("../../assets/MyAccount.png"),
        my_task: require("../../assets/MyTaskside.png"),
        my_assign_task: require("../../assets/MyAssignTask.png"),
        notification: require("../../assets/NotificationSideb.png"),
        our_stores: require("../../assets/OurStoresSid.png"),
        settings: require("../../assets/Settings.png"),
        terms_conditions: require("../../assets/TermsandConditions.png"),
        privacy_policy: require("../../assets/PrivacyPolicy.png"),
        ChangeMpin: require("../../assets/ChangeMpin.png"),
    };
    const confirmLogout = async () => {
        setLogoutModalVisible(false);
        await AsyncStorage.clear();
        navigation.reset({
            index: 0,
            routes: [{ name: "MobileLogin" }],
        });
    };
    const cancelLogout = () => {
        setLogoutModalVisible(false);
    };
    const handleNavigation = (key) => {
        if (key && key == "my_task") {
            navigation.navigate("MyTaskListScreen", { status: null });
        }
        if (key && key == "my_assign_task") {
            navigation.navigate('Assign Task');
        }
        if (key && key == "notification") {
            navigation.navigate('Notification');
        }
        if (key && key == "our_stores") {
            navigation.navigate('OurStoreScreen');
        }
        if (key && key == "terms_conditions") {
            navigation.navigate('TermsScreen');
        }
        if (key && key == "privacy_policy") {
            navigation.navigate('PrivacyPolicyScreen');
        }
        if (key && key == "settings") {
            navigation.navigate('SettingsScreen');
        }
        if (key && key == "my_account") {
            navigation.navigate('My Account');
        }
        if (key && key == "ChangeMpin") {
            navigation.navigate('ChangeMpin');
        }
    }
    const renderMenuItem = ({ item }) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => {
                handleNavigation(item?.key);
                handleClose(item.key);
            }}
        >
            <Image tintColor={"#000"} source={sidebarIcons[item.key]} style={{ width: wp(6), height: wp(6), marginRight: hp(2) }} />
            <Text style={styles.menuText}>
                {item?.key?.replace(/_/g, ' ')}
            </Text>
        </TouchableOpacity>
    );
    const renderSkeleton = () => (
        <View
            style={[
                styles.menuItem,
                { backgroundColor: "#eee", height: hp(5), marginVertical: wp(1) },
            ]}
        />
    );
    return (
        <>
            <Modal transparent visible={visible} animationType="none">
                <View style={[styles.modalWrapper, { height: SCREEN_HEIGHT }]}>
                    {/* Overlay */}
                    <TouchableWithoutFeedback onPress={handleClose}>
                        <View style={styles.overlay} />
                    </TouchableWithoutFeedback>

                    {/* Side Menu */}
                    <Animated.View style={[styles.container, { left: slideAnim }]}>
                        <ProfileCard onClose={handleClose} loadingMenu={loadingMenu} />
                        {loadingMenu ? (
                            <View>
                                {[...Array(10)].map((_, index) => (
                                    <View key={index}>{renderSkeleton()}</View>
                                ))}
                            </View>
                        ) : (
                            <FlatList
                                data={menuData}
                                keyExtractor={(item) => item.key.toString()}
                                renderItem={renderMenuItem}
                                contentContainerStyle={{ paddingBottom: hp(10), paddingTop: hp(1), paddingHorizontal: wp(1) }} // space for footer
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                            />
                        )}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center" }}
                                onPress={() => handleClose("Logout")}
                            >
                                <Text style={[styles.footerText, { fontSize: wp(4), marginRight: wp(2) }]}>
                                    {t('logout')}
                                </Text>
                                <Icon name={'log-out-outline'} size={wp(5)} color={COLORS?.black} />
                            </TouchableOpacity>
                            <Text style={styles.footerText}>
                                KAS ({Constants?.manifest?.version})
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
            {/* Logout Confirmation Modal */}
            <Modal transparent visible={logoutModalVisible} animationType="fade">
                <View style={styles.logoutModalOverlay}>
                    <View style={styles.logoutModalContainer}>
                        <Text style={styles.logoutTitle}>{`${t('logout')} ? `}</Text>
                        <Text style={styles.logoutMessage}>{t('logout_confirmation')}</Text>
                        <View style={styles.logoutButtons}>
                            <TouchableOpacity
                                style={[styles.logoutBtn, { backgroundColor: COLORS.gray }]}
                                onPress={cancelLogout}
                            >
                                <Text style={styles.logoutBtnText}>{t('cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.logoutBtn, { backgroundColor: COLORS.primary }]}
                                onPress={confirmLogout}
                            >
                                <Text style={[styles.logoutBtnText, {
                                    color: COLORS.white
                                }]}>{t('logout')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    modalWrapper: { flex: 1, flexDirection: "row" }, overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
    container: {
        position: "absolute", top: wp(9),
        bottom: 0, width: SCREEN_WIDTH * 0.8, backgroundColor: COLORS.white,
        paddingVertical: hp(2.5), paddingHorizontal: wp(3),
        shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: { width: 3, height: 0 }, shadowRadius: 5, elevation: 5,
    },
    menuItem: { paddingVertical: hp(1.5), flexDirection: "row", alignItems: "center" },
    menuText: { fontSize: wp(3.5), fontFamily: "Poppins_500Medium", color: "#333", textTransform: "capitalize" },
    footer: {
        position: "absolute", bottom: hp(2), left: 0, width: wp(80), borderTopWidth: 1, borderTopColor: "#CCC", backgroundColor: COLORS.white, alignItems: "center",
        justifyContent: "space-between", flexDirection: "row",
        paddingHorizontal: hp(2.5), height: hp(9),
    }, footerText: { fontSize: wp(3), fontFamily: "Poppins_500Medium", color: "#333" },
    logoutModalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center",
    },
    logoutModalContainer: {
        width: wp(80), backgroundColor: "#fff", borderRadius: wp(2),
        padding: wp(5), alignItems: "center",
    },
    logoutTitle: { fontSize: wp(5), fontFamily: "Poppins_600SemiBold", marginBottom: hp(1) },
    logoutMessage: { fontSize: wp(3.5), fontFamily: "Poppins_400Regular", marginBottom: hp(3), textAlign: "center" },
    logoutButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
    logoutBtn: { flex: 1, paddingVertical: hp(0.8), marginHorizontal: wp(1), borderRadius: wp(1), alignItems: "center" },
    logoutBtnText: { color: COLORS?.primary, fontFamily: "Poppins_600SemiBold", fontSize: wp(3.9) },
});