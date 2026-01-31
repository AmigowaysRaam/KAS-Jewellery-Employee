import { useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import {
    Animated, Dimensions, FlatList, Modal, RefreshControl,
    StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback,
    View
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialIcons'; // <-- Icon library
import { useSelector } from "react-redux";
import { getStoredLanguage, setAppLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { fetchData } from "./api/Api";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function LanguageMenu({ visible, onClose, onItemPress, loadData }) {
    const navigation = useNavigation();
    const [slideAnim] = useState(new Animated.Value(-SCREEN_WIDTH * 0.8));
    const [menuData, setMenuData] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const profileDetails = useSelector((state) => state?.auth?.profileDetails?.data);
    const { showToast } = useToast();
    const tokenDetail = useSelector((state) => state?.auth?.token?.data);

    /** Slide animation */
    useEffect(() => {
        // Alert.alert('kln', JSON.stringify(tokenDetail))
        // const siteDetailsData = await fetchData("app-employee-site-settings", "POST", {
        //     Authorization: `${tokenDetail?.token}`,
        //   });
        if (visible) {
            loadLanguages();
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 150,
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

    /** Load languages from API */
    const loadLanguages = async () => {
        setLoadingMenu(true);
        try {
            const lang = await getStoredLanguage();
            const response = await fetchData("app-employee-languages", "POST", {
                user_id: profileDetails?.id,
                lang: lang || "en",
            });
            if (response?.data && response.data.length > 0) {
                setMenuData(response.data);
            } else {
                setMenuData([]);
            }
        } catch (err) {
            console.error("Language API Error:", err);
            setMenuData([]);
        } finally {
            setLoadingMenu(false);
        }
    };
    const onRefresh = async () => {
        setRefreshing(true);
        await loadLanguages();
        setRefreshing(false);
    };
    /** Handle language selection */
    const handleSelect = async (item) => {

        try {
            const currentLang = await getStoredLanguage();
            const selectedLang = item.lang_code;
            setLoadingMenu(true)
            // 🚫 If same language → do nothing
            if (currentLang?.toLowerCase() === selectedLang.toLowerCase()) {
                closeMenu();
                return;
            }
            await setAppLanguage(selectedLang);
            setLang(selectedLang);
            showToast(t('Language Changed'), "success");
            // 🔁 Notify parent to reload data
            if (onItemPress) {
                onItemPress(selectedLang);
            }

            if (loadData) {
                loadData(selectedLang);
            }

            closeMenu();
        } catch (error) {
            console.error("Error selecting language:", error);
            closeMenu();
            setLoadingMenu(false)
        }
    };

    const closeMenu = () => {
        Animated.timing(slideAnim, {
            toValue: -SCREEN_WIDTH * 0.8,
            duration: 200,
            useNativeDriver: false,
        }).start(() => onClose && onClose());
    };
    const loadLanguage = async () => {
        const storedLang = await getStoredLanguage();
        setLang(storedLang);
    };

    /** Skeleton loader */
    const renderSkeleton = () => (
        <View
            style={[styles.menuItem, { backgroundColor: "#eee", height: hp(5), marginVertical: wp(1) }]}
        />
    );
    const [lang, setLang] = useState(null);
    useEffect(() => {
        loadLanguage();
    }, []);
    /** Render each language */
    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.menuItem, {
                }]}
                activeOpacity={0.7}
                onPress={() => handleSelect(item)}
            >
                {/* {lang == item.lang_code && (
                    <Icon
                        name="check"
                        size={wp(4)}
                        color={COLORS.primary}
                        style={{ marginRight: wp(2) }}
                    />
                )} */}
                <Text style={[styles.menuText, {
                    backgroundColor: lang == item.lang_code ? COLORS.primary + "20" : COLORS.white, color: lang == item.lang_code ? COLORS.primary : COLORS.black

                }]}>{`${item.name}`}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={[styles.modalWrapper, { height: SCREEN_HEIGHT }]}>
                {/* Overlay */}
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
                <Animated.View style={[styles.container, { right: slideAnim }]}>
                    {/* Close icon */}
                    <View >
                        <TouchableOpacity style={styles.closeButton} onPress={closeMenu}>
                            <Icon name="close" size={wp(5)} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        {loadingMenu ? (
                            <>
                                <View>
                                    <ActivityIndicator size={wp(4.9)} />
                                    {
                                        [...Array(2)].map((_, index) => <View key={index}>{renderSkeleton()}</View>)
                                    }
                                </View>
                            </>

                        ) : (
                            <FlatList
                                data={menuData}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderItem}
                                contentContainerStyle={{ paddingBottom: hp(1) }}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                            />
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    modalWrapper: {
        flexDirection: "row",
        alignSelf: "flex-end",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    container: {
        position: "absolute",
        top: hp(12),
        width: wp(50),
        backgroundColor: COLORS.white,
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: -3, height: 0 },
        shadowRadius: 5,
        elevation: 5,
        borderTopLeftRadius: wp(4),
        borderBottomLeftRadius: wp(4),
        maxHeight: hp(30),
        marginRight: wp(2),
    },
    closeButton: {
        position: "absolute",
        top: hp(1),
        right: wp(1),
        zIndex: 10,
        padding: wp(1),
    },
    menuItem: {
        flexDirection: "row", justifyContent: "flex-start", alignItems: "center",
        paddingVertical: hp(1),
        paddingHorizontal: wp(2),
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
    },
    menuText: {
        fontSize: wp(4),
        fontFamily: "Poppins_500Medium",
        textTransform: "capitalize",
        padding: hp(0.5), borderRadius: wp(2), paddingHorizontal: hp(2)
    },
});