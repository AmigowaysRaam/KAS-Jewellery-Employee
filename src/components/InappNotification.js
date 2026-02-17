import React, { useEffect, useRef } from "react";
import {
    Animated, Easing, Image, Modal, StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function InAppNotificationModal({
    visible,
    onClose,
    title,
    message,
    onPress,
}) {
    const slideAnim = useRef(new Animated.Value(hp(40))).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const timerRef = useRef(null);

    const bellIcon = require("../../assets/notifi.png");

    useEffect(() => {
        if (visible) {
            // Entrance animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto close after 3 seconds
            timerRef.current = setTimeout(() => {
                onClose && onClose();
            }, 3000);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [visible]);
    return (
        <Modal transparent visible={visible} animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.header}>
                                <Image source={bellIcon} style={styles.icon} />
                                <Text style={styles.title}>
                                    {title || "New Notification"}
                                </Text>
                            </View>

                            {/* Body */}
                            <Text style={styles.message}>
                                {message || "You have received a new notification."}
                            </Text>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        width: "100%", backgroundColor: COLORS.primary,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22, padding: 20, minHeight: hp(40),
    },
    header: {
        alignItems: "center", marginBottom: 12,
    }, icon: {
        width: wp(50), height: wp(40),
        resizeMode: "contain", marginBottom: 6,
    },
    title: {
        fontSize: 18, fontWeight: "700", color: COLORS.white,
        textAlign: "center", fontFamily: "Poppins_700Bold",
    }, message: {
        fontSize: 14, color: "#fff",
        lineHeight: 22,
        marginBottom: 20, textAlign: "center", fontFamily: "Poppins_400Regular",
    }, buttonRow: {
        flexDirection: "row", justifyContent: "center",
    }, primaryBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12,
    },
    primaryText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
        fontFamily: "Poppins_600SemiBold",
    },
});
