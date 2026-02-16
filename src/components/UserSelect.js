import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList, Image, Modal, Pressable,
    RefreshControl,
    StyleSheet, Text,
    TextInput, TouchableOpacity, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { getStoredLanguage } from "../../app/i18ns";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";

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
    const [loading, setLoading] = useState(false); // pagination loading
    const [initialLoading, setInitialLoading] = useState(false); // modal open loader
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // pull-to-refresh
    const onEndReachedCalledDuringMomentum = useRef(false);

    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );
    const { t } = useTranslation();

    const resetDropdown = () => {
        setSearchText("");
        setFilteredData([]);
        setCurrentPage(1);
        setHasMore(true);
    };

    // Local data for non-individual type
    useEffect(() => {
        if (assignType !== "individual") {
            setFilteredData(data || []);
        }
        setSearchText("");
    }, [data, assignType]);

    // Reset selection on assignType change
    useEffect(() => {
        setSelectedItems([]);
    }, [assignType]);

    // API fetch
    const fetchDropDownData = useCallback(async (page = 1, search = "", replace = false) => {
        if (!profileDetails?.id || loading || !hasMore) return;
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

            if (replace || page === 1) setFilteredData(newData);
            else setFilteredData(prev => [...prev, ...newData]);

            if (newData.length < 10) setHasMore(false);
            else setHasMore(true);

        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            setRefreshing(false);
        }
    }, [profileDetails?.id, assignType, loading, hasMore]);
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

    // Search debounce
    useEffect(() => {
        if (!modalVisible) return;

        if (assignType === "individual") {
            const delay = setTimeout(() => {
                setCurrentPage(1);
                setHasMore(true);
                fetchDropDownData(1, searchText, true);
            }, 500);

            return () => clearTimeout(delay);
        } else {
            if (searchText) {
                const filtered = data.filter(item =>
                    item.label.toLowerCase().includes(searchText.toLowerCase())
                );
                setFilteredData(filtered);
            } else {
                setFilteredData(data);
            }
        }
    }, [searchText, modalVisible]);

    // Pagination
    const handleLoadMore = () => {
        if (!loading && hasMore && assignType === "individual") {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchDropDownData(nextPage, searchText);
        }
    };

    // Pull-to-refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
        fetchDropDownData(1, searchText, true);
    };

    // Selection
    const handleSelect = (item) => {
        if (multiSelect) {
            const exists = selectedItems.some(i => i.value === item.value);
            let updated = exists ? selectedItems.filter(i => i.value !== item.value) : [...selectedItems, item];
            setSelectedItems(updated);
            onSelect && onSelect(updated);
        } else {
            setSelectedItems([item]);
            onSelect && onSelect(item);
            setModalVisible(false);
            onClose && onClose();
        }
    };
    const isSelected = (item) =>
        selectedItems?.some(i => i.value === item.value);
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
                                style={[styles.searchInput, {
                                }]}
                                placeholder={`${t("search")}...`}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCorrect={false}
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                            {
                                searchText != ''
                                &&
                                <Pressable style={{ position: "absolute", right: hp(2.5) }}
                                    onPress={() => {
                                        setSearchText('');
                                        setCurrentPage(1);
                                        setHasMore(true);
                                        fetchDropDownData(1, '', true);
                                    }}
                                >
                                    <Icon name="close" size={wp(6)} color="#555" />
                                </Pressable>
                            }
                        </View>
                        {initialLoading ? (
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                <ActivityIndicator size="large" color={COLORS.primary} />
                            </View>
                        ) : (
                            <FlatList
                                data={filteredData}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={[styles.item, isSelected(item) && styles.itemSelected]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        {item?.image && (
                                            <Image
                                                source={{ uri: item.image }}
                                                style={{
                                                    width: wp(12),
                                                    height: wp(12),
                                                    borderRadius: wp(6),
                                                    borderWidth: wp(0.3),
                                                    borderColor: COLORS?.primary,
                                                    marginRight: wp(3)
                                                }}
                                            />
                                        )}
                                        <View style={{ maxWidth: wp(81) }}>
                                            <Text style={styles.itemText}>
                                                {item.label}
                                            </Text>
                                            {
                                                item.phone_number && (
                                                    <Text style={styles.itemText}>
                                                        {item.phone_number}
                                                    </Text>
                                                )
                                            }
                                        </View>

                                    </Pressable>
                                )}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleRefresh}
                                        colors={[COLORS.primary]}
                                    />
                                }
                                onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }}
                                onEndReached={() => {
                                    if (!onEndReachedCalledDuringMomentum.current) {
                                        handleLoadMore();
                                        onEndReachedCalledDuringMomentum.current = true;
                                    }
                                }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={
                                    !initialLoading && (
                                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: hp(10) }}>
                                            <Icon name="search-off" size={wp(20)} color="#444" />
                                            <Text style={{ fontSize: wp(4), color: "#555" }}>
                                                {t("no_data_found")}
                                            </Text>
                                        </View>
                                    )
                                }
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
        alignItems: "center",
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
        textTransform: "capitalize", lineHeight: wp(6)
    },
});
