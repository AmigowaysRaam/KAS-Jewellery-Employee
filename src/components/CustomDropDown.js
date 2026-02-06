import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function CustomDropdown({
    title,
    data = [],
    placeholder = "Select",
    onSelect,
    onClose,
    multiSelect = false,
    selectedItem = null,
    selected,
}) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        if (selected) {
            // Alert.alert("Selected prop is not null", JSON.stringify(selected));
            if (multiSelect && Array.isArray(selected)) {
                const selectedObjs = data.filter(d => selected.includes(d.label));
                setSelectedItems(selectedObjs);
            } else {
                const selectedObj = data.find(d => d.value === selected || d.label === selected);
                if (selectedObj) setSelectedItems([selectedObj]);
                else setSelectedItems([]); // important: clear if no match
            }
        } else {
            setSelectedItems([]); // clear selection if selected is null
        }
    }, [selected, data]);

    const { t } = useTranslation()

    const handleSelect = (item) => {
        if (multiSelect) {
            let updated = [...selectedItems];
            const index = selectedItems.findIndex(i => i.value === item.value);
            if (index > -1) {
                updated.splice(index, 1); // remove
            } else {
                updated.push(item); // add
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

    const isSelected = (item) => selectedItems.some(i => i.value === item.value);

    return (
        <View style={{ marginBottom: hp(2) }}>
            {/* Label */}
            {title && <Text style={styles.label}>{title}</Text>}
            {/* Selected Value / Placeholder */}
            <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
                <Text style={{ color: selectedItems.length ? "#000" : "#000", fontFamily: "Poppins_400Regular", lineHeight: wp(6), fontSize: wp(3.5), textTransform: "capitalize" }}>
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
            {/* Modal for Dropdown Items */}
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
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[styles.item, isSelected(item) && styles.itemSelected]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={[styles.itemText, isSelected(item) && {
                                        fontWeight: "700",
                                    }]}>
                                        {item.label}
                                        {/* {item.label} */}
                                    </Text>
                                    {multiSelect && isSelected(item) && (
                                        <Icon name="check" size={wp(5)} color={COLORS.primary} />
                                    )}
                                </Pressable>
                            )}
                            contentContainerStyle={{ paddingVertical: hp(1) }}
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
        fontSize: wp(4), fontWeight: "600", marginBottom: hp(1),
        fontFamily: "Poppins_400Regular",
    },
    input: {
        flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
        borderWidth: 1, borderColor: "#CCC", borderRadius: wp(1),
        padding: wp(3),
        backgroundColor: "#fff",
    }, modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        paddingHorizontal: wp(10),
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(2),
        maxHeight: hp(50),
        width: wp(95),
        alignSelf: "center",
        position: "absolute",
        bottom: hp(5),
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
