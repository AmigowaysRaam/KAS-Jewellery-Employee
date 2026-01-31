import React, { createContext, useContext, useRef, useState } from "react";
import {
    Animated, Image,
    StyleSheet, Text, View,
} from "react-native";
import { hp, wp } from "../app/resources/dimensions";
const appIcon = require("../assets/amigowayslogo.jpg");
const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const slideAnim = useRef(new Animated.Value(-hp(10))).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const showToast = (message, type = "info", duration = 2000) => {
        setToast({ message, type });

        // Show animation
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: hp(6),
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Hide animation
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -hp(10),
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setToast(null));
        }, duration);
    };

    // Background colors by type
    const getBackgroundColor = (type) => {
        switch (type) {
            case "success":
                return "#2ecc71";
            case "error":
                return "#e74c3c";
            default:
                return "#34495e"; // info
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.toast,
                        { backgroundColor: getBackgroundColor(toast.type) },
                        {
                            transform: [{ translateY: slideAnim }],
                            opacity: opacityAnim,
                        },
                    ]}
                >
                    <Image source={appIcon} style={styles.icon} />
                    <View style={styles.textContainer}>
                        <Text numberOfLines={2} style={styles.text}>
                            {toast.message}
                        </Text>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};
const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        top: hp(4),
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(5),
        paddingVertical: hp(1.2),
        borderRadius: wp(12),
        zIndex: 9999,
        maxWidth: wp(90),
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    textContainer: {
        flexShrink: 1,
    },
    text: {
        color: "#fff",
        fontSize: wp(3.6),
        fontFamily: "Poppins_400Regular",
        lineHeight: wp(5.5),
    },
    icon: {
        width: wp(7),
        height: wp(7),
        borderRadius: wp(3.5),
        marginRight: wp(3),
        resizeMode: "cover",
    },
});
