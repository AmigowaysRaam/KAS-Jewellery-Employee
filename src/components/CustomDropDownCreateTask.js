import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function CustomDropDownCreateTask({
    title,
    data = [],
    placeholder = "Select",
    onSelect,
    onClose,
    multiSelect = false,
    selectedItem = null,
    selected,
}) {

    const { t } = useTranslation();

    const [selectedItems, setSelectedItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (selected) {
            if (multiSelect && Array.isArray(selected)) {
                const selectedObjs = data.filter(d => selected.includes(d.label));
                setSelectedItems(selectedObjs);
            } else {
                const selectedObj = data.find(
                    d => d.value === selected || d.label === selected
                );
                if (selectedObj) setSelectedItems([selectedObj]);
                else setSelectedItems([]);
            }
        } else {
            setSelectedItems([]);
        }
    }, [selected, data]);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        return data.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, data]);

    const handleSelect = (item) => {
        if (multiSelect) {
            let updated = [...selectedItems];
            const index = selectedItems.findIndex(i => i.value === item.value);

            if (index > -1) {
                updated.splice(index, 1);
            } else {
                updated.push(item);
            }

            setSelectedItems(updated);

            if (onSelect) onSelect(updated);
        } else {
            setSelectedItems([item]);

            if (onSelect) onSelect(item);

            setModalVisible(false);

            if (onClose) onClose();
        }
    };

    const isSelected = (item) =>
        selectedItems.some(i => i.value === item.value);

    return (
        <View style={{ marginBottom: hp(2) }}>
            {title && <Text style={styles.label}>{title}</Text>}

            <Pressable
                style={styles.input}
                onPress={() => setModalVisible(true)}
            >
                <Text
                    style={{
                        color: selectedItems.length ? "#000" : "#000",
                        fontFamily: "Poppins_400Regular",
                        lineHeight: wp(6),
                        fontSize: wp(3.5),
                        textTransform: "capitalize"
                    }}
                >
                    {selectedItems.length
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

            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => {
                    setModalVisible(false);
                    if (onClose) onClose();
                }}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        setModalVisible(false);
                        if (onClose) onClose();
                    }}
                >

                    <View style={styles.modalContent}>

                        <View style={styles.searchContainer}>
                            <Icon name="search" size={20} color="#666" />

                            <TextInput
                                placeholder="Search..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={styles.searchInput}
                                placeholderTextColor="#888"
                            />

                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery("")}
                                    style={styles.clearIcon}
                                >
                                    <Icon name="close" size={20} color="#666" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <FlatList
                            data={filteredData}
                            keyExtractor={(item, index) => index.toString()}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[
                                        styles.item,
                                        isSelected(item) && styles.itemSelected
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text
                                        style={[
                                            styles.itemText,
                                            isSelected(item) && {
                                                fontWeight: "700"
                                            }
                                        ]}
                                    >
                                        {item.label}
                                    </Text>

                                    {multiSelect && isSelected(item) && (
                                        <Icon
                                            name="check"
                                            size={wp(5)}
                                            color={COLORS.primary}
                                        />
                                    )}
                                </Pressable>
                            )}
                            contentContainerStyle={{ paddingVertical: hp(6) }}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>
                                    No results found
                                </Text>
                            )}
                        />

                        {multiSelect && (
                            <Pressable
                                style={styles.doneButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    if (onClose) onClose();
                                }}
                            >
                                <Text style={styles.doneText}>Done</Text>
                            </Pressable>
                        )}
                    </View>

                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({

    label: {
        fontSize: wp(4),
        fontWeight: "600",
        marginBottom: hp(1),
        fontFamily: "Poppins_400Regular",
    },

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
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        paddingHorizontal: wp(10),
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(2),
        height: hp(80),
        width: wp(100),
        alignSelf: "center",
        position: "absolute",
        bottom: hp(7),
        borderWidth: wp(0.4), borderColor: "#CCC"
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingHorizontal: wp(3),
        paddingVertical: hp(1.8),
    },
    searchInput: {
        flex: 1,
        fontSize: wp(3.8),
        marginLeft: wp(2),
        fontFamily: "Poppins_400Regular",
        paddingVertical: hp(0.5)
    },

    item: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    itemSelected: {
        backgroundColor: COLORS?.primary + "20"
    },

    itemText: {
        fontSize: wp(4),
        fontFamily: "Poppins_400Regular",
        textTransform: "capitalize"
    },

    emptyText: {
        textAlign: "center",
        padding: hp(2),
        color: "#777"
    },

    doneButton: {
        paddingVertical: hp(1.5),
        backgroundColor: COLORS.primary,
        alignItems: "center",
        borderBottomLeftRadius: wp(2),
        borderBottomRightRadius: wp(2),
    },

    doneText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: wp(4),
    },

});