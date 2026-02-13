import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function StatusSelectModal({
    visible,
    statuses = [],
    onSelect,
    onClose,
}) {
    const { t } = useTranslation();
    const translateY = useRef(new Animated.Value(hp(100))).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 280,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const closeModal = () => {
        Animated.timing(translateY, {
            toValue: hp(100),
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            onClose?.();
        });
    };

    const renderOption = ({ item }) => (
        <Pressable
            style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
            ]}
            onPress={() => {
                onSelect?.(item?.value || item);
                closeModal();
            }}
        >
            <Text style={styles.optionText}>
                {item?.label || item?.name || item}
            </Text>
        </Pressable>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={closeModal}
        >
            <Pressable style={styles.overlay} onPress={closeModal} />

            <Animated.View
                style={[styles.sheet, { transform: [{ translateY }] }]}
            >
                {/* Handle */}
                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>
                        {t("select_status")}
                    </Text>

                    <Pressable
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={closeModal}
                    >
                        <Icon name="close" size={wp(6)} color="#fff" />
                    </Pressable>
                </View>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {statuses.length === 0 ? (
                        <Text style={styles.empty}>
                            {t("no_status_available")}
                        </Text>
                    ) : (
                        <FlatList
                            data={statuses}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderOption}
                            showsVerticalScrollIndicator={false}
                            bounces={false}
                        />
                    )}
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },

    sheet: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: wp(7),
        borderTopRightRadius: wp(7),
        paddingHorizontal: wp(5),
        paddingBottom: hp(4),
        paddingTop: hp(2),
        elevation: 20,
    },

    handleContainer: {
        alignItems: "center",
        marginBottom: hp(1.5),
    },

    handle: {
        width: wp(14),
        height: hp(0.7),
        backgroundColor: "#ddd",
        borderRadius: wp(3),
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: hp(2),
    },

    title: {
        fontSize: wp(4.8),
        fontFamily: "Poppins_600SemiBold",
        color: COLORS.primary,
    },

    closeButton: {
        width: wp(9),
        height: wp(9),
        borderRadius: wp(4.5),
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },

    optionsContainer: {
        maxHeight: hp(50),
    },
    option: {
        paddingVertical: hp(1.4),
        paddingHorizontal: wp(3),
        borderRadius: wp(3),
        marginBottom: hp(1),
        backgroundColor: "#f7f9fc",
    },
    optionPressed: {
        backgroundColor: "#e6f0ff",
    },
    optionText: {
        fontSize: wp(4.9),
        fontFamily: "Poppins_500Medium",
        color: "#333",
        // textAlign: "center",
    },

    empty: {
        textAlign: "center",
        color: "#999",
        paddingVertical: hp(3),
        fontFamily: "Poppins_400Regular",
    },
});
