import React, { useEffect, useState } from "react";
import {
    Animated,
    Easing,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function CustomDropdownData({
    title = "",             // NEW: Modal title
    data = [],
    onSelect,
    selectedItem = null,
    renderItemStyle = {},
    textStyle = {},
    isVisible = false,
    onClose,
    animationDuration = 200,
}) {
    const [fadeAnim] = useState(new Animated.Value(0));

    // Animate modal fade-in/out
    useEffect(() => {
        if (isVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: animationDuration,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: animationDuration,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const handleSelect = (item) => {
        if (onSelect) onSelect(item); // send data back to parent
        if (onClose) onClose();
    };
    const onCloseN = () => {
        if (onClose) onClose();
    }

    const isSelected = (item) => selectedItem?.value === item.value;

    return (
        <Modal
            transparent
            visible={isVisible}
            animationType="none"
            onRequestClose={() => onCloseN()}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => onCloseN()}
            >
                <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
                    {/* Header with Title and Close Button */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </Pressable>
                    </View>

                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Pressable
                                style={[styles.item, renderItemStyle, isSelected(item) && styles.itemSelected]}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={[styles.itemText, textStyle, isSelected(item) && { fontWeight: "700", color: COLORS.primary }]}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        )}
                        contentContainerStyle={{ paddingVertical: hp(1) }}
                    />
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(2),
        maxHeight: hp(60),
        width: wp(95),
        alignSelf: "center",
        paddingVertical: hp(1),
        elevation: 5,
        position: 'absolute',
        bottom: hp(4)
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    title: {
        fontSize: wp(4.7),
        fontFamily: "Poppins_600SemiBold",
        color: COLORS?.primary,
    },
    closeButton: {
        padding: wp(2),
        backgroundColor: COLORS?.primary + '20',
        padding: wp(1), borderRadius: wp(4), paddingHorizontal: wp(2.2)
    },
    closeText: {
        fontSize: wp(5),
        fontWeight: "700",
        color: COLORS?.primary,

    },
    item: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    itemSelected: {
        backgroundColor: COLORS.primary + "20",
    },
    itemText: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold"
    },
});
