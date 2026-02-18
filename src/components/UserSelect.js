import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";

/* ===========================
   Memoized List Item (NEW)
=========================== */
const DropdownItem = React.memo(({ item, isSelected, onSelect }) => {
    return (
        <Pressable
            style={[styles.item, isSelected && styles.itemSelected]}
            onPress={() => onSelect(item)}
        >
            {item?.image && (
                <Image
                    source={{ uri: item.image }}
                    style={styles.avatar}
                />
            )}
            <View style={{ maxWidth: wp(81) }}>
                <Text style={styles.itemText}>
                    {item.label}
                </Text>
                {item.phone_number && (
                    <Text style={styles.itemText}>
                        {item.phone_number}
                    </Text>
                )}
            </View>
        </Pressable>
    );
});

export default function UserCustomDropdown({
    title,
    data = [],
    placeholder = "Select",
    onSelect,
    onClose,
    multiSelect = false,
    selected = null,
    assignType
}) {

    const [selectedItems, setSelectedItems] = useState(selected ? [selected] : []);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );

    const { t } = useTranslation();

    /* ===========================
       Keyboard Listener
    =========================== */
    useEffect(() => {
        const show = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
        const hide = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));

        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    /* ===========================
       Reset Dropdown
    =========================== */
    const resetDropdown = () => {
        setSearchText("");
        setFilteredData([]);
        setCurrentPage(1);
        setHasMore(true);
    };

    /* ===========================
       Local Data Mode
    =========================== */
    useEffect(() => {
        if (assignType !== "individual") {
            setFilteredData(data || []);
        }
        setSearchText("");
    }, [data, assignType]);

    /* ===========================
       Reset Selection on assignType change
    =========================== */
    useEffect(() => {
        setSelectedItems([]);
    }, [assignType]);

    /* ===========================
       API Fetch (FIXED)
    =========================== */
    const fetchDropDownData = useCallback(
        async (page = 1, search = "", replace = false) => {
            if (!profileDetails?.id) return;

            try {
                if (page === 1) setInitialLoading(true);
                else setLoading(true);

                const lang = await getStoredLanguage();

                const response = await fetchData(
                    "app-employee-get-team-dept-users",
                    "POST",
                    {
                        user_id: profileDetails.id,
                        lang: lang ?? "en",
                        assignType: assignType,
                        current_page: page,
                        per_page: 10,
                        search: search,
                    }
                );

                const newData = response?.data?.team_users || [];

                setFilteredData(prev =>
                    page === 1 || replace ? newData : [...prev, ...newData]
                );

                setHasMore(newData.length === 10);
                setCurrentPage(page);

            } catch (error) {
                console.error("API Error:", error);
            } finally {
                setLoading(false);
                setInitialLoading(false);
                setRefreshing(false);
            }
        },
        [profileDetails?.id, assignType]
    );

    /* ===========================
       Modal Open
    =========================== */
    useEffect(() => {
        if (!modalVisible) return;

        setCurrentPage(1);
        setHasMore(true);

        if (assignType === "individual") {
            fetchDropDownData(1, searchText, true);
        } else {
            setInitialLoading(true);
            setFilteredData(data || []);
            setTimeout(() => setInitialLoading(false), 200);
        }
    }, [modalVisible, assignType]);

    /* ===========================
       Search Handling
    =========================== */
    useEffect(() => {
        if (!modalVisible) return;

        if (assignType === "individual") {
            const delay = setTimeout(() => {
                fetchDropDownData(1, searchText, true);
            }, 500);
            return () => clearTimeout(delay);
        } else {
            if (searchText.trim() === "") {
                setFilteredData(data || []);
            } else {
                const filtered = (data || []).filter(item =>
                    item.label.toLowerCase().includes(searchText.toLowerCase())
                );
                setFilteredData(filtered);
            }
        }
    }, [searchText, modalVisible, assignType, data, fetchDropDownData]);

    /* ===========================
       Pagination (FIXED)
    =========================== */
    const handleLoadMore = useCallback(() => {
        if (loading || !hasMore || assignType !== "individual") return;
        fetchDropDownData(currentPage + 1, searchText);
    }, [loading, hasMore, assignType, currentPage, searchText, fetchDropDownData]);

    /* ===========================
       Pull to Refresh
    =========================== */
    const handleRefresh = () => {
        setRefreshing(true);
        fetchDropDownData(1, searchText, true);
    };

    /* ===========================
       Selection
    =========================== */
    const handleSelect = useCallback((item) => {
        if (multiSelect) {
            const exists = selectedItems.some(i => i.value === item.value);
            const updated = exists
                ? selectedItems.filter(i => i.value !== item.value)
                : [...selectedItems, item];

            setSelectedItems(updated);
            onSelect && onSelect(updated);
        } else {
            setSelectedItems([item]);
            onSelect && onSelect(item);
            setModalVisible(false);
            onClose && onClose();
        }
    }, [multiSelect, selectedItems, onSelect, onClose]);

    const renderItem = useCallback(
        ({ item }) => (
            <DropdownItem
                item={item}
                isSelected={selectedItems?.some(i => i.value === item.value)}
                onSelect={handleSelect}
            />
        ),
        [selectedItems, handleSelect]
    );

    return (
        <View style={{ marginBottom: hp(2) }}>
            <Text style={{ marginBottom: hp(1), fontSize: wp(4), fontFamily: "Poppins_400Regular" }}>
                {title || ""}
            </Text>

            <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
                <Text style={styles.inputText}>
                    {selectedItems?.length
                        ? multiSelect
                            ? selectedItems.map(i => i.label).join(", ")
                            : selectedItems[0].label
                        : placeholder}
                </Text>
                <Icon
                    name={modalVisible ? "arrow-drop-up" : "arrow-drop-down"}
                    size={wp(6)}
                    color="#555"
                />
            </Pressable>

            <Modal transparent visible={modalVisible} animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setModalVisible(false);
                        resetDropdown();
                        onClose && onClose();
                    }}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Icon name="arrow-back" size={wp(6)} color="#000" />
                            </Pressable>

                            <TextInput
                                style={styles.searchInput}
                                placeholder={`${t("search")}...`}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCorrect={false}
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {initialLoading ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : (
                            <FlatList
                                contentContainerStyle={{
                                    paddingBottom: hp(isKeyboardVisible ? 35 : 4)
                                }}
                                data={filteredData}
                                keyExtractor={(item, index) =>
                                    item?.id
                                        ? item.id.toString()
                                        : item?.value
                                        ? item.value.toString()
                                        : `${index}-${item?.label}`
                                }
                                renderItem={renderItem}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleRefresh}
                                        colors={[COLORS.primary]}
                                    />
                                }
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.4}
                                initialNumToRender={10}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                                removeClippedSubviews
                                ListFooterComponent={
                                    loading && assignType === "individual" ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={COLORS.primary}
                                            style={{ padding: 10 }}
                                        />
                                    ) : null
                                }
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

/* ===========================
   Styles
=========================== */
const styles = StyleSheet.create({
    input: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: wp(1),
        padding: wp(3),
        backgroundColor: "#fff",
    },
    inputText: {
        fontFamily: "Poppins_400Regular",
        fontSize: wp(3.5),
        textTransform: "capitalize"
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        paddingHorizontal: wp(5),
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(2),
        height: hp(90),
        width: wp(95),
        alignSelf: "center",
        position: "absolute",
        bottom: hp(5),
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(3),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchInput: {
        flex: 1,
        marginLeft: wp(3),
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: wp(4),
        fontSize: wp(3.5),
        padding: wp(4),
        lineHeight: wp(4),
    },
    item: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
    },
    itemSelected: {
        backgroundColor: COLORS.primary + "20",
    },
    itemText: {
        fontSize: wp(4),
        fontFamily: "Poppins_400Regular",
        textTransform: "capitalize",
        lineHeight: wp(6)
    },
    avatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        borderWidth: wp(0.3),
        borderColor: COLORS?.primary,
        marginRight: wp(3)
    }
});
