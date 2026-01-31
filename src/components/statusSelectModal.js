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
        }).start(onClose);
    };

    const renderOption = ({ item }) => (
        <Pressable
            style={({ pressed }) => [
                styles.option,
                pressed && { backgroundColor: "#f0f0f0" },
            ]}
            onPress={() => {
                onSelect?.(item?.value);
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
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                {/* Handle for better UX */}
                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                <Text style={styles.title}>{t("select_status")}</Text>

                <View style={styles.optionsContainer}>
                    {statuses.length === 0 ? (
                        <Text style={styles.empty}>{t("no_status_available")}</Text>
                    ) : (
                        <FlatList
                            data={statuses}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderOption}
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
        borderTopLeftRadius: wp(6),
        borderTopRightRadius: wp(6),
        paddingHorizontal: wp(5),
        paddingBottom: hp(4),
        paddingTop: hp(2.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    handleContainer: {
        alignItems: "center",
        marginBottom: hp(1.5),
    },
    handle: {
        width: wp(12),
        height: hp(0.7),
        backgroundColor: "#ccc",
        borderRadius: wp(3),
    },
    title: {
        fontSize: wp(4.6),
        fontFamily: "Poppins_600SemiBold",
        color: COLORS.primary,
        textAlign: "center",
        marginBottom: hp(2.5),
    },
    optionsContainer: {
        maxHeight: hp(50),
    },
    option: {
        paddingVertical: hp(1),
        borderBottomWidth: 1,
        borderColor: "#eee",
        borderRadius: wp(2),
        marginVertical: hp(0.5),
        paddingHorizontal: wp(2.5),
    },
    optionText: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
        color: "#333",
        textAlign: "center",
    },
    empty: {
        textAlign: "center",
        color: "#999",
        paddingVertical: hp(2),
        fontFamily: "Poppins_400Regular",
    },
});
