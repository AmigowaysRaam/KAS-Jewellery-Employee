import React, { useEffect, useState } from "react";
import {
    FlatList, Modal, Pressable, StyleSheet,
    Text, TouchableOpacity, View
} from "react-native";
import { Icon } from "react-native-elements";
import { hp, wp } from "../../app/resources/dimensions";

export default function TaskPriority({
    title, data = [], placeholder = "Select",
    onSelect, onClose, multiSelect = false,
    selected, }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const getPriorityConfig = (level) => {
        // Alert.alert("Priority Level", level);
        switch (level) {
            case "Critical":
                return { color: "#D32F2F", icon: "alert-octagon" };   // Strong, deep red
            case "High":
                return { color: "#FFB300", icon: "alert-circle" };    // Bright red
            case "Medium":
                return { color: "#1358d0", icon: "alert-triangle" };  // Amber/orange, more modern
            case "Low":
                return { color: "#43A047", icon: "check-circle" };    // Fresh green
            default:
                return { color: "#757575", icon: "info" };            // Neutral gray
        }
    };

    useEffect(() => {
        if (selected) {

            const selectedObj = data.find(d => d.value === selected || d.label === selected);
            if (selectedObj) setSelectedItems([selectedObj]);
            else setSelectedItems([]); // important: clear if no match
        } else {
            setSelectedItems([]); // clear selection if selected is null
        }
    }, [selected, data]);
    const handleSelect = (item) => {
        setSelectedItems([item]);
        if (onSelect) onSelect(item);
        setModalVisible(false);
        if (onClose) onClose();
    };
    const isSelected = (item) => selectedItems.some(i => i.value === item.value);

    return (
        <View style={{ marginBottom: hp(2) }}>
            {/* Label */}
            {<Text style={styles.label}>{title}</Text>}
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
                            ListHeaderComponent={() => (
                                <>
                                    {/* {<Text style={[
                                        {
                                            paddingHorizontal: wp(4), paddingVertical: hp(1),
                                            fontSize: wp(6), fontWeight: "600", fontFamily: "Poppins_400Regular",}
                                    ]}>{'choose_priority'}</Text>} */}
                                </>
                            )}
                            renderItem={({ item }) => {
                                const config = getPriorityConfig(item.label);
                                const selected = isSelected(item);

                                return (
                                    <Pressable
                                        style={[styles.item, selected && {
                                            backgroundColor: config.color + "20",
                                        }]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "center", }}>
                                            <Icon
                                                type="feather"
                                                name={config.icon} // Make sure icon exists in your library
                                                size={wp(7)}
                                                color={config.color}
                                                style={{backgroundColor: config.color + "20", borderRadius: wp(10), padding: wp(2) }}
                                            />
                                            <Text
                                                style={[
                                                    styles.itemText,
                                                    { color: config.color, fontWeight: selected ? "700" : "400" }
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>



                                    </Pressable>
                                );
                            }}
                            contentContainerStyle={{ paddingVertical: hp(1) }}
                        />



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
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        borderWidth: 1, borderColor: "#CCC", borderRadius: wp(1),
        padding: wp(3), backgroundColor: "#fff",
    }, modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        paddingHorizontal: wp(10),
    },
    modalContent: {
        backgroundColor: "#fff", borderRadius: wp(2),
        maxHeight: hp(50), width: wp(95), alignSelf: "center",
        position: "absolute", bottom: hp(7),
    },
    item: {
        paddingVertical: hp(1.5), paddingHorizontal: wp(4),
        borderBottomWidth: 1, borderBottomColor: "#eee", flexDirection: "row",
        justifyContent: "space-between", alignItems: "center",
    }, itemSelected: {
    },
    itemText: {
        fontSize: wp(6),
        fontFamily: "Poppins_400Regular",
        textTransform: "capitalize",
        marginLeft: wp(3), lineHeight: wp(8),
    },
});