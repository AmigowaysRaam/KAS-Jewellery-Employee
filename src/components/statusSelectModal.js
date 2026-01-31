import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View
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

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={closeModal}
        >
            {/* Overlay */}
            <Pressable style={styles.overlay} onPress={closeModal} />
            {/* Bottom Sheet */}
            <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
                {/* Handle */}
                <View style={styles.header}>
                    {/* <Pressable style={styles.closeBtn} onPress={() =>
                        Alert.alert("jkhjkhjkh")}>
                        <Ionicons name="close" size={wp(8)} color="#333" />
                    </Pressable> */}
                </View>
                {/* Title */}
                <Text style={styles.title}>{t("select_status")}</Text>

                {/* Status Options */}
                <View style={styles.optionsContainer}>
                    {statuses.length === 0 ? (
                        <Text style={styles.empty}>{t("no_status_available")}</Text>
                    ) : (
                        statuses.map((status, index) => (
                            <Pressable
                                key={index}
                                style={styles.option}
                                onPress={() => {
                                    onSelect?.(status?.value);
                                    closeModal();
                                }}
                            >
                                <Text style={styles.optionText}>
                                    {status?.label || status?.name || status}
                                </Text>
                            </Pressable>
                        ))
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
        position: "absolute", bottom: 0,
        width: "100%", backgroundColor: "#fff", borderTopLeftRadius: wp(5),
        borderTopRightRadius: wp(5), paddingHorizontal: wp(4),
        paddingBottom: hp(4), paddingTop: hp(2),
    },
    header: {
        flexDirection: "row", justifyContent: "center",
        alignItems: "center",
        paddingVertical: wp(2)

    },
    handle: {
        width: wp(12), height: hp(0.6), backgroundColor: "#ccc",
        borderRadius: wp(3),

    },
    closeBtn: {
        position: "absolute", right: 0,
        top: hp(1.6),
    },
    title: {
        fontSize: wp(4.6), fontFamily: "Poppins_600SemiBold",
        color: COLORS.primary,
        marginBottom: hp(2),
    }, optionsContainer: {

    }, option: {
        paddingVertical: hp(1.8), borderBottomWidth: 1, width: wp(90),
        borderColor: "#eee", paddingHorizontal: wp(2)
    }, optionText: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold", color: "#333",
        textAlign: "center",
    },
    empty: {
        textAlign: "center",
        color: "#999",
        paddingVertical: hp(2),
        fontFamily: "Poppins_400Regular",
    },
});
