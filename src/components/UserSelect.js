import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    Pressable,
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
const DropdownItem = React.memo(({ item, isSelected, onSelect, showCheckbox }) => {
    return (
        <Pressable
            style={[
                styles.item,
                isSelected && styles.itemSelected,
                {
                    alignItems: !showCheckbox ? "flex-start" : "center",
                    borderWidth: showCheckbox ? 1 : 0,
                }
            ]}
            onPress={() => onSelect(item)}
        >
            {showCheckbox && (
                <Icon
                    name={isSelected ? "check-box" : "check-box-outline-blank"}
                    size={wp(5)}
                    color={isSelected ? COLORS.primary : "#aaa"}
                    style={styles.checkbox}
                />
            )}
            {item?.image && (
                <Image source={{ uri: item.image }} style={styles.avatar} />
            )}
            <View style={{ alignItems: "center" }}>
                <Text style={styles.itemText}>{item.label}</Text>
                {item.phone_number && (
                    <Text style={styles.subText}>{item.phone_number}</Text>
                )}
            </View>
        </Pressable>
    );
});
function UserCustomDropdown({
    title, data = [], placeholder = "Select",
    onSelect, onClose, multiSelect = false,
    selected = null, assignType }) {
    const { t } = useTranslation();
    const profileDetails = useSelector(
        (state) => state?.auth?.profileDetails?.data
    );
    const isMultiMode = multiSelect && assignType === "individual";
    const [selectedItems, setSelectedItems] = useState(
        isMultiMode
            ? (Array.isArray(selected) ? selected : [])
            : selected
                ? [selected]
                : []
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        if (modalVisible) {
            if (isMultiMode) {
                setSelectedItems(Array.isArray(selected) ? selected : []);
            } else {
                setSelectedItems(selected ? [selected] : []);
            }
        }
    }, [modalVisible]);
    const fetchDropDownData = useCallback(
        async (page = 1, search = "", replace = false) => {
            if (!profileDetails?.id) return;

            try {
                page === 1 ? setInitialLoading(true) : setLoading(true);

                const lang = await getStoredLanguage();

                const response = await fetchData(
                    "app-employee-get-team-dept-users",
                    "POST",
                    {
                        user_id: profileDetails.id,
                        lang: lang ?? "en",
                        assignType,
                        current_page: page,
                        per_page: 10,
                        search,
                    }
                );
                const newData = response?.data?.team_users || [];
                setFilteredData(prev =>
                    page === 1 || replace ? newData : [...prev, ...newData]
                );
                setHasMore(newData.length === 10);
                setCurrentPage(page);

            } catch (error) {
                console.log("API Error:", error);
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        },
        [profileDetails?.id, assignType]
    );
    useEffect(() => {
        if (!modalVisible) return;
        if (assignType === "individual") {
            fetchDropDownData(1, "", true);
        } else {
            setFilteredData(data || []);
        }
    }, [modalVisible]);
    useEffect(() => {
        setSelectedItems([]);
        setSearchText("");
        setFilteredData([]);
        setCurrentPage(1);
        setHasMore(true);
    }, [assignType]);

    useEffect(() => {
        if (!modalVisible) return;
        if (assignType === "individual") {
            const delay = setTimeout(() => {
                fetchDropDownData(1, searchText, true);
            }, 400);
            return () => clearTimeout(delay);
        } else {
            const filtered = (data || []).filter(item =>
                item.label.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredData(filtered);
        }
    }, [searchText]);

    const handleSelect = useCallback((item) => {
        if (isMultiMode) {
            setSelectedItems(prev => {
                const exists = prev.some(i => i.value === item.value);
                return exists
                    ? prev.filter(i => i.value !== item.value)
                    : [...prev, item];
            });
        } else {
            setSelectedItems([item]);
            onSelect && onSelect(item);
            setModalVisible(false);
            onClose && onClose();
        }
    }, [isMultiMode]);

    const renderItem = ({ item }) => (
        <DropdownItem
            item={item}
            showCheckbox={isMultiMode}
            isSelected={selectedItems.some(i => i.value === item.value)}
            onSelect={handleSelect}
        />
    );

    return (
        <View style={{ marginBottom: hp(2) }}>
            <Text style={{ marginBottom: hp(1), fontSize: wp(4) }}>
                {title}
            </Text>
            <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
                <Text style={styles.inputText}>
                    {selectedItems?.length
                        ? isMultiMode
                            ? `${selectedItems.length} selected`
                            : selectedItems[0]?.label
                        : placeholder}
                </Text>
                <Icon name="arrow-drop-down" size={wp(6)} />
            </Pressable>
            <Modal transparent visible={modalVisible} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={[styles.modalHeader, {
                            flexDirection: "row", alignItems: "center"
                        }]}>
                            <Pressable
                                style={{ marginRight: wp(2) }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Icon name="chevron-left" size={wp(8)} color="#111" />
                            </Pressable>
                            <Text style={{ fontSize: wp(4.5), lineHeight: hp(6), fontFamily: "Poppins_600SemiBold" }}>
                                {title}
                            </Text>
                        </View>
                        <View style={styles.searchContainer}>
                            <TextInput
                                placeholderTextColor="#555"
                                style={styles.searchInput}
                                placeholder={`${t("search")}...`}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            <Pressable
                                style={styles.closeIcon}
                                onPress={() => setSearchText('')}
                            >
                                <Icon name="close" size={wp(5)} color="#555" />
                            </Pressable>
                        </View>
                        <View style={{
                            flex: 1,
                            // height: hp(50)
                        }}>
                            {initialLoading ? (
                                <ActivityIndicator
                                    size="large"
                                    color={COLORS.primary}
                                    style={{ marginTop: hp(5) }}
                                />
                            ) : (
                                <FlatList
                                    key={assignType === "individual" ? "GRID" : "LIST"}
                                    data={filteredData}
                                    numColumns={assignType === "individual" ? 2 : 1}
                                    columnWrapperStyle={
                                        assignType === "individual"
                                            ? { justifyContent: "space-between" }
                                            : undefined
                                    }
                                    keyExtractor={(item, index) =>
                                        item?.value?.toString() || index.toString()
                                    }
                                    renderItem={renderItem}
                                    contentContainerStyle={{
                                        paddingBottom: isMultiMode ? hp(18) : hp(4),
                                        // height: "80%",
                                    }}
                                    ListEmptyComponent={<>
                                        <Text style={{ fontSize: wp(4.5), lineHeight: hp(6), fontFamily: "Poppins_600SemiBold", alignSelf: "center" }}>
                                            {t('no_data')}
                                        </Text>
                                    </>}
                                    onEndReachedThreshold={0.5} // fetch when 50% from bottom
                                    onEndReached={() => {
                                        if (!loading && hasMore && assignType === "individual") {
                                            fetchDropDownData(currentPage + 1, searchText);
                                        }
                                    }}
                                    ListFooterComponent={
                                        loading ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={COLORS.primary}
                                                style={{ marginVertical: hp(2) }}
                                            />
                                        ) : null
                                    }
                                />
                            )}
                        </View>
                        {isMultiMode && (
                            <View style={styles.fixedButtonContainer}>
                                <TouchableOpacity
                                    style={styles.doneBtn}
                                    onPress={() => {
                                        onSelect && onSelect(selectedItems);
                                        setModalVisible(false);
                                        onClose && onClose();
                                    }}
                                >
                                    <Text style={styles.doneText}>
                                        {t("done")} ({selectedItems.length})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}
export default React.memo(UserCustomDropdown);
const styles = StyleSheet.create({
    input: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", borderWidth: 1,
        borderColor: "#ddd", borderRadius: 8,
        padding: wp(3), backgroundColor: "#fff"
    },
    inputText: {
        fontSize: wp(3.8),
        color: "#333"
    }, modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
        //  justifyContent: "flex-end",
        justifyContent: "center"
    },
    modalContent: {
        backgroundColor: "#fff", height: hp(85), width: wp(95),
        alignSelf: "center",
        borderRadius: wp(3), paddingVertical: wp(1), paddingHorizontal: wp(4),
    },
    modalHeader: { marginBottom: hp(0.5), },
    searchContainer: {
        position: "relative",
        marginBottom: hp(2),
    }, searchInput: {
        borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingVertical: wp(3),
        paddingHorizontal: wp(3), paddingRight: wp(10),
        fontFamily: "Poppins_600SemiBold"
    },
    closeIcon: {
        position: "absolute", right: wp(3),
        top: "50%", marginTop: -wp(3),
    },
    item: {
        flex: 1, marginBottom: hp(1.5),
        marginHorizontal: wp(1), padding: wp(3),
        borderColor: "#eee", borderRadius: 10,
        alignItems: "center",
    }, itemSelected: {
        backgroundColor: COLORS.primary + "15"
    },
    checkbox: {
        position: "absolute", top: wp(2), right: wp(2),
    }, avatar: {
        width: wp(14), height: wp(14), borderRadius: wp(7),
        marginBottom: hp(1), borderColor: COLORS.primary, borderWidth: wp(0.5),
    }, itemText: {
        fontFamily: "Poppins_600SemiBold",
        textTransform: "capitalize"
    }, subText: { fontFamily: "Poppins_600SemiBold" },

    fixedButtonContainer: {
        position: "absolute", bottom: hp(2),
        left: wp(4), right: wp(4),
    },
    doneBtn: {
        backgroundColor: COLORS.primary, padding: wp(4), borderRadius: 12, alignItems: "center",
    },
    doneText: {
        color: "#fff", fontSize: wp(4), fontFamily: "Poppins_600SemiBold"
    }
});