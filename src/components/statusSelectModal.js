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
    currentStatus
}) {
    const { t } = useTranslation();
    const translateY = useRef(new Animated.Value(hp(100))).current;

    // Map status to icon and color
    const getStatusStyle = (status) => {
        switch (status) {
            case "Open":
                return {
                    color: "#3498db",
                    icon: "folder-open",
                };
            case "Inprogress":
                return {
                    color: "#f39c12",
                    icon: "autorenew",
                };
            case "Waiting for QC":
                return {
                    color: "#9b59b6",
                    icon: "hourglass-empty",
                };
            case "Completed":
                return {
                    color: "green",
                    icon: "check-circle",
                };
            case "Rework":
                return {
                    color: "#e67e22",
                    icon: "build",
                };
            case "Over Due":
                return {
                    color: "#D32F2F",
                    icon: "error-outline",
                };
            default:
                return {
                    color: COLORS.primary,
                    icon: "help-outline",
                };
        }
    };

    // Animate modal opening
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

    // Render each option
    const renderOption = ({ item }) => {
        const statusLabel = item?.label || item?.name || item;
        const statusValue = item?.value || item;
        const { color, icon } = getStatusStyle(statusLabel);

        const isDisabled = statusLabel === currentStatus;

        return (
            <Pressable
                disabled={isDisabled}
                style={({ pressed }) => [
                    styles.option,
                    pressed && !isDisabled && styles.optionPressed,
                ]}
                onPress={() => {
                    if (!isDisabled) {
                        onSelect?.(statusValue);
                        closeModal();
                    }
                }}
            >
                <View style={styles.optionContent}>
                    <Icon
                        name={icon}
                        size={hp(3)}
                        color={isDisabled ? "#999" : color}
                        style={{ marginRight: wp(3) }}
                    />
                    <Text
                        style={[
                            styles.optionText,
                            {
                                color: isDisabled ? "#999" : COLORS.black,
                                fontSize: isDisabled ? wp(4.2) : wp(5),
                            },
                        ]}
                    >
                        {t(statusLabel)}
                    </Text>
                </View>
            </Pressable>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={closeModal}
        >
            <Pressable style={styles.overlay} onPress={closeModal} />

            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                {/* Handle */}
                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{t("select_status")}</Text>
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
                        <Text style={styles.empty}>{t("no_status_available")}</Text>
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

    optionContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    optionText: {
        fontSize: wp(4.9),
        fontFamily: "Poppins_500Medium",
    },

    empty: {
        textAlign: "center",
        color: "#999",
        paddingVertical: hp(3),
        fontFamily: "Poppins_400Regular",
    },
});
